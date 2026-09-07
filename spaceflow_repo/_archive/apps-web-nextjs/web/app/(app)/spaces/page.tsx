import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import SpacesClient from './SpacesClient';
import { Suspense } from 'react';

export default async function SpacesPage() {
  const { userId, orgId } = await auth();

  if (!userId) redirect('/sign-in');
  
  let buildings = [];
  
  if (orgId) {
    // Fetch buildings and their spaces
    buildings = await prisma.building.findMany({
      where: { tenantId: orgId },
      include: {
        spaces: true,
      },
      orderBy: { name: 'asc' }
    });
  }

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <Suspense fallback={<div className="p-8 text-zinc-500">Chargement des espaces...</div>}>
        <SpacesClient initialBuildings={buildings} />
      </Suspense>
    </div>
  );
}
