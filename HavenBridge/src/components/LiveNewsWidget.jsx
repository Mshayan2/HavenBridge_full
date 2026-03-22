import React, { useEffect, useState } from 'react';
import { NEWS_RSS_FEED } from '../data/constants';

const CACHE_KEY = 'liveNews_cache_v1';
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

function parseRSS(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  const items = Array.from(doc.querySelectorAll('item')).slice(0, 6);
  return items.map((it) => ({
    title: it.querySelector('title')?.textContent || '',
    link: it.querySelector('link')?.textContent || it.querySelector('guid')?.textContent || '#',
    pubDate: it.querySelector('pubDate')?.textContent || '',
    source: it.querySelector('source')?.textContent || '',
    description: it.querySelector('description')?.textContent || ''
  }));
}

const LiveNewsWidget = ({ feedUrl = NEWS_RSS_FEED, maxItems = 5 }) => {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // Try cache first
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.t < CACHE_TTL) {
          setItems(parsed.v.slice(0, maxItems));
          setLoading(false);
          return;
        }
      }
    } catch (_e) {
      // ignore cache errors
      if (import.meta.env.DEV) console.debug('liveNews cache read error', _e);
    }

    async function fetchFeed() {
      setLoading(true);
      setError(null);
      try {
        // If feedUrl points to the app backend (starts with /api), resolve absolute backend base
        let fetchUrl = feedUrl;
        if (typeof fetchUrl === 'string' && fetchUrl.startsWith('/api')) {
          const rawBase = import.meta.env.VITE_API_BASE || '';
          // strip trailing /api from VITE_API_BASE if present to get origin
          const backendBase = rawBase.replace(/\/api\/?$/i, '') || `${window.location.protocol}//${window.location.hostname}:5000`;
          fetchUrl = backendBase + fetchUrl;
        }

        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error('Network response not ok');
        const text = await res.text();
        const parsed = parseRSS(text).slice(0, maxItems);
        if (cancelled) return;
        setItems(parsed);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), v: parsed }));
        } catch (_e) {
          if (import.meta.env.DEV) console.debug('liveNews cache write error', _e);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Failed to load feed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFeed();

    return () => { cancelled = true; };
  }, [feedUrl, maxItems]);

  if (loading) return (
    <div className="rounded-lg p-4 bg-gray-50 border border-gray-100 mb-6">
      <div className="text-sm text-gray-500">Loading latest market updates...</div>
    </div>
  );

  if (error || !items) return (
    <div className="rounded-lg p-4 bg-yellow-50 border border-yellow-100 mb-6">
      <div className="text-sm text-yellow-800">Could not load live updates. ({error || 'No data'})</div>
    </div>
  );

  return (
    <div className="rounded-lg p-4 bg-white border border-gray-100 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold">Latest market updates</h4>
        {
          (() => {
            let viewHref = feedUrl;
            if (typeof viewHref === 'string' && viewHref.startsWith('/api')) {
              const rawBase = import.meta.env.VITE_API_BASE || '';
              const backendBase = rawBase.replace(/\/api\/?$/i, '') || `${window.location.protocol}//${window.location.hostname}:5000`;
              viewHref = backendBase + viewHref;
            }
            return (
              <a className="text-xs text-teal-600 hover:underline" href={viewHref} target="_blank" rel="noreferrer">View feed</a>
            );
          })()
        }
      </div>

      <ul className="space-y-3">
        {items.map((it, idx) => (
          <li key={idx} className="text-sm">
            <a href={it.link} target="_blank" rel="noreferrer" className="font-medium text-gray-900 hover:text-teal-600">
              {it.title}
            </a>
            <div className="text-xs text-gray-500">{it.pubDate && new Date(it.pubDate).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveNewsWidget;
