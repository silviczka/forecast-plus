import { devOnly } from './devonly';

export const fetchSuggestions = async (query: string) => {
  if (!query) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query,
      )}&count=10&language=en&format=json`,
    );
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    devOnly(() => console.error('Failed to fetch suggestions', err));
    return [];
  }
};
