export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const parsedUrl = new URL(url);
    const allowedHosts = ['i1.sndcdn.com', 'i2.sndcdn.com', 'i3.sndcdn.com', 'i4.sndcdn.com'];
    if (!allowedHosts.includes(parsedUrl.hostname)) {
      return res.status(403).json({ error: 'Host not allowed' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch image' });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600');
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > 8_000_000) {
      return res.status(413).json({ error: 'Image too large' });
    }
    return res.status(200).send(buffer);

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
