// Simple in-memory cache
let _cache = null;
let _cacheT = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

const DEFAULT_FEED = 'https://news.google.com/rss/search?q=real+estate&hl=en-US&gl=US&ceid=US:en';

export async function getFeed(req, res) {
  try {
    const now = Date.now();
    if (_cache && now - _cacheT < CACHE_TTL) {
      return res.json({ ok: true, source: 'cache', items: _cache });
    }

    const feedUrl = DEFAULT_FEED;

    const resp = await fetch(feedUrl);
    if (!resp.ok) return res.status(502).json({ ok: false, message: 'Upstream fetch failed' });
    const xml = await resp.text();

    // Very small XML parsing without external deps: extract <item> blocks and inner tags
    const itemMatches = Array.from(xml.matchAll(/<item[\s\S]*?<\/item>/gi)).map(m => m[0]).slice(0, 10);
    const items = itemMatches.map((block) => {
      const title = (block.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
      const link = (block.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || '';
      const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1] || '';
      const description = (block.match(/<description>([\s\S]*?)<\/description>/i) || [])[1] || '';
      return { title: title.trim(), link: link.trim(), pubDate: pubDate.trim(), description: description.trim() };
    });

    _cache = items;
    _cacheT = Date.now();

    return res.json({ ok: true, source: 'remote', items });
  } catch (err) {
    console.error('news feed error', err?.message || err);
    return res.status(500).json({ ok: false, message: 'Internal error fetching feed' });
  }
}
