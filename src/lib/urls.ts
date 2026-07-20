import { SITE } from '../data/site';

const EXTENSION_RE = /\/[^/?#]+\.[^/?#]+$/;

export function canonicalPath(path: string): string {
  const [withoutHash, hash = ''] = path.split('#');
  const suffix = hash ? `#${hash}` : '';

  if (withoutHash === '' || withoutHash === '/') return `/${suffix}`;
  if (EXTENSION_RE.test(withoutHash)) return `${withoutHash}${suffix}`;
  if (withoutHash.endsWith('/')) return `${withoutHash}${suffix}`;
  return `${withoutHash}/${suffix}`;
}

export function siteUrl(path: string): string {
  return new URL(canonicalPath(path), SITE.url).toString();
}
