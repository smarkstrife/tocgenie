import { Heading, TocOptions } from './types';
import { createAnchorGenerator } from './anchor';

/**
 * Generates a TOC string from a list of headings.
 */
export function buildToc(headings: Heading[], options: TocOptions): string {
  const { minLevel, maxLevel, ordered, noLink, indent } = options;

  const generator = createAnchorGenerator({
    flavor: options.flavor,
    anchorPrefix: options.anchorPrefix,
    anchorStripRegex: options.anchorStripRegex,
  });

  const filtered = headings.filter(
    (h) => h.level >= minLevel && h.level <= maxLevel
  );

  if (filtered.length === 0) return '';

  const baseLevel = filtered.reduce((min, h) => Math.min(min, h.level), Infinity);

  const lines = filtered.map((heading) => {
    const anchor = generator.generate(heading.raw);
    const depth = heading.level - baseLevel;
    const pad = ' '.repeat(depth * indent);
    const marker = ordered ? '1.' : '-';

    const entry = noLink
      ? heading.text
      : `[${heading.text}](#${anchor})`;

    return `${pad}${marker} ${entry}`;
  });

  return lines.join('\n');
}

/**
 * Inserts or replaces TOC content between marker comments in a file.
 * Returns the updated content, or null if markers are not found.
 */
export function insertToc(
  content: string,
  toc: string,
  marker: string
): string | null {
  const closeMarker = marker.replace('<!--', '<!--/').replace('<!-- ', '<!-- /');
  // Derive closing marker: <!-- toc --> -> <!-- /toc -->
  const openEscaped = escapeRegex(marker);
  // closing marker: insert '/' after '<!--' or '<!-- '
  const closingTag = marker.replace(/^<!--\s*/, (m) => m + '/');
  const closeEscaped = escapeRegex(closingTag);

  const re = new RegExp(
    `(${openEscaped})([\\s\\S]*?)(${closeEscaped})`,
    'm'
  );

  if (!re.test(content)) {
    return null;
  }

  const replacement = `$1\n${toc}\n$3`;
  return content.replace(re, replacement);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
