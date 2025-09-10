'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import WeatherCard from '@/components/WeatherCard';
import { fetchSuggestions } from '@/lib/geocoding';
import GiphyDisplay from '@/components/GiphyDisplay';
import { getWeatherKeywords } from '@/lib/weatherKeywords';
import WeatherFunFact from '@/components/OpenAiText';
import { useKeyboardNavigation } from '@/hooks/keyboardNav';
import { useWeather } from '@/hooks/useWeather';

export default function Home() {
  const [query, setQuery] = useState('Prague');
  const [city, setCity] = useState('Prague'); // selected city
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [debouncedQuery] = useDebounce(query, 300); // wait 300ms after typing

  const { data, error, loading } = useWeather(city);
  const { display, search } = getWeatherKeywords(data);

  useEffect(() => {
    const fetch = async () => {
      if (!debouncedQuery) return setSuggestions([]);
      if (debouncedQuery === city) return setSuggestions([]);

      const results = await fetchSuggestions(debouncedQuery);
      setSuggestions(results);
    };
    fetch();
  }, [debouncedQuery, city]);

  const handleSelect = (s: Suggestion) => {
    setCity(s.name);
    setQuery(s.name);
    setSuggestions([]);
  };
  const { activeIndex, handleKeyDown } = useKeyboardNavigation(
    suggestions,
    handleSelect,
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">🌦 Forecast Plus</h1>

      {/* Autocomplete input */}
      <div className="relative w-64">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border px-3 py-2 rounded"
          aria-label="Search city for weather forecast"
          placeholder="Enter city"
        />

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <ul
            className="absolute bg-gray-800 border rounded w-full mt-1 max-h-40 overflow-y-auto z-10"
            style={{
              scrollbarWidth: 'none',
            }}
          >
            {suggestions.map((s, i) => (
              <li
                key={`${s.name}-${s.country_code}-${s.latitude}-${s.longitude}`}
              >
                <button
                  onClick={() => handleSelect(s)}
                  className={`px-3 py-2 w-full text-left cursor-pointer ${
                    i === activeIndex ? 'bg-gray-600' : 'hover:bg-gray-700'
                  }`}
                >
                  {s.name}, {s.country}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && <p className="mt-6">Loading...</p>}
      {error && <p className="mt-6 text-red-500">{error}</p>}

      {data && (
        <>
          <h2 className="text-xl font-semibold mb-2 mt-6">
            {data.location.name}, {data.location.country}
          </h2>
          <WeatherCard
            temperature={data.weather.hourly.temperature_2m[0]}
            humidity={data.weather.hourly.relative_humidity_2m[0]}
            keyword={display}
          />
          <h2 className="text-xl font-semibold mb-2 mt-6">Fun Fact:</h2>
          <WeatherFunFact keyword={search} />
          <GiphyDisplay weatherData={data} />
        </>
      )}
    </main>
  );
}
