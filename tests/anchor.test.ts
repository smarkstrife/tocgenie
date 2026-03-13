import { createAnchorGenerator } from '../src/anchor';

describe('GitHub flavor', () => {
  it('generates basic slug', () => {
    const gen = createAnchorGenerator({ flavor: 'github' });
    expect(gen.generate('Hello World')).toBe('hello-world');
  });

  it('lowercases', () => {
    const gen = createAnchorGenerator({ flavor: 'github' });
    expect(gen.generate('My Section')).toBe('my-section');
  });

  it('strips punctuation (not hyphens)', () => {
    const gen = createAnchorGenerator({ flavor: 'github' });
    expect(gen.generate('Hello, World!')).toBe('hello-world');
  });

  it('keeps Unicode letters', () => {
    const gen = createAnchorGenerator({ flavor: 'github' });
    expect(gen.generate('こんにちは')).toBe('こんにちは');
  });

  it('handles duplicate headings (zero-indexed)', () => {
    const gen = createAnchorGenerator({ flavor: 'github' });
    expect(gen.generate('Foo')).toBe('foo');
    expect(gen.generate('Foo')).toBe('foo-1');
    expect(gen.generate('Foo')).toBe('foo-2');
  });

  it('resets duplicate counter after reset()', () => {
    const gen = createAnchorGenerator({ flavor: 'github' });
    gen.generate('Foo');
    gen.generate('Foo');
    gen.reset();
    expect(gen.generate('Foo')).toBe('foo');
  });

  it('strips HTML tags', () => {
    const gen = createAnchorGenerator({ flavor: 'github' });
    expect(gen.generate('The <em>Best</em> Heading')).toBe('the-best-heading');
  });

  it('strips markdown link syntax', () => {
    const gen = createAnchorGenerator({ flavor: 'github' });
    expect(gen.generate('[Click here](https://example.com)')).toBe('click-here');
  });
});

describe('GitLab flavor', () => {
  it('generates basic slug', () => {
    const gen = createAnchorGenerator({ flavor: 'gitlab' });
    expect(gen.generate('Hello World')).toBe('hello-world');
  });

  it('handles duplicates', () => {
    const gen = createAnchorGenerator({ flavor: 'gitlab' });
    expect(gen.generate('Bar')).toBe('bar');
    expect(gen.generate('Bar')).toBe('bar-1');
  });
});

describe('Bitbucket flavor', () => {
  it('prefixes with markdown-header-', () => {
    const gen = createAnchorGenerator({ flavor: 'bitbucket' });
    expect(gen.generate('Hello World')).toBe('markdown-header-hello-world');
  });

  it('strips non-alphanumeric except hyphens', () => {
    const gen = createAnchorGenerator({ flavor: 'bitbucket' });
    expect(gen.generate('Hello, World!')).toBe('markdown-header-hello-world');
  });
});

describe('Generic flavor', () => {
  it('uses custom anchor prefix', () => {
    const gen = createAnchorGenerator({ flavor: 'generic', anchorPrefix: 'custom-' });
    expect(gen.generate('Hello World')).toBe('custom-hello-world');
  });

  it('uses custom strip regex', () => {
    const gen = createAnchorGenerator({
      flavor: 'generic',
      anchorPrefix: '',
      anchorStripRegex: '[aeiou]',
    });
    expect(gen.generate('Hello World')).toBe('hll-wrld');
  });
});
