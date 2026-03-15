'use client';

import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import WeatherCard from '@/components/WeatherCard';
import { fetchSuggestions } from '@/lib/geocoding';
import GiphyDisplay from '@/components/GiphyDisplay';
import { getWeatherKeywords } from '@/lib/weatherKeywords';
import WeatherFunFact from '@/components/OpenAiText';
import { useKeyboardNavigation } from '@/hooks/keyboardNav';
import { useWeather } from '@/hooks/useWeather';
import WeatherEffects from '@/components/WeatherEffects';
import { getPlaceTypeInfo } from '@/lib/placeTypeLabel';
import type { Suggestion } from '@/types/types';

const DROPDOWN_CLOSE_MS = 220;

export default function Home() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Prague'); // selected city
  const [country, setCountry] = useState('Czechia');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dropdownClosing, setDropdownClosing] = useState(false);
  const [debouncedQuery] = useDebounce(query, 300); // wait 300ms after typing
  const { data, error, loading } = useWeather(city, country);
  const { display, search } = getWeatherKeywords(data);
  const [skipFetch, setSkipFetch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (skipFetch) {
      setSkipFetch(false);
      return;
    }
    const fetch = async () => {
      if (!debouncedQuery) return setSuggestions([]);
      if (debouncedQuery === `${city}, ${country}`) return setSuggestions([]);

      const results = await fetchSuggestions(debouncedQuery);
      setSuggestions(results);
    };
    fetch();
  }, [debouncedQuery, city, country]);

  const suggestionLabel = (s: Suggestion, q: string) =>
    s.admin3 && q.trim().toLowerCase() === s.admin3.toLowerCase()
      ? s.admin3
      : s.name;

  const handleSelect = (s: Suggestion) => {
    const displayName = suggestionLabel(s, query);
    setCity(displayName);
    setCountry(s.country);
    setQuery(displayName + ', ' + s.country);
    setSkipFetch(true);
    searchInputRef.current?.focus();
    setDropdownClosing(true);
  };

  useEffect(() => {
    if (!dropdownClosing) return;
    const id = setTimeout(() => {
      setSuggestions([]);
      setDropdownClosing(false);
    }, DROPDOWN_CLOSE_MS);
    return () => clearTimeout(id);
  }, [dropdownClosing]);
  const { activeIndex, handleKeyDown } = useKeyboardNavigation(
    suggestions,
    handleSelect,
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-12 pb-12 px-8 bg-gradient-to-r from-blue-700 via-purple-700 to-orange-800 animate-gradient-slow z-0">
      <h1 className="text-3xl font-bold mb-4 ">🌦 Forecast Plus</h1>
      <WeatherEffects weatherKeyword={display} />
      {/* Autocomplete input */}
      <div className="relative w-64 py-5">
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border px-3 py-2 rounded bg-black/30"
          aria-label="Search city for weather forecast"
          placeholder="Enter city"
        />

        {/* Suggestions dropdown: smooth close (collapse + fade) before unmount */}
        {(suggestions.length > 0 || dropdownClosing) && (
          <ul
            className={`absolute bg-gray-800/85 border border-white/10 rounded w-full mt-1 z-10 transition-[max-height,opacity] duration-200 ease-out ${
              dropdownClosing ? 'max-h-0 opacity-0 mt-0 overflow-hidden' : 'max-h-40 opacity-100 overflow-y-auto'
            }`}
            style={{
              scrollbarWidth: 'none',
            }}
            aria-hidden={dropdownClosing}
          >
            {suggestions.map((s, i) => {
              const placeType = getPlaceTypeInfo(s.feature_code);
              return (
                <li
                  key={`${s.name}-${s.country_code}-${s.latitude}-${s.longitude}`}
                >
                  <button
                    onClick={() => handleSelect(s)}
                    className={`px-3 py-2 w-full text-left cursor-pointer flex items-center gap-1.5 ${
                      i === activeIndex ? 'bg-gray-600' : 'hover:bg-gray-700'
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      {suggestionLabel(s, debouncedQuery)}, {s.country}
                    </span>
                    <span
                      className="shrink-0 text-base leading-none"
                      title={placeType.label}
                      aria-label={placeType.label}
                    >
                      {placeType.emoji}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {error && <p className="mt-6 text-red-500">{error}</p>}

      {/* Card and Fun Fact always in place from first paint; values fill in when data loads */}
      <div className="py-2">
        <WeatherCard
          temperature={data ? data.weather.hourly.temperature_2m[0] : null}
          humidity={data ? data.weather.hourly.relative_humidity_2m[0] : null}
          keyword={display}
          location={`${city}, ${country}`}
          loading={loading}
        />
      </div>

      <WeatherFunFact keyword={search} />

      {data && <GiphyDisplay weatherData={data} />}
    </main>
  );
}
