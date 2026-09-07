"use server";

import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function createAsset(data: {
  name: string;
  serialNumber?: string;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  manufacturer?: string;
  model?: string;
}) {
  const { userId, orgId } = await auth();

  if (!userId) {
    throw new Error('Non autorisé');
  }

  if (!orgId) {
    throw new Error('Organisation requise');
  }

  const asset = await prisma.asset.create({
    data: {
      ...data,
      tenantId: orgId,
    },
  });

  // Revalider le cache de la page des assets pour afficher le nouvel actif
  revalidatePath('/assets');

  return asset;
}

export async function deleteAsset(id: string) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error('Non autorisé');
  }

  await prisma.asset.delete({
    where: {
      id,
      tenantId: orgId, // Sécurité RLS
    }
  });

  revalidatePath('/assets');
}
