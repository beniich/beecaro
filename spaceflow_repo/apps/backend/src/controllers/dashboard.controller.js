/**
 * @swagger
 * /api/dashboard/executive:
 *   get:
 *     tags: [Dashboard]
 *     summary: KPIs exécutifs complets
 *     description: Retourne tous les KPIs pour le tableau de bord exécutif
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 365d]
 *           default: 30d
 *       - in: query
 *         name: buildingId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: KPIs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 kpis:
 *                   type: object
 *                   properties:
 *                     assets:
 *                       type: object
 *                       properties:
 *                         total: { type: integer }
 *                         availability: { type: number }
 *                         totalValue: { type: number }
 *                     financial:
 *                       type: object
 *                       properties:
 *                         monthlyRevenue: { type: number }
 *                         roi: { type: number }
 *                     operations:
 *                       type: object
 *                       properties:
 *                         openWorkOrders: { type: integer }
 *                         mttr: { type: number }
 *
 * /api/dashboard/predictions:
 *   get:
 *     tags: [Dashboard]
 *     summary: Prédictions IA sur les pannes
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [failure, energy, occupancy]
 *           default: failure
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Liste des prédictions
 */
const { prisma } = require('../config/database');

/**
 * Récupère tous les KPIs et données pour le tableau de bord
 */
