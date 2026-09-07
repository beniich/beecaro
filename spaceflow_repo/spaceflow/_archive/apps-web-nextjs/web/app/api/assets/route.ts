import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/assets — List assets for the authenticated tenant
export async function GET(req: NextRequest) {
  try {
    const { orgId } = auth();
    if (!orgId) return NextResponse.json({ error: 'Organization required' }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const search = searchParams.get('search') ?? undefined;
    const status = searchParams.get('status') ?? undefined;
    const category = searchParams.get('category') ?? undefined;
    const buildingId = searchParams.get('buildingId') ?? undefined;

    const where: Record<string, unknown> = { tenantId: orgId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (category) where.category = category;
    if (buildingId) where.buildingId = buildingId;

    const assets = await prisma.asset.findMany({
      where,
      include: {
        building: { select: { name: true } },
        manager: { select: { firstName: true, lastName: true } },
        sensors: true,
        _count: { select: { workOrders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(assets);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/assets — Create an asset
export async function POST(req: NextRequest) {
  try {
    const { orgId } = auth();
    if (!orgId) return NextResponse.json({ error: 'Organization required' }, { status: 401 });

    const body = await req.json();

    const asset = await prisma.asset.create({
      data: { ...body, tenantId: orgId },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
