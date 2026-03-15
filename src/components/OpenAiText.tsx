import { logProd } from '@/lib/logProd';
import { useEffect, useState } from 'react';

export default function WeatherFunFact({ keyword }: { keyword: string }) {
  const [fact, setFact] = useState<string>('');
  const [lastKeyword, setLastKeyword] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Don't fetch for the default "Weather" placeholder (no data yet) – avoids flash on reload when real keyword loads
    if (!keyword || keyword === lastKeyword || keyword === 'Weather') return;

    const fetchFact = async () => {
      setLoading(true);
      setFact(''); // reset while loading
      try {
        logProd(`Attempting to fetch fact for keyword: "${keyword}"`);
        const res = await fetch('/api/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword }),
        });

        logProd(`Response status: ${res.status} for keyword: "${keyword}"`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setFact(data.text);
        setLastKeyword(keyword);
      } catch (err) {
        logProd(`Failed to fetch fun fact for keyword="${keyword}":`, err);
        // Don't reset lastKeyword on error - let it retry when keyword changes
      } finally {
        setLoading(false);
      }
    };

    fetchFact();
  }, [keyword, lastKeyword]);

  /* Fixed height to fit ~4 lines of OpenAI text; GIF below stays in place. Scroll only if fact is longer. */
  return (
    <div className="flex flex-col w-full sm:w-120 items-center justify-start p-2 h-[10.5rem]">
      <h2 className="text-xl font-semibold mb-2 mt-1 shrink-0">Fun Fact:</h2>

      <div className="mt-2 text-white w-full px-4 text-center min-h-0 flex-1 overflow-y-auto">
        {!loading && fact && <p className="flex-wrap text-white leading-snug">{fact}</p>}
      </div>
    </div>
  );
}
