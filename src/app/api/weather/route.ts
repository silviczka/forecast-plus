import { NextResponse } from 'next/server';
import axios from 'axios';
import { getWeather } from '@/lib/getWeather';
import { logProd } from '@/lib/logProd';
import type { GeocodingResultItem } from '@/types/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'Prague'; // default fallback
  const country = searchParams.get('country') || 'Czechia';

  try {
    // Geocode city name - lat/lon
    const geoRes = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=en`,
    );

    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      return NextResponse.json(
        { error: `City "${city}" not found` },
        { status: 404 },
      );
    }

    const results: GeocodingResultItem[] = geoRes.data.results ?? [];

    const countryMatch = (r: GeocodingResultItem) =>
      r.country.toLowerCase() === country.toLowerCase();
    const exactMatch = (r: GeocodingResultItem) =>
      countryMatch(r) &&
      r.name.toLowerCase() === city.toLowerCase();
    const isCapital = (r: GeocodingResultItem) => r.feature_code === 'PPLC';

    let match: GeocodingResultItem | undefined;

    if (country) {
      const inCountry = results.filter(countryMatch);
      // Exact match first so user's choice is respected (e.g. "Praha" mountain vs "Prague" capital)
      match = inCountry.find((r) => exactMatch(r));
      // No exact match (e.g. "Helsinki" but API returned "Helsingfors") → prefer capital
      if (!match) {
        match = inCountry.find(isCapital) ?? inCountry[0];
      }
    }
    if (!match) {
      match = results.find(exactMatch) ?? results[0];
    }

    const { latitude, longitude, name, country: matchCountry } = match;

    // Get weather for that location
    const weatherData = await getWeather(latitude, longitude);

    return NextResponse.json({
      location: { name, country: matchCountry, latitude, longitude },
      weather: weatherData,
    });
  } catch (err) {
    logProd(`Weather API error for city="${city}", country="${country}":`, err);

    return NextResponse.json(
      { error: 'Failed to fetch weather' },
      { status: 500 },
    );
  }
}
