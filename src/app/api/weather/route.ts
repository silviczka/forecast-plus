import { NextResponse } from 'next/server';
import axios from 'axios';
import { getWeather } from '@/lib/getWeather';
import { devOnly } from '@/lib/devonly';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'Prague'; // default fallback
  const country = searchParams.get('country') || 'Czechia';

  try {
    // Geocode city name - lat/lon
    const geoRes = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10`,
    );

    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      return NextResponse.json(
        { error: `City "${city}" not found` },
        { status: 404 },
      );
    }

    let match;
    if (country) {
      match = geoRes.data.results.find(
        (r: Suggestion) =>
          r.name.toLowerCase() === city.toLowerCase() &&
          r.country.toLowerCase() === country.toLowerCase(),
      );
    }

    const { latitude, longitude, name, country: matchCountry } = match;

    // Get weather for that location
    const weatherData = await getWeather(latitude, longitude);

    return NextResponse.json({
      location: { name, country: matchCountry, latitude, longitude },
      weather: weatherData,
    });
  } catch (err) {
    devOnly(() => console.error(err));

    return NextResponse.json(
      { error: 'Failed to fetch weather' },
      { status: 500 },
    );
  }
}
