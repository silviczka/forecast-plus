import { weatherCodeMap } from './weatherCodeMap';
import type { ApiResponse } from '@/types/types';

/**
 * Everyday word for the GIF search. GIPHY is tagged by people, not meteorologists:
 * "overcast night" finds nothing, "cloudy night" finds plenty.
 */
export function getGifTerm(code: number): string {
  if (code <= 1) return 'clear';
  if (code <= 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'thunderstorm';
  if (code >= 51 && code <= 82) return 'rain'; // drizzle, rain, freezing rain, showers
  return 'weather';
}

export function getWeatherKeywords(weatherData: ApiResponse | null) {
  if (!weatherData)
    return { display: 'Weather', search: 'Weather', gifQuery: 'weather', gifTerm: 'weather' };

  const now = new Date();
  const localHour = now.getHours();
  let timeOfDay = '';
  if (localHour >= 5 && localHour < 9) {
    timeOfDay = 'morning';
  } else if (localHour >= 9 && localHour < 18) {
    timeOfDay = 'day';
  } else if (localHour >= 18 && localHour < 21) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }
  const capitalizeWords = (str: string) =>
    str.replace(/\b\w/g, (c) => c.toUpperCase());

  const code = weatherData.weather.hourly.weather_code?.[localHour] ?? 0;
  const mappedKeyword = capitalizeWords(weatherCodeMap[code] || 'Weather');

  const display = `${mappedKeyword} (${timeOfDay})`; // for WeatherCard
  const search = `${mappedKeyword} ${timeOfDay}`; // for AI fun fact
  const gifTerm = getGifTerm(code);
  const gifQuery = `${gifTerm} ${timeOfDay}`; // for GIPHY, e.g. "cloudy night"

  return { display, search, gifQuery, gifTerm };
}
