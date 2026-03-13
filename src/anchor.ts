import { AnchorOptions, Flavor } from './types';

/**
 * Strips HTML tags from text.
 */
function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, '');
}

/**
 * Strips markdown link syntax: [text](url) -> text
 */
function stripLinks(text: string): string {
  return text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1');
}

/**
 * Generates a GitHub-style anchor slug.
 * - Lowercase
 * - Keep Unicode letters/numbers, spaces, hyphens
 * - Replace spaces with hyphens
 */
function slugGitHub(text: string): string {
  let slug = stripHtml(stripLinks(text));
  slug = slug.toLowerCase();
  // Keep Unicode letters/numbers, spaces, hyphens — strip everything else
  slug = slug.replace(/[^\p{L}\p{N} -]/gu, '');
  slug = slug.replace(/ /g, '-');
  return slug;
}

/**
 * Generates a GitLab-style anchor slug.
 * Similar to GitHub but also strips periods and a few other chars.
 */
function slugGitLab(text: string): string {
  let slug = stripHtml(stripLinks(text));
  slug = slug.toLowerCase();
  // GitLab additionally strips periods
  slug = slug.replace(/[^\p{L}\p{N} -]/gu, '');
  slug = slug.replace(/ /g, '-');
  return slug;
}

/**
 * Generates a Bitbucket-style anchor slug.
 * Prefix: markdown-header-
 * Lowercase, replace spaces with hyphens, strip non-alphanumeric except hyphens.
 */
function slugBitbucket(text: string, prefix: string): string {
  let slug = stripHtml(stripLinks(text));
  slug = slug.toLowerCase();
  slug = slug.replace(/[^a-z0-9 -]/g, '');
  slug = slug.replace(/ /g, '-');
  return `${prefix}${slug}`;
}

/**
 * Generates a generic anchor slug with custom prefix and strip regex.
 */
function slugGeneric(text: string, prefix: string, stripRegex?: string): string {
  let slug = stripHtml(stripLinks(text));
  slug = slug.toLowerCase();
  if (stripRegex) {
    const re = new RegExp(stripRegex, 'g');
    slug = slug.replace(re, '');
  } else {
    slug = slug.replace(/[^\p{L}\p{N} -]/gu, '');
  }
  slug = slug.replace(/ /g, '-');
  return `${prefix}${slug}`;
}

/**
 * Creates an anchor generator function that tracks duplicates per file.
 * Call reset() between files.
 */
export function createAnchorGenerator(options: AnchorOptions) {
  const seen = new Map<string, number>();

  function generate(raw: string): string {
    const flavor: Flavor = options.flavor;
    const prefix = options.anchorPrefix ?? '';

    let base: string;
    switch (flavor) {
      case 'github':
        base = slugGitHub(raw);
        break;
      case 'gitlab':
        base = slugGitLab(raw);
        break;
      case 'bitbucket':
        base = slugBitbucket(raw, 'markdown-header-');
        break;
      case 'generic':
        base = slugGeneric(raw, prefix, options.anchorStripRegex);
        break;
      default:
        base = slugGitHub(raw);
    }

    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);

    if (count === 0) return base;
    return `${base}-${count}`;
  }

  function reset() {
    seen.clear();
  }

  return { generate, reset };
}
