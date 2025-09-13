import { NextRequest, NextResponse } from 'next/server';
import { getFactForKeyword } from '@/lib/service/factService';
import { getLocalFallbackFact } from '@/lib/fallbackFunFacts/localFallbackFunFacts';
import { logProd } from '@/lib/logProd';

// Add a handler for all methods to debug
export async function OPTIONS(req: NextRequest) {
  logProd('OPTIONS request received to /api/openai');
  return new NextResponse(null, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    logProd('POST request received to /api/openai');
    const ipHeader = req.headers.get('x-forwarded-for');
    const ip = ipHeader ? ipHeader.split(',')[0].trim() : 'local';

    const { keyword } = await req.json();
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
  return NextResponse.json(
    {
      text: 'GET method not allowed. Please use POST with { keyword } in the body.',
    },
    { status: 405 },
  );
}

// Add a catch-all handler for debugging
export async function PUT(req: NextRequest) {
  logProd('PUT request received to /api/openai');
  return NextResponse.json({ error: 'PUT method not allowed' }, { status: 405 });
}

export async function DELETE(req: NextRequest) {
  logProd('DELETE request received to /api/openai');
  return NextResponse.json({ error: 'DELETE method not allowed' }, { status: 405 });
}

export async function PATCH(req: NextRequest) {
  logProd('PATCH request received to /api/openai');
  return NextResponse.json({ error: 'PATCH method not allowed' }, { status: 405 });
}
