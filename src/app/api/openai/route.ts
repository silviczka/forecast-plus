import { NextRequest, NextResponse } from 'next/server';
import { getFactForKeyword } from '@/lib/service/factService';
import { getLocalFallbackFact } from '@/lib/fallbackFunFacts/localFallbackFunFacts';
import { logProd } from '@/lib/logProd';

export async function POST(req: NextRequest) {
  try {
    const ipHeader = req.headers.get('x-forwarded-for');
    const ip = ipHeader ? ipHeader.split(',')[0].trim() : 'local';

    const { keyword } = await req.json();

    const factData = await getFactForKeyword(ip, keyword);
    return NextResponse.json(factData);
  } catch (err) {
    logProd('Unexpected error:', err);
    return NextResponse.json(
      { text: getLocalFallbackFact('global'), rateLimited: false },
      { status: 200 },
    );
  }
}
export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      text: 'GET method not allowed. Please use POST with { keyword } in the body.',
    },
    { status: 405 },
  );
}
