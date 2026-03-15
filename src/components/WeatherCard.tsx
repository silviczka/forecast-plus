'use client';

import WeatherIcon from './WeatherIcon';
import type { WeatherCardProps } from '@/types/types';

export default function WeatherCard({
  temperature,
  humidity,
  keyword,
  location,
  loading,
}: WeatherCardProps) {
  const showLoadingState = loading || temperature === null;
  return (
    <div className="w-64 max-w-full mx-auto bg-gradient-to-br from-gray-800/50 to-gray-900/50 shadow-lg shadow-gray-900/50 rounded-xl p-6 hover:shadow-xl hover:shadow-gray-900/60 transition-all duration-300">
      {/* Header: location always shown; loading is indicated by the spinner in the icon area below */}
      <h2 className="font-semibold pb-2" role="heading" aria-level={2}>
        {location}
      </h2>
      {/* Fixed height so loading spinner and weather icon don't cause layout jump */}
      <div
        className="flex flex-col items-center justify-center mb-4 min-h-[5.5rem]"
        aria-label={showLoadingState ? 'Loading' : keyword}
        role="img"
      >
        {showLoadingState ? (
          <div className="flex items-center justify-center gap-3">
            <span
              className="w-8 h-8 border-2 border-white/50 border-t-white rounded-full animate-spin shrink-0"
              aria-hidden
            />
            <span className="text-sm text-white/80">Loading…</span>
          </div>
        ) : (
          <WeatherIcon keyword={keyword} size="lg" />
        )}
      </div>

      {/* Weather data: show value or placeholder when not yet loaded */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4 p-3 bg-gray-700/50 rounded-lg">
          <span className="text-2xl">🌡️</span>
          <div className="flex-1">
            <span className="text-gray-300 text-sm block">Temperature</span>
            <p className="text-white text-xl font-bold">
              {temperature !== null ? (
                `${temperature} °C`
              ) : (
                <span className="invisible" aria-hidden>0 °C</span>
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Current</div>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-3 bg-gray-700/50 rounded-lg">
          <span className="text-2xl">💧</span>
          <div className="flex-1">
            <span className="text-gray-300 text-sm block">Humidity</span>
            <p className="text-white text-xl font-bold">
              {humidity !== null ? (
                `${humidity} %`
              ) : (
                <span className="invisible" aria-hidden>0 %</span>
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Relative</div>
          </div>
        </div>
      </div>
    </div>
  );
}
