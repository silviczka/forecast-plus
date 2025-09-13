type ApiResponse = {
  location: { name: string; country: string };
  weather: {
    hourly: {
      temperature_2m: number[];
      relative_humidity_2m: number[];
      weather_code: number[];
    };
  };
};
type Suggestion = {
  name: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
};

type WeatherDataProps = {
  weatherData: ApiResponse | null;
};

type Gif = {
  id: string;
  url: string;
  title: string;
};

type WeatherCardProps = {
  temperature: number;
  humidity: number;
  keyword: string;
  location: string;
  loading: boolean;
};
type RateLimitEntry = { count: number; windowStart: number };

interface GiphyItem {
  id: string;
  images: {
    fixed_height: { url: string };
  };
  title: string;
}
interface WeatherIconProps {
  keyword: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}
interface WeatherEffectsProps {
  weatherKeyword: string; // the text from getWeatherKeywords
}
