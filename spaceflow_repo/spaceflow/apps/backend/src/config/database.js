const { PrismaClient } = require('@prisma/client');
const { AsyncLocalStorage } = require('async_hooks');

const tenantContext = new AsyncLocalStorage();

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query, model, operation }) {
        const tenantId = tenantContext.getStore();
        
        // Exclude operations that don't need tenantId or models that don't have it
        const modelsWithoutTenantId = ['Tenant', 'TenantDomain']; // Example, extend as needed
        
        if (tenantId && !modelsWithoutTenantId.includes(model)) {
          if (operation === 'create' || operation === 'createMany') {
            // Force tenantId on creation
            if (args.data) {
              if (Array.isArray(args.data)) {
                args.data = args.data.map(d => ({ ...d, tenantId }));
              } else {
                args.data.tenantId = tenantId;
              }
            }
          } else if (['findUnique', 'findFirst', 'findMany', 'update', 'updateMany', 'delete', 'deleteMany', 'count'].includes(operation)) {
            // Auto filter by tenantId
            args.where = { ...args.where, tenantId };
          }
        }
        
        return query(args);
      }
    }
  }
});

// Export both prisma and the context to wrap requests
module.exports = { prisma, tenantContext };
