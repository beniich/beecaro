const { createCrudController } = require('../lib/crudFactory');
const { body, param, validationResult } = require('express-validator');

const crud = createCrudController('energyConsumption', {
  searchable: ['source', 'type'],
  sortable: ['date', 'value', 'createdAt'],
  defaultSort: { date: 'desc' },
  relations: {
    asset: { select: { name: true } },
    building: { select: { name: true } }
  },
  softDelete: false
});

exports.analyticsValidation = {
  create: [
    body('value').isFloat({ min: 0 }).withMessage('Valeur invalide'),
    body('unit').trim().notEmpty().withMessage('Unité requise'),
    body('type').optional().isIn(['ELECTRICITY', 'WATER', 'GAS', 'CARBON_EQUIV']),
    body('date').isISO8601().withMessage('Date requise (ISO8601)'),
    body('assetId').optional().isUUID(),
    body('buildingId').optional().isUUID()
  ],
  update: [
    param('id').isUUID(),
    body('value').optional().isFloat({ min: 0 })
  ]
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'VALIDATION_FAILED',
      details: errors.array() 
    });
  }
  next();
};

exports.getEnergyData = crud.list;
exports.getById = crud.getById;
exports.create = [
  ...exports.analyticsValidation.create,
  validate,
  crud.create
];
exports.update = [
  ...exports.analyticsValidation.update,
  validate,
  crud.update
];
exports.delete = crud.delete;
