'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { getWeatherKeywords } from '@/lib/weatherKeywords';
import { logProd } from '@/lib/logProd';

export default function GiphyDisplay({ weatherData }: WeatherDataProps) {
  const [selectedGif, setSelectedGif] = useState<Gif | null>(null);
  const [keyword, setKeyword] = useState<string>('weather');

  useEffect(() => {
    if (!weatherData) return;

    const { search } = getWeatherKeywords(weatherData);
    setKeyword(search);

    const fetchGifs = async () => {
      try {
        const giphyQuery = `${search.replace(/[()]/g, '')} weather`;
        const res = await axios.get(
          `/api/giphy?q=${encodeURIComponent(giphyQuery)}&limit=25`,
        );
        const gifs: Gif[] = res.data.gifs || [];

        if (gifs.length > 0) {
          const randomIndex = Math.floor(Math.random() * gifs.length);
          setSelectedGif(gifs[randomIndex]);
        } else {
          setSelectedGif(null);
        }
      } catch (err) {
        logProd(`Failed to fetch Giphy GIFs for query="${search}":`, err);
      }
    };

    fetchGifs();
  }, [weatherData]);

  if (!selectedGif) return null;

  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <div className="flex justify-center gap-2 overflow-x-auto">
        <img
          src={selectedGif.url}
          alt={selectedGif.title || 'Weather GIF'}
          className="h-50 0 w-auto  rounded object-cover"
          // loading="lazy"
        />
      </div>
      <p className="text-xs font-size mb-2">(Powered by GIPHY)</p>
    </div>
  );
}
