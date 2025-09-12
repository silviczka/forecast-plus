import axios from 'axios';
import { logProd } from './logProd';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export async function getWeather(lat: number, lon: number) {
  try {
    const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,precipitation,weather_code`;
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    logProd(`Failed to fetch weather for lat=${lat}, lon=${lon}:`, err);
    throw err;
  }
}
