const { prisma } = require('../config/database');

exports.createCrudController = (modelName, options = {}) => {
  const model = prisma[modelName];
  const {
    tenantScoped = true,
    searchable = [],
    sortable = ['createdAt', 'id'],
    defaultSort = { id: 'desc' },
    relations = {},
    softDelete = true
  } = options;

  return {
    list: async (req, res, next) => {
      try {
        const page = req.pagination?.page || 1;
        const limit = req.pagination?.limit || 25;
        const skip = (page - 1) * limit;
        const { sort, search, ...filters } = req.query;

        const where = {};
        
        if (tenantScoped && req.user?.orgId) {
          where.tenantId = req.user.orgId;
        }

        if (search && searchable.length) {
          where.OR = searchable.map(field => ({
            [field]: { contains: search, mode: 'insensitive' }
          }));
        }

        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== '' && key !== 'page' && key !== 'limit') {
            where[key] = value;
          }
        }

        if (softDelete && model.fields?.deletedAt) {
          where.deletedAt = null;
        }

        let orderBy;
        try {
          if (sort) {
            orderBy = JSON.parse(sort);
            const keys = Object.keys(orderBy);
            const validKey = keys.find(k => sortable.includes(k));
            if (!validKey) orderBy = defaultSort;
          } else {
            orderBy = defaultSort;
          }
        } catch {
          orderBy = defaultSort;
        }

        const [items, total] = await Promise.all([
          model.findMany({
            where,
            take: limit,
            skip,
            orderBy,
            include: Object.keys(relations).length ? relations : undefined
          }),
          model.count({ where })
        ]);

        res.json({
          data: items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: skip + limit < total,
            hasPrev: skip > 0
          }
        });
      } catch (error) {
        next(error);
      }
    },

    getById: async (req, res, next) => {
      try {
        const where = { id: req.params.id };
        if (tenantScoped && req.user?.orgId) where.tenantId = req.user.orgId;
        if (softDelete && model.fields?.deletedAt) where.deletedAt = null;

        const item = await model.findFirst({ 
          where, 
          include: Object.keys(relations).length ? relations : undefined 
        });
        
        if (!item) {
          return res.status(404).json({ 
            error: 'NOT_FOUND', 
            message: `${modelName} non trouvé` 
          });
        }
        
        res.json({ data: item });
      } catch (error) {
        next(error);
      }
    },

    create: async (req, res, next) => {
      try {
        const data = { ...req.body };
        
        if (tenantScoped && req.user?.orgId) {
          data.tenantId = req.user.orgId;
          // data.createdById = req.user.id;
        }

        const item = await model.create({ 
          data, 
          include: Object.keys(relations).length ? relations : undefined 
        });
        
        res.status(201).json({ data: item });
      } catch (error) {
        next(error);
      }
    },

    update: async (req, res, next) => {
      try {
        const where = { id: req.params.id };
        if (tenantScoped && req.user?.orgId) where.tenantId = req.user.orgId;

        const item = await model.update({
          where,
          data: {
            ...req.body,
            // updatedById: req.user.id,
            updatedAt: new Date()
          },
          include: Object.keys(relations).length ? relations : undefined
        });

        res.json({ data: item });
      } catch (error) {
        if (error.code === 'P2025') {
          return res.status(404).json({ 
            error: 'NOT_FOUND', 
            message: `${modelName} non trouvé` 
          });
        }
        next(error);
      }
    },

    delete: async (req, res, next) => {
      try {
        const where = { id: req.params.id };
        if (tenantScoped && req.user?.orgId) where.tenantId = req.user.orgId;

        if (softDelete && model.fields?.deletedAt) {
          await model.update({
            where,
            data: { 
              deletedAt: new Date(),
              // deletedById: req.user.id
            }
          });
        } else {
          await model.delete({ where });
        }

        res.status(204).send();
      } catch (error) {
        if (error.code === 'P2025') {
          return res.status(404).json({ error: 'NOT_FOUND' });
        }
        next(error);
      }
    }
  };
};
