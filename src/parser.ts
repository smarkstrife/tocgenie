import { Heading } from './types';

/**
 * Strips inline markdown formatting from heading text for display.
 * Handles: bold, italic, inline code, links, HTML tags.
 */
export function stripInlineFormatting(text: string): string {
  let result = text;

  // Strip links: [text](url) or [text][ref] -> text
  result = result.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  result = result.replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1');

  // Strip HTML tags (including <em>, <strong>, etc.)
  result = result.replace(/<[^>]+>/g, '');

  // Strip inline code: `code`
  result = result.replace(/`[^`]*`/g, (match) => match.slice(1, -1));

  // Strip bold+italic: ***text*** or ___text___
  result = result.replace(/\*{3}([^*]*)\*{3}/g, '$1');
  result = result.replace(/_{3}([^_]*)_{3}/g, '$1');

  // Strip bold: **text** or __text__
  result = result.replace(/\*{2}([^*]*)\*{2}/g, '$1');
  result = result.replace(/_{2}([^_]*)_{2}/g, '$1');

  // Strip italic: *text* or _text_
  result = result.replace(/\*([^*]*)\*/g, '$1');
  result = result.replace(/_([^_]*)_/g, '$1');

  return result.trim();
}

/**
 * Extracts ATX-style headings from markdown content.
 * Skips headings inside fenced code blocks and HTML comments.
 */
export function parseHeadings(content: string): Heading[] {
  const lines = content.split('\n');
  const headings: Heading[] = [];

  let insideCodeBlock = false;
  let insideHtmlComment = false;
  let codeFenceChar = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Track HTML comments (can span multiple lines)
    if (!insideCodeBlock) {
      if (!insideHtmlComment && line.includes('<!--')) {
        if (line.includes('-->')) {
          // Single-line comment — skip it but continue processing
          const stripped = line.replace(/<!--.*?-->/gs, '');
          // Check stripped line for heading below
          const headingMatch = stripped.match(/^(#{1,6})\s+(.+?)(?:\s+#+\s*)?$/);
          if (headingMatch) {
            const level = headingMatch[1].length;
            const raw = headingMatch[2].trim();
            const text = stripInlineFormatting(raw);
            headings.push({ level, text, raw, line: lineNumber });
          }
          continue;
        } else {
          insideHtmlComment = true;
          continue;
        }
      }
      if (insideHtmlComment) {
        if (line.includes('-->')) {
          insideHtmlComment = false;
        }
        continue;
      }
    }

    // Track fenced code blocks (``` or ~~~)
    const fenceMatch = line.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      const fenceChar = fenceMatch[1][0];
      if (!insideCodeBlock) {
        insideCodeBlock = true;
        codeFenceChar = fenceChar;
      } else if (fenceChar === codeFenceChar) {
        insideCodeBlock = false;
        codeFenceChar = '';
      }
      continue;
    }

    if (insideCodeBlock) continue;

    // Match ATX-style heading: # to ######
    // Also handles trailing hashes: ## Heading ##
    const headingMatch = line.match(/^(#{1,6})\s+(.+?)(?:\s+#+\s*)?$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const raw = headingMatch[2].trim();
      const text = stripInlineFormatting(raw);
      headings.push({ level, text, raw, line: lineNumber });
    }
  }

  return headings;
}
