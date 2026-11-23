import { NextRequest, NextResponse } from 'next/server';
import { getFactForKeyword } from '@/lib/service/factService';
import { getLocalFallbackFact } from '@/lib/local/localFallbackFunFacts';
import { logProd } from '@/lib/logProd';
import { isAllowedFactKeyword } from '@/lib/allowlist';

export async function POST(req: NextRequest) {
  try {
    logProd('POST request received to /api/openai');
    logProd(`Request URL: ${req.url}`);
    logProd(`Request method: ${req.method}`);

    const ipHeader = req.headers.get('x-forwarded-for');
    const ip = ipHeader ? ipHeader.split(',')[0].trim() : 'local';

    const { keyword } = await req.json();

    // Allowlist: only keywords the page itself generates ever reach OpenAI (blocks prompt injection)
    if (!isAllowedFactKeyword(keyword)) {
      return NextResponse.json({ error: 'Unknown keyword' }, { status: 400 });
    }
    logProd('Keyword received:', keyword);

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
  logProd('GET request received to /api/openai - this should not happen');
  logProd(`Request URL: ${req.url}`);
  logProd(`Request method: ${req.method}`);

  return NextResponse.json(
    {
      text: 'GET method not allowed. Please use POST with { keyword } in the body.',
    },
    { status: 405 },
  );
}

export async function OPTIONS(req: NextRequest) {
  logProd('OPTIONS request received to /api/openai');
  return new NextResponse(null, { status: 200 });
}
