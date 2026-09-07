import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AssetsClient from './AssetsClient';
import { Suspense } from 'react';

export default async function AssetsPage() {
  const { userId, orgId } = await auth();

  if (!userId) redirect('/sign-in');
  
  let assets: Awaited<ReturnType<typeof prisma.asset.findMany>> = [];
  
  if (orgId) {
    assets = await prisma.asset.findMany({
      where: { tenantId: orgId },
      include: {
        building: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Pour l'instant on garde la hiérarchie MOCK côté client pour la démo
  // car l'ancienne version utilisait un MOCK_HIERARCHY.
  // Les vrais assets de la DB seront injectés dans le composant client.

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <Suspense fallback={<div className="p-8 text-zinc-500">Chargement des équipements...</div>}>
        <AssetsClient initialAssets={assets} />
      </Suspense>
    </div>
  );
}
