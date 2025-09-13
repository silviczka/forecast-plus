import { logProd } from '@/lib/logProd';
import { useEffect, useState } from 'react';

export default function WeatherFunFact({ keyword }: { keyword: string }) {
  const [fact, setFact] = useState<string>('');
  const [lastKeyword, setLastKeyword] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Prevent duplicate fetch if keyword hasn't changed
    if (!keyword || keyword === lastKeyword) return;

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

  return (
    <div className="flex flex-col h-auto sm:h-40 w-full sm:w-120 items-center justify-start p-2">
      <h2 className="text-xl font-semibold mb-2 mt-1">Fun Fact:</h2>

      <div className="mt-2 text-white w-full px-4 text-center">
        {loading ? (
          <div className="h-25 bg-gray-700 rounded animate-pulse mx-auto" />
        ) : (
          fact && <p className=" flex-wrap  text-white">{fact}</p>
        )}
      </div>
    </div>
  );
}
