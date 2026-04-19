import { useEffect, useMemo } from 'react';
import { SITE } from './site';

type SeoOptions = {
  title?: string;
  description?: string;
  keywords?: string;
  path?: string;
  ogImagePath?: string;
  jsonLd?: unknown;
};

const upsertMeta = (selector: string, attrs: Record<string, string>) => {
  const head = document.head;
  let el = head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    const key = selector.includes('property=') ? 'property' : 'name';
    const m = selector.match(/(?:name|property)="([^"]+)"/);
    if (m?.[1]) el.setAttribute(key, m[1]);
    head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
};

const upsertLink = (rel: string, href: string) => {
  const head = document.head;
  let el = head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    head.appendChild(el);
  }
  el.setAttribute('href', href);
};

export function useSeo(options: SeoOptions) {
  const full = useMemo(() => {
    const title = options.title ? `${options.title} — ${SITE.name}` : SITE.defaultTitle;
    const description = options.description ?? SITE.defaultDescription;
    const keywords = options.keywords ?? SITE.defaultKeywords;
    const url = new URL(options.path ?? '/', SITE.url).toString();
    const ogImage = new URL(options.ogImagePath ?? SITE.ogImagePath, SITE.url).toString();
    return { title, description, keywords, url, ogImage };
  }, [options.description, options.keywords, options.ogImagePath, options.path, options.title]);

  useEffect(() => {
    document.title = full.title;
    upsertLink('canonical', full.url);

    upsertMeta('meta[name="description"]', { content: full.description });
    upsertMeta('meta[name="keywords"]', { content: full.keywords });

    upsertMeta('meta[property="og:site_name"]', { content: SITE.name });
    upsertMeta('meta[property="og:title"]', { content: full.title });
    upsertMeta('meta[property="og:description"]', { content: full.description });
    upsertMeta('meta[property="og:type"]', { content: 'website' });
    upsertMeta('meta[property="og:url"]', { content: full.url });
    upsertMeta('meta[property="og:image"]', { content: full.ogImage });
    upsertMeta('meta[property="og:image:alt"]', { content: 'Tech My House' });

    upsertMeta('meta[name="twitter:card"]', { content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { content: full.title });
    upsertMeta('meta[name="twitter:description"]', { content: full.description });
    upsertMeta('meta[name="twitter:image"]', { content: full.ogImage });
    upsertMeta('meta[name="twitter:image:alt"]', { content: 'Tech My House' });

    const existing = document.getElementById('tmh-jsonld-page');
    if (existing) existing.remove();
    if (options.jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'tmh-jsonld-page';
      script.text = JSON.stringify(options.jsonLd);
      document.head.appendChild(script);
    }
  }, [full.description, full.keywords, full.ogImage, full.title, full.url, options.jsonLd]);
}
