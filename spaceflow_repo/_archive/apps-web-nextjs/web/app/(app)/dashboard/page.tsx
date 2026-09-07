import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Si pas d'organisation sélectionnée, on pourrait rediriger vers un sélecteur d'organisation Clerk
  // ou utiliser l'ID par défaut. Pour l'instant on gère le cas sans orgId gracieusement.
  let stats = { assets: 0, workOrders: 0, users: 0 };
  let recentWorkOrders: Awaited<ReturnType<typeof prisma.workOrder.findMany<{ include: { asset: { select: { name: true } } } }>>> = [];

  if (orgId) {
    const [assetsCount, workOrdersCount, tenant] = await Promise.all([
      prisma.asset.count({ where: { tenantId: orgId } }),
      prisma.workOrder.count({ where: { tenantId: orgId } }),
      prisma.tenant.findUnique({ where: { id: orgId }, include: { _count: { select: { users: true } } } }),
    ]);

    stats = {
      assets: assetsCount,
      workOrders: workOrdersCount,
      users: tenant?._count?.users || 0,
    };

    recentWorkOrders = await prisma.workOrder.findMany({
      where: { tenantId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        asset: { select: { name: true } }
      }
    });
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-zinc-400 mb-8">Bienvenue sur BEECARBONIT Serverless</p>

      {!orgId && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl mb-8">
          Veuillez sélectionner ou créer une organisation pour afficher vos données.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="text-zinc-400 text-sm mb-1">Total Assets</div>
          <div className="text-3xl font-bold text-white">{stats.assets}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="text-zinc-400 text-sm mb-1">Work Orders</div>
          <div className="text-3xl font-bold text-white">{stats.workOrders}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="text-zinc-400 text-sm mb-1">Users</div>
          <div className="text-3xl font-bold text-white">{stats.users}</div>
        </div>
      </div>

      {orgId && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Interventions Récentes</h2>
          <div className="space-y-4">
            {recentWorkOrders.length === 0 ? (
              <p className="text-zinc-500 text-sm">Aucune intervention récente.</p>
            ) : (
              recentWorkOrders.map(wo => (
                <div key={wo.id} className="flex justify-between items-center pb-4 border-b border-zinc-800 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{wo.title}</p>
                    <p className="text-sm text-zinc-500">{wo.asset?.name || 'Général'}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    wo.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                    wo.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {wo.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
