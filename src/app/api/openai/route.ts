import { NextRequest, NextResponse } from 'next/server';
import { getFactForKeyword } from '@/lib/service/factService';
import { getLocalFallbackFact } from '@/lib/fallbackFunFacts/localFallbackFunFacts';
import { devOnly } from '@/lib/devonly';

export async function POST(req: NextRequest) {
  try {
    const ipHeader = req.headers.get('x-forwarded-for');
    const ip = ipHeader ? ipHeader.split(',')[0].trim() : 'local';

    const { keyword } = await req.json();

    const factData = await getFactForKeyword(ip, keyword);
    return NextResponse.json(factData);
  } catch (err) {
    devOnly(() => console.error('Unexpected error:', err));
    return NextResponse.json(
      { text: getLocalFallbackFact('global'), rateLimited: false },
      { status: 200 },
    );
  }
}
