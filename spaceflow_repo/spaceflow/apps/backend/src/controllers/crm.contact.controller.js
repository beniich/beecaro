const { body, query, validationResult } = require('express-validator');
const { prisma } = require('../config/database');

const TYPE_LABELS = {
  LEAD: 'Lead', PROSPECT: 'Prospect', CUSTOMER: 'Client', PARTNER: 'Partenaire', VENDOR: 'Fournisseur'
};

exports.create = [
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('email').optional({ checkFalsy: true }).isEmail(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const orgId = req.crm.organizationId;

      // Verifier limite plan
      const org = await prisma.cRMOrganization.findUnique({ where: { id: orgId } });
      const count = await prisma.cRMContact.count({ where: { organizationId: orgId } });
      if (org.plan === 'FREE' && count >= org.maxContacts) {
        return res.status(402).json({
          error: `Limite atteinte (${org.maxContacts} contacts). Passez au plan superieur.`
        });
      }

      const { tags, ...rest } = req.body;
      const contact = await prisma.cRMContact.create({
        data: {
          ...rest,
          tags: tags ? JSON.stringify(tags) : null,
          organizationId: orgId,
          ownerId: req.crm.userId
        },
        include: { owner: { select: { firstName: true, lastName: true } } }
      });

      await prisma.cRMActivityLog.create({
        data: {
          organizationId: orgId,
          userId: req.crm.userId,
          action: 'CREATE',
          entity: 'contact',
          entityId: contact.id
        }
      });

      res.status(201).json(contact);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

exports.getAll = async (req, res) => {
  try {
    const { search, type, status, page = 1, limit = 25 } = req.query;
    const orgId = req.crm.organizationId;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { organizationId: orgId };
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } }
      ];
    }
    if (type) where.type = type;
    if (status) where.status = status;

    const [contacts, total, byTypeRaw] = await Promise.all([
      prisma.cRMContact.findMany({
        where,
        include: {
          owner: { select: { firstName: true, lastName: true } },
          _count: { select: { deals: true, activities: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.cRMContact.count({ where }),
      prisma.cRMContact.groupBy({
        by: ['type'],
        where: { organizationId: orgId },
        _count: { type: true }
      })
    ]);

    const byType = byTypeRaw.reduce((acc, t) => { acc[t.type] = t._count.type; return acc; }, {});

    res.json({
      contacts,
      pagination: {
        total, page: parseInt(page), limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      stats: { total, byType }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const contact = await prisma.cRMContact.findFirst({
      where: { id: req.params.id, organizationId: req.crm.organizationId },
      include: {
        owner: { select: { firstName: true, lastName: true } },
        deals: { orderBy: { createdAt: 'desc' }, take: 5 },
        activities: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });
    if (!contact) return res.status(404).json({ error: 'Contact introuvable' });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { tags, ...rest } = req.body;
    
    // Check ownership
    const existing = await prisma.cRMContact.findFirst({
      where: { id: req.params.id, organizationId: req.crm.organizationId }
    });
    if (!existing) return res.status(404).json({ error: 'Contact introuvable ou accès refusé' });

    const contact = await prisma.cRMContact.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        tags: tags !== undefined ? JSON.stringify(tags) : undefined,
        updatedAt: new Date()
      }
    });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    // Check ownership
    const existing = await prisma.cRMContact.findFirst({
      where: { id: req.params.id, organizationId: req.crm.organizationId }
    });
    if (!existing) return res.status(404).json({ error: 'Contact introuvable ou accès refusé' });

    await prisma.cRMContact.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const contacts = await prisma.cRMContact.findMany({
      where: { organizationId: req.crm.organizationId },
      include: { owner: { select: { firstName: true, lastName: true } } }
    });

    const headers = ['Prenom', 'Nom', 'Email', 'Telephone', 'Entreprise', 'Poste', 'Type', 'Statut', 'Source', 'Ville', 'Pays', 'Proprietaire', 'Cree le'];
    const rows = contacts.map(c => [
      c.firstName || '',
      c.lastName || '',
      c.email || '',
      c.phone || '',
      c.company || '',
      c.jobTitle || '',
      c.type || '',
      c.status || '',
      c.source || '',
      c.city || '',
      c.country || '',
      c.owner ? `${c.owner.firstName} ${c.owner.lastName}` : '',
      c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : ''
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=contacts-${Date.now()}.csv`);
    res.send('\uFEFF' + csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.importContacts = async (req, res) => {
  try {
    const orgId = req.crm.organizationId;
    const contacts = req.body.contacts; // Array of contact objects
    if (!contacts || !Array.isArray(contacts)) return res.status(400).json({ error: 'Format invalide' });

    // Verifier limite plan
    const org = await prisma.cRMOrganization.findUnique({ where: { id: orgId } });
    const count = await prisma.cRMContact.count({ where: { organizationId: orgId } });
    if (org.plan === 'FREE' && (count + contacts.length) > org.maxContacts) {
      return res.status(402).json({
        error: `Limite atteinte (${org.maxContacts} contacts max). Impossible d'importer ${contacts.length} contacts.`
      });
    }

    const data = contacts.map(c => ({
      firstName: c.firstName || 'Inconnu',
      lastName: c.lastName || 'Inconnu',
      email: c.email || null,
      phone: c.phone || null,
      company: c.company || null,
      jobTitle: c.jobTitle || null,
      type: c.type || 'LEAD',
      status: 'ACTIVE',
      organizationId: orgId,
      ownerId: req.crm.userId
    }));

    await prisma.cRMContact.createMany({ data, skipDuplicates: true });
    
    await prisma.cRMActivityLog.create({
      data: {
        organizationId: orgId,
        userId: req.crm.userId,
        action: 'IMPORT',
        entity: 'contact',
        entityId: 'batch'
      }
    });

    res.json({ message: `${contacts.length} contacts importés avec succès` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

