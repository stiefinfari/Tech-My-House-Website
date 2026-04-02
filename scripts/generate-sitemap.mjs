import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataPath = path.join(root, 'src', 'data.ts');
const outPath = path.join(root, 'public', 'sitemap.xml');

const baseUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://techmyhouse.it').replace(/\/+$/, '');

const src = fs.readFileSync(dataPath, 'utf8');

const artistsBlock = src.match(/export\s+const\s+artists\s*=\s*\[([\s\S]*?)\]\s*;/);
const ids = [];
if (artistsBlock?.[1]) {
  const re = /id:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(artistsBlock[1])) !== null) {
    ids.push(m[1]);
  }
}

const routes = ['/', '/podcast', ...ids.map((id) => `/artist/${id}`)];

const now = new Date().toISOString();
const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes
    .map((p) => {
      const loc = `${baseUrl}${p === '/' ? '/' : p}`;
      return `  <url><loc>${loc}</loc><lastmod>${now}</lastmod></url>`;
    })
    .join('\n') +
  `\n</urlset>\n`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, xml, 'utf8');

