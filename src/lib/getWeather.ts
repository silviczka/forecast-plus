import axios from 'axios';
import { devOnly } from './devonly';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export async function getWeather(lat: number, lon: number) {
  try {
    const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,precipitation,weather_code`;
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    devOnly(() => console.error('Failed to fetch weather:', err));
    throw err;
  }
}
