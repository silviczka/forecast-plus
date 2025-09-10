'use client';

export default function WeatherCard({
  temperature,
  humidity,
  keyword,
}: WeatherCardProps) {
  function capitalizeWords(str: string) {
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return (
    <div className="bg-gray-800 shadow-lg shadow-gray-900/50 rounded-xl p-4">
      <h2 className="text-xl font-semibold">{capitalizeWords(keyword)}</h2>
      <p>🌡️ Temperature: {temperature} °C</p>
      <p>💧 Humidity: {humidity} %</p>
    </div>
  );
}
