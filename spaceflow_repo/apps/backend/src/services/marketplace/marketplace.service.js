/**
 * marketplace.service.js — Gestion de la marketplace d'extensions
 * Horizon 3 BeeCarbonat
 *
 * Responsabilités :
 *  - Lister / rechercher les extensions approuvées
 *  - Installer / désinstaller pour un tenant
 *  - Vérifier la signature cryptographique du bundle
 */
const crypto = require('crypto');
const { prisma } = require('../../config/database');

class MarketplaceService {
  /**
   * Liste les extensions approuvées (avec filtres)
   */
  async listExtensions({ category, search, page = 1, limit = 20 } = {}) {
    const where = { status: 'APPROVED' };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [extensions, total] = await Promise.all([
      prisma.marketplaceExtension.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ installCount: 'desc' }, { rating: 'desc' }],
      }),
      prisma.marketplaceExtension.count({ where }),
    ]);

    return { extensions, total, page, limit, pages: Math.ceil(total / limit) };
  }

  /**
   * Installe une extension pour un tenant
   * Vérifie la signature et le passage en sandbox avant installation
   */
  async installExtension(tenantId, extensionId, config = {}) {
    const ext = await prisma.marketplaceExtension.findUnique({
      where: { id: extensionId },
    });

    if (!ext) throw new Error('Extension introuvable');
    if (ext.status !== 'APPROVED') throw new Error('Extension non approuvée');
    if (!ext.sandboxPassed) throw new Error('Extension non validée en sandbox');

    // Vérification signature si disponible
    if (ext.signatureHash && config._bundleContent) {
      const computedHash = crypto
        .createHash('sha256')
        .update(config._bundleContent)
        .digest('hex');
      if (computedHash !== ext.signatureHash) {
        throw new Error('Signature du bundle invalide — installation annulée');
      }
    }

    // Upsert l'installation
    const install = await prisma.extensionInstall.upsert({
      where: { tenantId_extensionId: { tenantId, extensionId } },
      update: { active: true, config, updatedAt: new Date() },
      create: { tenantId, extensionId, config, active: true },
    });

    // Incrémenter le compteur d'installations
    await prisma.marketplaceExtension.update({
      where: { id: extensionId },
      data: { installCount: { increment: 1 } },
    });

    return install;
  }

  /**
   * Désinstalle une extension pour un tenant
   */
  async uninstallExtension(tenantId, extensionId) {
    return prisma.extensionInstall.update({
      where: { tenantId_extensionId: { tenantId, extensionId } },
      data: { active: false },
    });
  }

  /**
   * Retourne les extensions installées et actives pour un tenant
   */
  async getInstalledExtensions(tenantId) {
    return prisma.extensionInstall.findMany({
      where: { tenantId, active: true },
      include: { extension: true },
    });
  }

  /**
   * Soumet une extension pour review (par un développeur tiers)
   */
  async submitExtension(data) {
    const { name, slug, description, category, version, authorName, authorEmail, repoUrl } = data;

    // Calcule un hash du bundle si fourni
    const signatureHash = data.bundleContent
      ? crypto.createHash('sha256').update(data.bundleContent).digest('hex')
      : null;

    return prisma.marketplaceExtension.create({
      data: {
        name,
        slug,
        description,
        category,
        version,
        authorName,
        authorEmail,
        repoUrl,
        signatureHash,
        status: 'PENDING',
        sandboxPassed: false,
      },
    });
  }
}

module.exports = new MarketplaceService();