exports.getKPIs = async (req, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // ============== KPIs PRINCIPAUX ==============
    const [
      totalAssets,
      operationalAssets,
      maintenanceAssets,
      breakdownAssets,
      retiredAssets,
      pendingWorkOrders,
      inProgressWorkOrders,
      criticalWorkOrders,
      completedThisMonth,
      activeLeases,
      totalSpaces,
      occupiedSpaces,
      totalMaintenanceCost,
      monthlyMaintenanceCost,
      totalBuildings,
      totalSensors,
      activeSensors
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: 'OPERATIONAL' } }),
      prisma.asset.count({ where: { status: 'MAINTENANCE' } }),
      prisma.asset.count({ where: { status: 'BREAKDOWN' } }),
      prisma.asset.count({ where: { status: 'RETIRED' } }),
      prisma.workOrder.count({ where: { status: 'PENDING' } }),
      prisma.workOrder.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.workOrder.count({
        where: { priority: 'CRITICAL', status: { in: ['PENDING', 'IN_PROGRESS'] } }
      }),
      prisma.workOrder.count({
        where: { status: 'COMPLETED', completedAt: { gte: lastMonth } }
      }),
      prisma.lease.count({ where: { status: 'active' } }),
      prisma.space.count(),
      prisma.space.count({ where: { status: 'occupied' } }),
      prisma.maintenanceLog.aggregate({ _sum: { cost: true } }),
      prisma.maintenanceLog.aggregate({
        where: { performedAt: { gte: lastMonth } },
        _sum: { cost: true }
      }),
      prisma.building.count(),
      prisma.sensor.count(),
      prisma.sensor.count({ where: { status: 'active' } })
    ]);

    // ============== CALCULS DÉRIVÉS ==============
    const assetAvailability = totalAssets > 0 
      ? (operationalAssets / totalAssets) * 100 
      : 0;
    
    const occupancyRate = totalSpaces > 0 
      ? (occupiedSpaces / totalSpaces) * 100 
      : 0;

    const monthlyRevenue = await prisma.lease.aggregate({
      where: { status: 'active' },
      _sum: { monthlyRent: true }
    });

    // Économies estimées (comparaison année précédente)
    const lastYearMaintenance = await prisma.maintenanceLog.aggregate({
      where: {
        performedAt: {
          gte: new Date(now.getFullYear() - 1, now.getMonth(), 1),
          lt: new Date(now.getFullYear() - 1, now.getMonth() + 1, 1)
        }
      },
      _sum: { cost: true }
    });
    
    const savingsRate = lastYearMaintenance._sum.cost > 0
      ? ((lastYearMaintenance._sum.cost - (monthlyMaintenanceCost._sum.cost || 0)) 
         / lastYearMaintenance._sum.cost) * 100
      : 0;

    // ============== DONNÉES POUR GRAPHIQUES ==============
    
    // Tendance des work orders (7 derniers jours)
    const woTrend = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const day = new Date(now);
        day.setDate(day.getDate() - (6 - i));
        day.setHours(0, 0, 0, 0);
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);

        const [created, completed] = await Promise.all([
          prisma.workOrder.count({
            where: { createdAt: { gte: day, lt: nextDay } }
          }),
          prisma.workOrder.count({
            where: { completedAt: { gte: day, lt: nextDay } }
          })
        ]);

        return {
          date: day.toISOString().split('T')[0],
          created,
          completed,
          day: day.toLocaleDateString('fr-FR', { weekday: 'short' })
        };
      })
    );

    // Répartition des actifs par catégorie
    const assetsByCategory = await prisma.asset.groupBy({
      by: ['category'],
      _count: { category: true },
      _avg: { healthScore: true, purchasePrice: true }
    });

    // Statut des actifs
    const assetStatus = [
      { name: 'Opérationnel', value: operationalAssets, color: '#10b981' },
      { name: 'En maintenance', value: maintenanceAssets, color: '#f59e0b' },
      { name: 'En panne', value: breakdownAssets, color: '#ef4444' },
      { name: 'Retiré', value: retiredAssets, color: '#94a3b8' }
    ];

    // Répartition par priorité des work orders
    const workOrdersByPriority = await prisma.workOrder.groupBy({
      by: ['priority'],
      _count: { priority: true },
      where: { status: { in: ['PENDING', 'IN_PROGRESS'] } }
    });

    // ============== CONSOMMATION ÉNERGÉTIQUE (12 mois) ==============
    const energyData = await prisma.energyConsumption.findMany({
      where: { period: { gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) } },
      orderBy: { period: 'asc' }
    });

    const energyByMonth = {};
    energyData.forEach((e) => {
      const key = new Date(e.period).toLocaleDateString('fr-FR', { 
        year: 'numeric', month: 'short' 
      });
      if (!energyByMonth[key]) {
        energyByMonth[key] = { month: key, elec: 0, gas: 0, water: 0, cost: 0, sortDate: e.period };
      }
      energyByMonth[key][e.type === 'electricity' ? 'elec' : e.type] += e.value;
      energyByMonth[key].cost += e.cost;
    });
    const energyConsumption = Object.values(energyByMonth).sort(
      (a, b) => new Date(a.sortDate) - new Date(b.sortDate)
    );

    // ============== LISTES RÉCENTES ==============
    const [recentWorkOrders, upcomingMaintenance, criticalAlerts] = await Promise.all([
      prisma.workOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          asset: { select: { name: true, category: true, location: true } },
          assignedTo: { select: { firstName: true, lastName: true } }
        }
      }),
      prisma.asset.findMany({
        where: { nextMaintenance: { gte: now, lte: sevenDaysFromNow } },
        take: 5,
        orderBy: { nextMaintenance: 'asc' },
        select: {
          id: true, name: true, category: true, location: true,
          nextMaintenance: true, healthScore: true
        }
      }),
      prisma.asset.findMany({
        where: { healthScore: { lt: 40 } },
        take: 5,
        orderBy: { healthScore: 'asc' },
        include: {
          building: { select: { name: true } }
        }
      })
    ]);

    // ============== COÛTS PAR CATÉGORIE ==============
    const costsByCategory = await prisma.maintenanceLog.groupBy({
      by: ['assetId'],
      _sum: { cost: true }
    });
    
    const assetIds = costsByCategory.map(c => c.assetId);
    const assetsForCosts = await prisma.asset.findMany({
      where: { id: { in: assetIds } },
      select: { id: true, category: true }
    });
    
    const categoryCostMap = {};
    costsByCategory.forEach(c => {
      const asset = assetsForCosts.find(a => a.id === c.assetId);
      if (asset) {
        categoryCostMap[asset.category] = (categoryCostMap[asset.category] || 0) + (c._sum.cost || 0);
      }
    });
    const maintenanceCostsByCategory = Object.entries(categoryCostMap).map(([category, cost]) => ({
      category, cost
    }));

    // ============== RÉPONSE FINALE ==============
    res.json({
      kpis: {
        // Actifs
        totalAssets,
        operationalAssets,
        maintenanceAssets,
        breakdownAssets,
        assetAvailability: Math.round(assetAvailability * 10) / 10,
        totalSensors,
        activeSensors,
        // Espaces
        totalSpaces,
        occupiedSpaces,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        totalBuildings,
        // Work orders
        pendingWorkOrders,
        inProgressWorkOrders,
        criticalWorkOrders,
        completedThisMonth,
        // Finances
        totalMaintenanceCost: totalMaintenanceCost._sum.cost || 0,
        monthlyMaintenanceCost: monthlyMaintenanceCost._sum.cost || 0,
        monthlyRevenue: monthlyRevenue._sum.monthlyRent || 0,
        savingsRate: Math.round(savingsRate * 10) / 10,
        // Baux
        activeLeases
      },
      charts: {
        woTrend,
        assetStatus,
        assetsByCategory: assetsByCategory.map(a => ({
          category: a.category,
          count: a._count.category,
          avgHealth: Math.round(a._avg.healthScore || 0),
          totalValue: a._avg.purchasePrice * a._count.category
        })),
        workOrdersByPriority: workOrdersByPriority.map(w => ({
          priority: w.priority,
          count: w._count.priority
        })),
        energyConsumption,
        maintenanceCostsByCategory
      },
      lists: {
        recentWorkOrders,
        upcomingMaintenance,
        criticalAlerts
      }
    });
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Endpoint léger pour rafraîchissement temps réel
 */
exports.getLiveStats = async (req, res) => {
  try {
    const [pending, inProgress, critical, sensors] = await Promise.all([
      prisma.workOrder.count({ where: { status: 'PENDING' } }),
      prisma.workOrder.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.workOrder.count({
        where: { priority: 'CRITICAL', status: { in: ['PENDING', 'IN_PROGRESS'] } }
      }),
      prisma.sensor.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({ pending, inProgress, critical, sensors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
