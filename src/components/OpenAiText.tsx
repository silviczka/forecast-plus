import { devOnly } from '@/lib/devonly';
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
        const res = await fetch('/api/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword }),
        });
        const data = await res.json();
        setFact(data.text);
        setLastKeyword(keyword);
      } catch (err) {
        devOnly(() => console.error(err));
      } finally {
        setLoading(false);
      }
    };

    fetchFact();
  }, [keyword, lastKeyword]);

  return (
    <div className="mt-2 italic text-white w-full sm:w-1/2 max-w-md text-center">
      {loading ? (
        <div className="h-20 bg-gray-700 rounded animate-pulse mx-auto" />
      ) : (
        fact && <p className="italic text-white">{fact}</p>
      )}
    </div>
  );
}
