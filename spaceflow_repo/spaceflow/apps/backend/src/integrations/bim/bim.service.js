const { prisma } = require('../../config/database');
const ifcParser = require('./ifc.parser');

class BIMService {
  async importIFCModel(buildingId, tenantId, fileBuffer, fileName) {
    const parsed = await ifcParser.parseIFC(fileBuffer, fileName);

    // Transaction pour inserer le modele, les elements et les proprietes
    const model = await prisma.$transaction(async (tx) => {
      const modelRecord = await tx.bIMModel.create({
        data: {
          name: parsed.name,
          fileUrl: `/uploads/bim/${fileName}`,
          buildingId,
          tenantId
        }
      });

      for (const el of parsed.elements) {
        const elementRecord = await tx.bIMElement.create({
          data: {
            modelId: modelRecord.id,
            ifcId: el.ifcId,
            name: el.name,
            type: el.type,
            spaceId: el.spaceId
          }
        });

        if (el.properties && el.properties.length > 0) {
          await tx.bIMProperty.createMany({
            data: el.properties.map(p => ({
              elementId: elementRecord.id,
              set: p.set,
              name: p.name,
              value: p.value
            }))
          });
        }
      }

      return modelRecord;
    });

    return this.getModelDetails(model.id);
  }

  async getModelDetails(modelId) {
    return prisma.bIMModel.findUnique({
      where: { id: modelId },
      include: {
        elements: {
          include: {
            properties: true,
            asset: true
          }
        }
      }
    });
  }

  async getModelsByBuilding(buildingId) {
    return prisma.bIMModel.findMany({
      where: { buildingId },
      include: {
        _count: { select: { elements: true } }
      }
    });
  }

  async linkElementToAsset(elementId, assetId) {
    return prisma.bIMElement.update({
      where: { id: elementId },
      data: { assetId },
      include: { asset: true }
    });
  }
}

module.exports = new BIMService();
