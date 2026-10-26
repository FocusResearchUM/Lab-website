import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { NewsItem, Person, Publication } from './content';

type Content = { news: NewsItem; people: Person; publications: Publication };

export function useContent<K extends keyof Content>(name: K) {
  const [data, setData] = useState<Content[K][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const { pathname } = useLocation();
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    fetch(`/api/${name}`, { signal: controller.signal, cache: 'no-store' })
      .then(response => { if (!response.ok) throw new Error(); return response.json(); })
      .then(items => { if (!controller.signal.aborted) setData(items); })
      .catch(() => { if (!controller.signal.aborted) setError('Unable to load this content. Please try again.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    const refresh = () => setRevision(value => value + 1);
    window.addEventListener('focus', refresh);
    return () => { controller.abort(); window.removeEventListener('focus', refresh); };
  }, [name, pathname, revision]);
  return { data, loading, error, retry: () => setRevision(value => value + 1) };
}

export function ContentStatus({ loading, error, retry }: { loading: boolean; error: string; retry: () => void }) {
  return <div className="container section">{loading ? <p role="status">Loading…</p> : error ? <><p role="alert">{error}</p><button className="button" onClick={retry}>Try again</button></> : null}</div>;
}
