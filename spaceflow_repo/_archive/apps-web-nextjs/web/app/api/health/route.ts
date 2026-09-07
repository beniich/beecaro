import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/health — Health check endpoint (public, no auth)
export async function GET() {
  try {
    // Ping database
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      runtime: 'nextjs-serverless',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ status: 'error', db: 'unreachable' }, { status: 503 });
  }
}
