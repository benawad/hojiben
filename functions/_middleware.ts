export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url);

  if (url.hostname === 'www.hojiben.com') {
    url.hostname = 'hojiben.com';
    return Response.redirect(url.toString(), 301);
  }

  const response = await next();

  if (!wantsMarkdown(request) || !isHtmlResponse(response)) {
    return response;
  }

  const html = await response.text();
  const markdown = htmlToMarkdown(html, url);
  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'text/markdown; charset=utf-8');
  headers.set('Vary', appendVary(headers.get('Vary'), 'Accept'));
  headers.set('x-markdown-tokens', estimateTokenCount(markdown).toString());
  headers.delete('Content-Length');
  headers.delete('ETag');

  return new Response(markdown, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

function wantsMarkdown(request: Request): boolean {
  return request.headers
    .get('Accept')
    ?.split(',')
    .some((value) => value.trim().toLowerCase().startsWith('text/markdown')) ?? false;
}

function isHtmlResponse(response: Response): boolean {
  return response.headers.get('Content-Type')?.toLowerCase().includes('text/html') ?? false;
}

function appendVary(current: string | null, value: string): string {
  if (!current) return value;
  const parts = current.split(',').map((part) => part.trim().toLowerCase());
  return parts.includes(value.toLowerCase()) ? current : `${current}, ${value}`;
}

function estimateTokenCount(markdown: string): number {
  return Math.ceil(markdown.split(/\s+/).filter(Boolean).length * 1.3);
}

function htmlToMarkdown(html: string, url: URL): string {
  const title = matchContent(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = matchContent(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );

  let body = matchContent(html, /<body[^>]*>([\s\S]*?)<\/body>/i) || html;
  body = body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
    .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_match, href, text) => {
      const label = stripTags(text).trim();
      if (!label) return '';
      return `[${label}](${absoluteUrl(href, url)})`;
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/section>/gi, '\n')
    .replace(/<\/aside>/gi, '\n');

  const sections = [
    title ? `# ${decodeEntities(title)}` : '',
    description ? decodeEntities(description) : '',
    decodeEntities(stripTags(body)),
  ].filter(Boolean);

  return sections
    .join('\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd()
    .concat('\n');
}

function matchContent(input: string, pattern: RegExp): string {
  return input.match(pattern)?.[1]?.trim() ?? '';
}

function stripTags(input: string): string {
  return input.replace(/<[^>]+>/g, ' ');
}

function absoluteUrl(href: string, base: URL): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .trim();
}
