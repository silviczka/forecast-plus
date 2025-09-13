'use client';

import WeatherIcon from './WeatherIcon';

export default function WeatherCard({
  temperature,
  humidity,
  keyword,
  location,
  loading,
}: WeatherCardProps) {
  function Spinner() {
    return (
      <div className="flex justify-center items-center mt-6">
        <div className="w-8 h-8 border-4 border-gray-400-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg shadow-gray-900/50 rounded-xl p-6 border border-gray-700 hover:shadow-xl hover:shadow-gray-900/60 transition-all duration-300">
      {/* Header with weather icon , location and condition */}
      {loading ? (
        <Spinner />
      ) : (
        <h2 className="font-semibold py-2" role="heading" aria-level={2}>
          {location}
        </h2>
      )}
      <div
        className="flex items-center justify-center mb-4"
        aria-label={keyword}
        role="img"
      >
        <WeatherIcon keyword={keyword} size="lg" />
      </div>

      {/* Weather data */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4 p-3 bg-gray-700/50 rounded-lg">
          <span className="text-2xl">🌡️</span>
          <div className="flex-1">
            <span className="text-gray-300 text-sm block">Temperature</span>
            <p className="text-white text-xl font-bold">{temperature} °C</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Current</div>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-3 bg-gray-700/50 rounded-lg">
          <span className="text-2xl">💧</span>
          <div className="flex-1">
            <span className="text-gray-300 text-sm block">Humidity</span>
            <p className="text-white text-xl font-bold">{humidity} %</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Relative</div>
          </div>
        </div>
      </div>
    </div>
  );
}
