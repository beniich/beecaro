const { createCrudController } = require('../lib/crudFactory');
const { body, param, validationResult } = require('express-validator');

const crud = createCrudController('building', {
  searchable: ['name', 'address', 'city'],
  sortable: ['name', 'createdAt'],
  defaultSort: { name: 'asc' },
  relations: {},
  softDelete: false
});

exports.buildingValidation = {
  create: [
    body('name').trim().isLength({ min: 1, max: 150 }).withMessage('Nom requis'),
    body('address').optional().trim().isLength({ max: 255 }),
    body('city').optional().trim().isLength({ max: 100 }),
    body('zipCode').optional().trim().isLength({ max: 20 }),
    body('country').optional().trim().isLength({ max: 100 })
  ],
  update: [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 1, max: 150 })
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

exports.getAll = crud.list;
exports.getById = crud.getById;
exports.create = [
  ...exports.buildingValidation.create,
  validate,
  crud.create
];
exports.update = [
  ...exports.buildingValidation.update,
  validate,
  crud.update
];
exports.delete = crud.delete;
