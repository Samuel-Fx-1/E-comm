import { useEffect } from 'react';
import { site } from '../../config/site';

interface SeoProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

const DATA_ATTR = 'data-soko-seo';

/**
 * Lightweight head manager. react-helmet-async is intentionally not used here:
 * the SPA renders on every route and a direct head update keeps exactly one
 * title, canonical link and social meta tag per page.
 */
export function Seo({ title, description = site.description, path = '/', image, noIndex = false }: SeoProps) {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} — ${site.tagline}`;
  const url = `${site.url}${path}`;
  const imageUrl = image
    ? /^https?:\/\//.test(image)
      ? image
      : `${site.url}${image}`
    : `${site.url}/images/og-cover.svg`;

  useEffect(() => {
    const head = document.head;
    head.querySelectorAll(`[${DATA_ATTR}]`).forEach((element) => element.remove());
    document.title = fullTitle;

    const upsertMeta = (attribute: 'name' | 'property', key: string, content: string) => {
      const element = document.createElement('meta');
      element.setAttribute(attribute, key);
      element.setAttribute('content', content);
      element.setAttribute(DATA_ATTR, 'true');
      head.appendChild(element);
    };

    const existingDescription = head.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (existingDescription) {
      existingDescription.setAttribute('content', description);
      existingDescription.setAttribute(DATA_ATTR, 'true');
    } else {
      upsertMeta('name', 'description', description);
    }

    const canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', url);
    canonical.setAttribute(DATA_ATTR, 'true');
    head.appendChild(canonical);

    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', imageUrl);
    if (noIndex) upsertMeta('name', 'robots', 'noindex,nofollow');
  }, [fullTitle, description, url, imageUrl, noIndex]);

  return null;
}
