'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { getWeatherKeywords } from '@/lib/weatherKeywords';
import { logProd } from '@/lib/logProd';
import type { Gif, WeatherDataProps } from '@/types/types';

export default function GiphyDisplay({ weatherData }: WeatherDataProps) {
  const [selectedGif, setSelectedGif] = useState<Gif | null>(null);
  const [gifUnavailable, setGifUnavailable] = useState(false);

  useEffect(() => {
    if (!weatherData) return;

    setGifUnavailable(false);

    const { gifQuery, gifTerm } = getWeatherKeywords(weatherData);
    // Safety net: if a search finds nothing, try a simpler one ("cloudy night" -> "cloudy" -> "weather")
    const queries = [...new Set([gifQuery, gifTerm, 'weather'])];

    const fetchGifs = async () => {
      try {
        for (const query of queries) {
          const res = await axios.get(`/api/giphy?q=${encodeURIComponent(query)}`);
          const gifs: Gif[] = res.data.gifs || [];
          if (gifs.length > 0) {
            const randomIndex = Math.floor(Math.random() * gifs.length);
            setSelectedGif(gifs[randomIndex]);
            return;
          }
          logProd(`No GIFs for query="${query}", trying a simpler one`);
        }
        // Every search came back empty
        setSelectedGif(null);
        setGifUnavailable(true);
      } catch (err) {
        logProd(`Failed to fetch Giphy GIFs for query="${gifQuery}":`, err);
        setSelectedGif(null);
        setGifUnavailable(true);
      }
    };

    // Defer fetch until after first paint so LCP can be the heading/weather card, not the GIF
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => fetchGifs());
    });
    return () => cancelAnimationFrame(rafId);
  }, [weatherData]);

  if (gifUnavailable) {
    return (
      <div className="mt-3 flex flex-col items-center gap-2 text-center text-white/80 text-sm px-4">
        <p>Weather GIF temporarily unavailable.</p>
        <p className="text-xs">(Powered by GIPHY)</p>
      </div>
    );
  }

  if (!selectedGif) return null;

  return (
    <div className="mt-3 flex flex-col items-center gap-2">
      {/* Fixed-size container reserves space (CLS); object-contain keeps GIF aspect ratio, no stretch/crop; no background */}
      <div className="flex justify-center w-[320px] h-[320px] rounded overflow-hidden">
        <img
          src={selectedGif.url}
          alt={selectedGif.title || 'Weather GIF'}
          width={320}
          height={320}
          className="w-full h-full rounded object-contain object-top"
        />
      </div>
      <p className="text-xs font-size mb-2">(Powered by GIPHY)</p>
    </div>
  );
}
