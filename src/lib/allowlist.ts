import { weatherCodeMap } from './weatherCodeMap';
import { getGifTerm } from './weatherKeywords';

/*
 * Allowlists (security): the only values the page itself can ever send to our API.
 * The API routes refuse anything else, so visitor-written text never reaches OpenAI
 * (no prompt injection, no oversized prompts, no junk Redis keys) or GIPHY (no free search on our key).
 *
 * Built from weatherCodeMap and getGifTerm, the same sources the page uses,
 * so adding a weather type updates the allowlists automatically.
 */

const TIMES_OF_DAY = ['morning', 'day', 'evening', 'night'];

const capitalizeWords = (str: string) =>
  str.replace(/\b\w/g, (c) => c.toUpperCase());

const withTimes = (words: string[]) =>
  words.flatMap((word) => TIMES_OF_DAY.map((time) => `${word} ${time}`));

// "Light Rain evening", "Weather night", ...
const weatherNames = [...Object.values(weatherCodeMap), 'weather'].map(capitalizeWords);
const ALLOWED_FACT_KEYWORDS = new Set(withTimes(weatherNames));

// "cloudy night", "cloudy", "weather", ...
const gifTerms = [
  ...new Set([...Object.keys(weatherCodeMap).map((code) => getGifTerm(Number(code))), 'weather']),
];
const ALLOWED_GIF_QUERIES = new Set([...gifTerms, ...withTimes(gifTerms)]);

/** True only for fun-fact keywords the page generates, e.g. "Light Rain evening". */
export function isAllowedFactKeyword(value: unknown): value is string {
  return typeof value === 'string' && ALLOWED_FACT_KEYWORDS.has(value);
}

/** True only for GIF searches the page generates, e.g. "cloudy night" or "cloudy". */
export function isAllowedGifQuery(value: unknown): value is string {
  return typeof value === 'string' && ALLOWED_GIF_QUERIES.has(value);
}
