// Build-time Open Graph image generator. Hand-built SVG (matched to the site's
// app-window look) rasterized to PNG with resvg. Pure: takes primitives only,
// no astro:content import, so it can be unit-tested in plain Node.
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const FONT_DIR = join(process.cwd(), 'src/og/fonts');
const fontBuffers = [
  'jbmono-400',
  'jbmono-500',
  'jbmono-600',
  'geist-400',
  'geist-600',
].map((n) => readFileSync(join(FONT_DIR, `${n}.ttf`)));

export function pngFromSvg(svg: string): Uint8Array {
  const resvg = new Resvg(svg, {
    font: { fontBuffers, loadSystemFonts: false, defaultFontFamily: 'Geist' },
    fitTo: { mode: 'width', value: 1200 },
  });
  return resvg.render().asPng();
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Grayscale grade ramp (matches the tier list): [bg, fg].
const SHADES: Record<string, [string, string]> = {
  S: ['#1d1d1f', '#ffffff'],
  A: ['#3a3a3d', '#ffffff'],
  B: ['#5c5c61', '#ffffff'],
  C: ['#8a8a90', '#ffffff'],
  D: ['#b4b4ba', '#1d1d1f'],
  F: ['#d6d6da', '#1d1d1f'],
};
function shadeFor(grade?: string): { bg: string; fg: string } {
  const v = SHADES[(grade || '').charAt(0).toUpperCase()] || ['#ebebef', '#8a8a90'];
  return { bg: v[0], fg: v[1] };
}

function wrap(text: string, max: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if (line && (line + ' ' + w).length > max) {
      lines.push(line);
      line = w;
    } else {
      line = line ? `${line} ${w}` : w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// The shared app-window frame: gray desktop, white window, titlebar with dots,
// the hojiben.com/<crumb> path, and the green "brewing" dot.
function frame(crumb: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#e8e8ec"/>
<clipPath id="w"><rect x="28" y="28" width="1144" height="574" rx="14"/></clipPath>
<g clip-path="url(#w)">
<rect x="28" y="28" width="1144" height="574" fill="#ffffff"/>
<rect x="28" y="28" width="1144" height="52" fill="#f5f5f7"/>
<rect x="28" y="79" width="1144" height="1" fill="#e6e6ea"/>
<circle cx="56" cy="54" r="5.5" fill="#dededf"/><circle cx="78" cy="54" r="5.5" fill="#dededf"/><circle cx="100" cy="54" r="5.5" fill="#dededf"/>
<text x="128" y="62" font-family="JetBrains Mono" font-size="22" fill="#8a8a90">hojiben.com<tspan fill="#b4b4ba"> / </tspan><tspan fill="#55555a">${esc(crumb)}</tspan></text>
<circle cx="1050" cy="54" r="5" fill="#34a853"/>
<text x="1064" y="61" font-family="JetBrains Mono" font-size="20" fill="#8a8a90">brewing</text>
${body}
</g>
<rect x="28" y="28" width="1144" height="574" rx="14" fill="none" stroke="#dadade" stroke-width="1.2"/>
</svg>`;
}

export function spotCardSvg(o: {
  crumb: string;
  grade?: string;
  name: string;
  meta: string;
  city: string;
  rank: string;
}): string {
  const sh = shadeFor(o.grade);
  const letter = o.grade ?? '?';
  const fs = letter.length > 1 ? 92 : 116;
  const lbase = 341 + Math.round(fs * 0.35);
  const body = `<rect x="84" y="241" width="200" height="200" rx="16" fill="${sh.bg}"/>
<text x="184" y="${lbase}" font-family="Geist" font-weight="600" font-size="${fs}" fill="${sh.fg}" text-anchor="middle">${esc(letter)}</text>
<text x="328" y="312" font-family="Geist" font-weight="600" font-size="72" fill="#1d1d1f">${esc(o.name)}</text>
<text x="330" y="352" font-family="JetBrains Mono" font-size="26" fill="#8a8a90">${esc(o.meta)}</text>
<text x="330" y="392" font-family="Geist" font-weight="400" font-size="30" fill="#55555a">${esc(o.city)}</text>
<text x="330" y="434" font-family="JetBrains Mono" font-size="22" fill="#b4b4ba">${esc(o.rank)}</text>`;
  return frame(o.crumb, body);
}

export function articleCardSvg(o: { crumb: string; title: string; label?: string }): string {
  const lines = wrap(o.title, 30).slice(0, 3);
  const start = 360 - (lines.length - 1) * 36;
  const tspans = lines
    .map((ln, i) => `<tspan x="84" y="${start + i * 72}">${esc(ln)}</tspan>`)
    .join('');
  const body = `<text x="84" y="156" font-family="JetBrains Mono" font-size="24" fill="#8a8a90">${esc(o.label || 'guide')}</text>
<text font-family="Geist" font-weight="600" font-size="58" fill="#1d1d1f">${tspans}</text>
<text x="84" y="558" font-family="JetBrains Mono" font-size="22" fill="#b4b4ba">a hoji ben field note</text>`;
  return frame(o.crumb, body);
}

export function homeCardSvg(o: {
  crumb: string;
  headline: string;
  rows: Array<{ n: string; grade: string; name: string; area: string }>;
}): string {
  let body = `<text x="84" y="205" font-family="Geist" font-weight="600" font-size="52" fill="#1d1d1f">${esc(o.headline)}</text>`;
  o.rows.forEach((r, i) => {
    const y = 300 + i * 76;
    const sh = shadeFor(r.grade);
    const gfs = r.grade.length > 1 ? 20 : 24;
    body += `<text x="84" y="${y}" font-family="JetBrains Mono" font-size="24" fill="#b4b4ba">${esc(r.n)}</text>
<rect x="132" y="${y - 34}" width="46" height="46" rx="9" fill="${sh.bg}"/>
<text x="155" y="${y - 2}" font-family="Geist" font-weight="600" font-size="${gfs}" fill="${sh.fg}" text-anchor="middle">${esc(r.grade)}</text>
<text x="196" y="${y}" font-family="Geist" font-weight="600" font-size="30" fill="#1d1d1f">${esc(r.name)}</text>
<text x="1116" y="${y}" font-family="JetBrains Mono" font-size="22" fill="#8a8a90" text-anchor="end">${esc(r.area)}</text>`;
  });
  return frame(o.crumb, body);
}

export function defaultCardSvg(o: { crumb: string; title: string; sub: string }): string {
  const body = `<text x="84" y="300" font-family="Geist" font-weight="600" font-size="76" fill="#1d1d1f">${esc(o.title)}</text>
<text x="86" y="352" font-family="Geist" font-weight="400" font-size="32" fill="#55555a">${esc(o.sub)}</text>
<text x="84" y="430" font-family="JetBrains Mono" font-size="24" fill="#b4b4ba">hojiben.com</text>`;
  return frame(o.crumb, body);
}
