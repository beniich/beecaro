import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: { id: string } };

// GET /api/assets/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { orgId } = auth();
    if (!orgId) return NextResponse.json({ error: 'Organization required' }, { status: 401 });

    const asset = await prisma.asset.findUnique({
      where: { id: params.id, tenantId: orgId },
      include: {
        building: true,
        manager: { select: { firstName: true, lastName: true, email: true } },
        sensors: { include: { readings: { orderBy: { timestamp: 'desc' }, take: 50 } } },
        workOrders: { orderBy: { createdAt: 'desc' }, take: 10 },
        maintenanceLogs: { orderBy: { performedAt: 'desc' }, take: 20 },
      },
    });

    if (!asset) return NextResponse.json({ error: 'Actif non trouvé' }, { status: 404 });
    return NextResponse.json(asset);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/assets/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { orgId } = auth();
    if (!orgId) return NextResponse.json({ error: 'Organization required' }, { status: 401 });

    const body = await req.json();
    const asset = await prisma.asset.update({
      where: { id: params.id, tenantId: orgId },
      data: body,
    });

    return NextResponse.json(asset);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// DELETE /api/assets/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { orgId } = auth();
    if (!orgId) return NextResponse.json({ error: 'Organization required' }, { status: 401 });

    await prisma.asset.delete({ where: { id: params.id, tenantId: orgId } });
    return NextResponse.json({ message: 'Actif supprimé' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
