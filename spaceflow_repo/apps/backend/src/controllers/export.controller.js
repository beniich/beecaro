const { prisma } = require('../config/database');
const pdfService = require('../services/pdf.service');

exports.exportWorkOrderPdf = async (req, res) => {
  try {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: req.params.id },
      include: {
        asset: true,
        assignedTo: true,
        createdBy: true
      }
    });

    if (!workOrder) return res.status(404).json({ error: 'Ordre de travail non trouvé' });

    const pdfBuffer = await pdfService.generateWorkOrderReport(workOrder);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=workorder-${workOrder.id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.exportInventoryPdf = async (req, res) => {
  try {
    const parts = await prisma.part.findMany({
      orderBy: { name: 'asc' }
    });

    const pdfBuffer = await pdfService.generateInventoryReport(parts);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=inventaire-pieces.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
