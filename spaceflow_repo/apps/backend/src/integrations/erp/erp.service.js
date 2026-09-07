const { prisma } = require('../../config/database');
const SAPConnector = require('./connectors/sap.connector');
const OracleConnector = require('./connectors/oracle.connector');
const DynamicsConnector = require('./connectors/dynamics.connector');
const OdooConnector = require('./connectors/odoo.connector');

class ERPService {
  getConnector(connection) {
    switch (connection.type) {
      case 'SAP': return new SAPConnector(connection);
      case 'ORACLE': return new OracleConnector(connection);
      case 'DYNAMICS': return new DynamicsConnector(connection);
      case 'ODOO': return new OdooConnector(connection);
      default: throw new Error(`Unsupported ERP: ${connection.type}`);
    }
  }

  async syncConnection(connectionId, options = {}) {
    const startTime = Date.now();
    const log = await prisma.eRPSyncLog.create({
      data: {
        connectionId,
        type: options.type || 'FULL_SYNC',
        status: 'PENDING',
        startedAt: new Date(),
        triggeredBy: options.triggeredBy || 'MANUAL'
      }
    });

    const connection = await prisma.eRPConnection.findUnique({ where: { id: connectionId } });
    if (!connection) throw new Error('Connexion non trouvee');

    const connector = this.getConnector(connection);
    const stats = { created: 0, updated: 0, failed: 0, errors: [] };

    try {
      // ============== PULL ASSETS ==============
      if (connection.syncAssets) {
        try {
          const erpAssets = await connector.fetchAssets();
          for (const erpAsset of erpAssets) {
            try {
              const existing = await prisma.eRPAssetMapping.findFirst({
                where: { connectionId, erpAssetId: erpAsset.externalId }
              });

              if (existing) {
                // Update mapping/asset
                await prisma.asset.update({
                  where: { id: existing.cafmAssetId },
                  data: {
                    name: erpAsset.name,
                    serialNumber: erpAsset.serialNumber || `ERP-${erpAsset.externalId}`,
                    manufacturer: erpAsset.manufacturer || 'ERP',
                    purchasePrice: erpAsset.cost || 0,
                    updatedAt: new Date()
                  }
                });
                stats.updated++;
              } else {
                // Create new asset
                const building = await this.getDefaultBuilding(connection.tenantId);
                const newAsset = await prisma.asset.create({
                  data: {
                    tenantId: connection.tenantId,
                    name: erpAsset.name,
                    category: erpAsset.category || 'HVAC',
                    serialNumber: erpAsset.serialNumber || `ERP-${erpAsset.externalId}`,
                    purchasePrice: erpAsset.cost || 0,
                    purchaseDate: erpAsset.acquisitionDate || new Date(),
                    location: erpAsset.location || 'ERP',
                    buildingId: building.id,
                    status: 'OPERATIONAL'
                  }
                });
                await prisma.eRPAssetMapping.create({
                  data: {
                    connectionId,
                    cafmAssetId: newAsset.id,
                    erpAssetId: erpAsset.externalId,
                    syncDirection: 'PULL'
                  }
                });
                stats.created++;
              }
            } catch (err) {
              stats.failed++;
              stats.errors.push({ asset: erpAsset.externalId, error: err.message });
            }
          }
        } catch (err) {
          stats.errors.push({ phase: 'assets', error: err.message });
        }
      }

      // ============== PULL INVOICES ==============
      if (connection.syncInvoices) {
        try {
          const invoices = await connector.fetchInvoices();
          for (const inv of invoices) {
            await prisma.eRPInvoice.upsert({
              where: { 
                connectionId_invoiceNumber: { 
                  connectionId, 
                  invoiceNumber: inv.name || inv.invoiceNumber 
                } 
              },
              update: { amount: inv.amount, status: inv.status || 'PENDING' },
              create: {
                connectionId,
                invoiceNumber: inv.name || inv.invoiceNumber || 'INV-' + Math.floor(Math.random()*100000),
                vendor: inv.partner || 'Unknown Vendor',
                amount: inv.amount || 0,
                invoiceDate: inv.date || new Date()
              }
            });
          }
        } catch (err) {
          stats.errors.push({ phase: 'invoices', error: err.message });
        }
      }

      // Update connection stats
      const duration = Date.now() - startTime;
      await prisma.eRPConnection.update({
        where: { id: connectionId },
        data: {
          lastSyncAt: new Date(),
          lastError: stats.errors.length > 0 ? JSON.stringify(stats.errors[0]) : null,
          totalSynced: { increment: stats.created + stats.updated },
          status: stats.errors.length > 0 && stats.created === 0 && stats.updated === 0 ? 'ERROR' : 'ACTIVE'
        }
      });

      await prisma.eRPSyncLog.update({
        where: { id: log.id },
        data: {
          status: stats.failed > 0 ? 'PARTIAL' : 'SUCCESS',
          recordsProcessed: stats.created + stats.updated + stats.failed,
          recordsCreated: stats.created,
          recordsUpdated: stats.updated,
          recordsFailed: stats.failed,
          errors: stats.errors.length > 0 ? JSON.stringify(stats.errors) : null,
          duration,
          completedAt: new Date()
        }
      });

      return { success: true, stats, duration };
    } catch (error) {
      await prisma.eRPSyncLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          errors: JSON.stringify([{ fatal: error.message }]),
          completedAt: new Date(),
          duration: Date.now() - startTime
        }
      });
      throw error;
    }
  }

  async pushWorkOrderToERP(connectionId, workOrder) {
    const connection = await prisma.eRPConnection.findUnique({ where: { id: connectionId } });
    const connector = this.getConnector(connection);
    
    const mapping = await prisma.eRPAssetMapping.findFirst({
      where: { connectionId, cafmAssetId: workOrder.assetId }
    });

    const result = await connector.pushWorkOrder({
      ...workOrder,
      assetExternalId: mapping?.erpAssetId
    });

    return result;
  }

  async getDefaultBuilding(tenantId) {
    let building = await prisma.building.findFirst({ where: tenantId ? { tenantId } : {} });
    if (!building) {
      building = await prisma.building.create({
        data: {
          tenantId,
          name: 'Batiment ERP',
          address: 'Importe',
          city: 'N/A',
          country: 'N/A',
          totalArea: 0,
          floors: 1,
          yearBuilt: 2020
        }
      });
    }
    return building;
  }
}

module.exports = new ERPService();
