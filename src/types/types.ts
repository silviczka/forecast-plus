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
/** Geocoding API result item (subset used by weather route). */
export type GeocodingResultItem = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  feature_code?: string;
};

export type Suggestion = {
  name: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  /**
   * Admin level 3 name from GeoNames (e.g. city district).
   * admin1 = state/region, admin2 = county, admin3 = district – we use admin3 to show
   * the familiar name (e.g. "Helsinki") when the API returns an alternate (e.g. "Helsingfors").
   */
  admin3?: string;
  /** GeoNames feature_code: PPLC=capital, PPL=place, MT=mountain, AIRP=airport, etc. */
  feature_code?: string;
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
