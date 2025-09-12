import { NextResponse } from 'next/server';
import axios from 'axios';
import { logProd } from '@/lib/logProd';

const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

export async function GET(req: Request) {
  if (!GIPHY_API_KEY) {
    return NextResponse.json(
      { gifs: [], error: 'GIPHY API key not set' },
      { status: 500 },
    );
  }
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('q') || 'weather';

  try {
    const res = await axios.get('https://api.giphy.com/v1/gifs/search', {
      params: {
        api_key: GIPHY_API_KEY,
        q: keyword,
        limit: 5,
        rating: 'pg', // safe content
      },
    });

    const gifs: Gif[] = res.data.data.map((g: GiphyItem) => ({
      id: g.id,
      url: g.images.fixed_height.url,
      title: g.title,
    }));

    return NextResponse.json({ gifs });
  } catch (err) {
    logProd('Giphy fetch error:', err);

    return NextResponse.json({ gifs: [] }, { status: 500 });
  }
}
