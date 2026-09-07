"use server";

import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function createSpace(data: {
  name: string;
  type: string;
  floor: number;
  area: number;
  capacity: number;
  buildingId: string;
}) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error('Non autorisé');
  }

  // Vérifier si le bâtiment appartient bien au tenant
  const building = await prisma.building.findUnique({
    where: { id: data.buildingId, tenantId: orgId }
  });

  if (!building) {
    throw new Error('Bâtiment introuvable ou non autorisé');
  }

  const space = await prisma.space.create({
    data: {
      ...data,
    }
  });

  revalidatePath('/spaces');
  return space;
}

export async function deleteSpace(id: string) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error('Non autorisé');
  }

  const space = await prisma.space.findUnique({
    where: { id },
    include: { building: true }
  });

  if (!space || space.building.tenantId !== orgId) {
    throw new Error('Espace non autorisé');
  }

  await prisma.space.delete({ where: { id } });
  revalidatePath('/spaces');
}
