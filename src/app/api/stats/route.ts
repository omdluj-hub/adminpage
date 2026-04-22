import { NextRequest, NextResponse } from 'next/server';
import { getRecentVisits } from '@/lib/stats';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const visits = await getRecentVisits(limit);
    return NextResponse.json(visits);
  } catch (err) {
    console.error('Stats API Error:', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
