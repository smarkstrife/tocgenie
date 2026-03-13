import { parseHeadings, stripInlineFormatting } from '../src/parser';

describe('stripInlineFormatting', () => {
  it('strips bold', () => {
    expect(stripInlineFormatting('**Bold Text**')).toBe('Bold Text');
  });

  it('strips italic', () => {
    expect(stripInlineFormatting('*Italic*')).toBe('Italic');
  });

  it('strips inline code', () => {
    expect(stripInlineFormatting('`code`')).toBe('code');
  });

  it('strips markdown links', () => {
    expect(stripInlineFormatting('[Click here](https://example.com)')).toBe('Click here');
  });

  it('strips HTML tags', () => {
    expect(stripInlineFormatting('The <em>Best</em> Heading')).toBe('The Best Heading');
  });

  it('strips bold+italic combined', () => {
    expect(stripInlineFormatting('**Bold _and italic_**')).toBe('Bold and italic');
  });
});

describe('parseHeadings', () => {
  it('parses ATX headings', () => {
    const content = '# H1\n## H2\n### H3';
    const headings = parseHeadings(content);
    expect(headings).toHaveLength(3);
    expect(headings[0]).toMatchObject({ level: 1, text: 'H1', raw: 'H1', line: 1 });
    expect(headings[1]).toMatchObject({ level: 2, text: 'H2', line: 2 });
    expect(headings[2]).toMatchObject({ level: 3, text: 'H3', line: 3 });
  });

  it('ignores headings inside fenced code blocks (backtick)', () => {
    const content = '# Real\n```\n# Fake\n```\n## Also Real';
    const headings = parseHeadings(content);
    expect(headings).toHaveLength(2);
    expect(headings[0].text).toBe('Real');
    expect(headings[1].text).toBe('Also Real');
  });

  it('ignores headings inside fenced code blocks (tilde)', () => {
    const content = '# Real\n~~~\n# Fake\n~~~\n## Also Real';
    const headings = parseHeadings(content);
    expect(headings).toHaveLength(2);
  });

  it('ignores headings inside HTML comments', () => {
    const content = '# Real\n<!-- \n# Hidden\n-->\n## Visible';
    const headings = parseHeadings(content);
    expect(headings.map((h) => h.text)).toEqual(['Real', 'Visible']);
  });

  it('strips trailing hashes', () => {
    const content = '## Heading ##';
    const headings = parseHeadings(content);
    expect(headings[0].text).toBe('Heading');
  });

  it('returns empty for a file with no headings', () => {
    const content = 'Just some prose.\nNo headings here.';
    expect(parseHeadings(content)).toHaveLength(0);
  });

  it('returns empty for an empty file', () => {
    expect(parseHeadings('')).toHaveLength(0);
  });

  it('strips inline formatting from display text', () => {
    const content = '## **Bold Heading**';
    const headings = parseHeadings(content);
    expect(headings[0].text).toBe('Bold Heading');
    expect(headings[0].raw).toBe('**Bold Heading**');
  });

  it('handles link-in-heading', () => {
    const content = '## [Click here](https://example.com)';
    const headings = parseHeadings(content);
    expect(headings[0].text).toBe('Click here');
  });

  it('does not match setext-style headings', () => {
    const content = 'Heading\n=======\nSubheading\n----------';
    expect(parseHeadings(content)).toHaveLength(0);
  });

  it('records correct line numbers', () => {
    const content = '\n\n# Third line heading';
    const headings = parseHeadings(content);
    expect(headings[0].line).toBe(3);
  });
});
