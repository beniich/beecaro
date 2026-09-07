import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import WorkOrdersClient from './WorkOrdersClient';
import { Suspense } from 'react';

export default async function WorkOrdersPage() {
  const { userId, orgId } = await auth();

  if (!userId) redirect('/sign-in');
  
  let workOrders: Awaited<ReturnType<typeof prisma.workOrder.findMany>> = [];
  let assets: { id: string; name: string; code: string }[] = [];
  
  if (orgId) {
    workOrders = await prisma.workOrder.findMany({
      where: { tenantId: orgId },
      include: {
        asset: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // On fetch aussi la liste des assets pour le formulaire de création
    assets = await prisma.asset.findMany({
      where: { tenantId: orgId },
      select: { id: true, name: true, code: true }
    });
  }

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <Suspense fallback={<div className="p-8 text-zinc-500">Chargement des interventions...</div>}>
        <WorkOrdersClient initialWorkOrders={workOrders} availableAssets={assets} />
      </Suspense>
    </div>
  );
}
