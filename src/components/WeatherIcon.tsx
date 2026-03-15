'use client';

import type { WeatherIconProps } from '@/types/types';

export default function WeatherIcon({
  keyword,
  size = 'md',
  className = '',
}: WeatherIconProps) {
  // Use full condition for matching (e.g. "Heavy Rain (day)" → "heavy rain"); strip trailing (day)/(night) etc.
  const conditionWithoutTime = keyword.replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
  const mainCondition = conditionWithoutTime;

  // Size classes
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl',
  };

  // Weather condition to icon mapping
  const getWeatherIcon = (condition: string) => {
    const iconMap: Record<string, { emoji: string; name: string }> = {
      'clear sky': { emoji: '☀️', name: 'Clear Sky' },
      'mainly clear': { emoji: '🌤️', name: 'Mainly Clear' },
      'partly cloudy': { emoji: '⛅', name: 'Partly Cloudy' },
      overcast: { emoji: '☁️', name: 'Overcast' },

      fog: { emoji: '🌫️', name: 'Fog' },
      'depositing rime fog': { emoji: '🌫️', name: 'Rime Fog' },

      'light drizzle': { emoji: '🌦️', name: 'Light Drizzle' },
      'moderate drizzle': { emoji: '🌦️', name: 'Moderate Drizzle' },
      'dense drizzle': { emoji: '🌦️', name: 'Dense Drizzle' },
      'light freezing drizzle': { emoji: '🌨️', name: 'Light Freezing Drizzle' },
      'dense freezing drizzle': { emoji: '🌨️', name: 'Dense Freezing Drizzle' },

      'slight rain': { emoji: '🌧️', name: 'Slight Rain' },
      'moderate rain': { emoji: '🌧️', name: 'Moderate Rain' },
      'heavy rain': { emoji: '🌧️', name: 'Heavy Rain' },
      'light freezing rain': { emoji: '🌨️', name: 'Light Freezing Rain' },
      'heavy freezing rain': { emoji: '🌨️', name: 'Heavy Freezing Rain' },

      'slight snow fall': { emoji: '❄️', name: 'Slight Snowfall' },
      'moderate snow fall': { emoji: '❄️', name: 'Moderate Snowfall' },
      'heavy snow fall': { emoji: '❄️', name: 'Heavy Snowfall' },
      'snow grains': { emoji: '❄️', name: 'Snow Grains' },

      'slight rain showers': { emoji: '🌦️', name: 'Slight Rain Showers' },
      'moderate rain showers': { emoji: '🌦️', name: 'Moderate Rain Showers' },
      'violent rain showers': { emoji: '🌩️', name: 'Violent Rain Showers' },

      'slight snow showers': { emoji: '🌨️', name: 'Slight Snow Showers' },
      'heavy snow showers': { emoji: '🌨️', name: 'Heavy Snow Showers' },

      thunderstorm: { emoji: '⛈️', name: 'Thunderstorm' },
      'thunderstorm with slight hail': {
        emoji: '⛈️',
        name: 'Thunderstorm with Slight Hail',
      },
      'thunderstorm with heavy hail': {
        emoji: '⛈️',
        name: 'Thunderstorm with Heavy Hail',
      },
    };

    // Find the best match (longer keys first so e.g. "heavy freezing rain" matches before "heavy rain")
    const entries = Object.entries(iconMap).sort(([a], [b]) => b.length - a.length);
    for (const [key, value] of entries) {
      if (condition.includes(key)) {
        return value;
      }
    }

    // Default fallback
    return { emoji: '🌤️', name: 'Weather', color: 'text-blue-400' };
  };

  const weatherInfo = getWeatherIcon(mainCondition);

  return (
    <div className={`flex  items-center justify-center ${className}`}>
      {/* Main weather icon with animation */}
      <div
        className={`${sizeClasses[size]} ${weatherInfo} mb-2 transition-all duration-300 hover:scale-110`}
      >
        <div className="relative">
          {weatherInfo.emoji}
          {/* Add subtle animation for certain weather types */}
          {mainCondition.includes('rain') && (
            <div className="absolute inset-0 animate-pulse opacity-30">
              {weatherInfo.emoji}
            </div>
          )}
          {mainCondition.includes('snow') && (
            <div className="absolute inset-0 animate-bounce opacity-50">❄️</div>
          )}
        </div>
      </div>

      {keyword && (
        <div className="text-s text-white/70 text-center">{keyword}</div>
      )}
    </div>
  );
}
