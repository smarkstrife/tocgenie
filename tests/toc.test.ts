import { buildToc, insertToc } from '../src/toc';
import { Heading } from '../src/types';

const defaultOptions = {
  flavor: 'github' as const,
  minLevel: 1,
  maxLevel: 6,
  ordered: false,
  noLink: false,
  indent: 2,
};

const sampleHeadings: Heading[] = [
  { level: 1, text: 'Introduction', raw: 'Introduction', line: 1 },
  { level: 2, text: 'Getting Started', raw: 'Getting Started', line: 3 },
  { level: 3, text: 'Installation', raw: 'Installation', line: 5 },
  { level: 2, text: 'Usage', raw: 'Usage', line: 7 },
];

describe('buildToc', () => {
  it('generates unordered TOC', () => {
    const toc = buildToc(sampleHeadings, defaultOptions);
    expect(toc).toBe(
      [
        '- [Introduction](#introduction)',
        '  - [Getting Started](#getting-started)',
        '    - [Installation](#installation)',
        '  - [Usage](#usage)',
      ].join('\n')
    );
  });

  it('generates ordered TOC', () => {
    const toc = buildToc(sampleHeadings, { ...defaultOptions, ordered: true });
    expect(toc).toContain('1. [Introduction](#introduction)');
    expect(toc).toContain('  1. [Getting Started](#getting-started)');
  });

  it('omits links when noLink is true', () => {
    const toc = buildToc(sampleHeadings, { ...defaultOptions, noLink: true });
    expect(toc).toContain('- Introduction');
    expect(toc).not.toContain('(#');
  });

  it('filters by minLevel and maxLevel', () => {
    const toc = buildToc(sampleHeadings, { ...defaultOptions, minLevel: 2, maxLevel: 2 });
    expect(toc).toContain('Getting Started');
    expect(toc).toContain('Usage');
    expect(toc).not.toContain('Introduction');
    expect(toc).not.toContain('Installation');
  });

  it('returns empty string for no headings', () => {
    expect(buildToc([], defaultOptions)).toBe('');
  });

  it('returns empty string when all headings are filtered out', () => {
    const toc = buildToc(sampleHeadings, { ...defaultOptions, minLevel: 5, maxLevel: 6 });
    expect(toc).toBe('');
  });

  it('uses custom indent', () => {
    const toc = buildToc(sampleHeadings, { ...defaultOptions, indent: 4 });
    expect(toc).toContain('    - [Getting Started](#getting-started)');
  });

  it('handles duplicate headings with correct suffixes', () => {
    const headings: Heading[] = [
      { level: 2, text: 'Foo', raw: 'Foo', line: 1 },
      { level: 2, text: 'Foo', raw: 'Foo', line: 2 },
      { level: 2, text: 'Foo', raw: 'Foo', line: 3 },
    ];
    const toc = buildToc(headings, defaultOptions);
    expect(toc).toContain('[Foo](#foo)');
    expect(toc).toContain('[Foo](#foo-1)');
    expect(toc).toContain('[Foo](#foo-2)');
  });

  it('normalizes indent relative to minimum heading level', () => {
    const deepHeadings: Heading[] = [
      { level: 3, text: 'Deep One', raw: 'Deep One', line: 1 },
      { level: 4, text: 'Deeper', raw: 'Deeper', line: 2 },
    ];
    const toc = buildToc(deepHeadings, defaultOptions);
    // level 3 is base, so it gets no indent; level 4 gets one indent
    expect(toc.split('\n')[0]).toBe('- [Deep One](#deep-one)');
    expect(toc.split('\n')[1]).toBe('  - [Deeper](#deeper)');
  });
});

describe('insertToc', () => {
  const marker = '<!-- toc -->';
  const content = `# My Doc\n\n<!-- toc -->\n<!-- /toc -->\n\n## Section\n`;

  it('inserts TOC between markers', () => {
    const toc = '- [My Doc](#my-doc)\n  - [Section](#section)';
    const result = insertToc(content, toc, marker);
    expect(result).not.toBeNull();
    expect(result).toContain(toc);
    expect(result).toContain('<!-- toc -->');
    expect(result).toContain('<!-- /toc -->');
  });

  it('replaces existing TOC between markers', () => {
    const existing = `# Doc\n\n<!-- toc -->\n- old entry\n<!-- /toc -->\n\n## New\n`;
    const toc = '- [Doc](#doc)\n  - [New](#new)';
    const result = insertToc(existing, toc, marker);
    expect(result).not.toBeNull();
    expect(result).not.toContain('- old entry');
    expect(result).toContain(toc);
  });

  it('returns null if markers are not found', () => {
    const noMarkers = '# Title\n\n## Section\n';
    expect(insertToc(noMarkers, '- toc', marker)).toBeNull();
  });
});
