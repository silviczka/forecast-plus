import { weatherCodeMap } from './weatherCodeMap';

export function getWeatherKeywords(weatherData: ApiResponse | null) {
  if (!weatherData) return { display: 'Weather', search: 'Weather' };

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
  const search = `${mappedKeyword} ${timeOfDay}`; // for Giphy and AI search

  return { display, search };
}
