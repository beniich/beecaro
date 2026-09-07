import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/workorders
export async function GET(req: NextRequest) {
  try {
    const { orgId } = auth();
    if (!orgId) return NextResponse.json({ error: 'Organization required' }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status') ?? undefined;
    const priority = searchParams.get('priority') ?? undefined;
    const assignedToId = searchParams.get('assignedToId') ?? undefined;

    const where: Record<string, unknown> = { tenantId: orgId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;

    const workOrders = await prisma.workOrder.findMany({
      where,
      include: {
        asset: { select: { name: true, category: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(workOrders);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/workorders
export async function POST(req: NextRequest) {
  try {
    const { orgId, userId } = auth();
    if (!orgId || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Find the Prisma User from Clerk userId (via externalId or email)
    // For now we just inject tenantId
    const workOrder = await prisma.workOrder.create({
      data: {
        ...body,
        tenantId: orgId,
        status: body.status ?? 'PENDING',
      },
    });

    return NextResponse.json(workOrder, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
