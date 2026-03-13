export interface Heading {
  level: number;
  text: string;  // display text (stripped of inline formatting)
  raw: string;   // raw heading text (for anchor generation)
  line: number;
}

export type Flavor = 'github' | 'gitlab' | 'bitbucket' | 'generic';

export interface AnchorOptions {
  flavor: Flavor;
  anchorPrefix?: string;
  anchorStripRegex?: string;
}

export interface TocOptions {
  minLevel: number;
  maxLevel: number;
  ordered: boolean;
  noLink: boolean;
  indent: number;
  flavor: Flavor;
  anchorPrefix?: string;
  anchorStripRegex?: string;
}

export interface CliOptions extends TocOptions {
  output?: string;
  insert: boolean;
  marker: string;
  includeUntracked: boolean;
  noGit: boolean;
  files: string[];
}
