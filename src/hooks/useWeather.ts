import { useEffect, useState } from 'react';
import axios from 'axios';
import { logProd } from '@/lib/logProd';

export function useWeather(city: string, country: string) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `/api/weather?city=${encodeURIComponent(city)}${
            country ? `&country=${encodeURIComponent(country)}` : ''
          }`,
        );
        setData(res.data);
        setError(null);
      } catch (err) {
        logProd(
          `Weather fetch error for city="${city}", country="${country}":`,
          err,
        );
        setError('Failed to load weather data');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city, country]);

  return { data, error, loading };
}
