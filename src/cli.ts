#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { parseHeadings } from './parser';
import { buildToc, insertToc } from './toc';
import { discoverFiles } from './git';
import { Flavor } from './types';

const program = new Command();

program
  .name('tocgenie')
  .description('Generate a table of contents for markdown files in a git repository')
  .version('0.1.0')
  .argument('[files...]', 'Explicit files or globs to process')
  .option('-f, --flavor <flavor>', 'Anchor generation flavor (github, gitlab, bitbucket, generic)', 'github')
  .option('--min-level <n>', 'Minimum heading level to include', '1')
  .option('--max-level <n>', 'Maximum heading level to include', '6')
  .option('-o, --ordered', 'Use ordered list markers', false)
  .option('--no-link', 'Omit anchor links')
  .option('--indent <n>', 'Spaces per indent level', '2')
  .option('-O, --output <file>', 'Write TOC to a file instead of stdout')
  .option('-i, --insert', 'Insert/replace TOC in-place between markers', false)
  .option('--marker <marker>', 'Start/end marker for in-place insertion', '<!-- toc -->')
  .option('--include-untracked', 'Include files not tracked by git', false)
  .option('--no-git', 'Skip git, walk filesystem instead', false)
  .option('--anchor-prefix <prefix>', 'Custom prefix for generic flavor', '')
  .option('--anchor-strip-regex <regex>', 'Custom regex for stripping characters in generic flavor')
  .action((files: string[], opts) => {
    const flavor = opts.flavor as Flavor;
    const minLevel = parseInt(opts.minLevel, 10);
    const maxLevel = parseInt(opts.maxLevel, 10);
    const indent = parseInt(opts.indent, 10);
    const cwd = process.cwd();

    // Resolve explicit file paths
    const resolvedFiles = files.map((f) => resolve(cwd, f));

    let targetFiles: string[];
    try {
      targetFiles = discoverFiles({
        files: resolvedFiles,
        noGit: opts.noGit,
        includeUntracked: opts.includeUntracked,
        cwd,
      });
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }

    if (targetFiles.length === 0) {
      console.error('No markdown files found.');
      process.exit(0);
    }

    const tocOptions = {
      flavor,
      minLevel,
      maxLevel,
      ordered: opts.ordered,
      noLink: opts.noLink,
      indent,
      anchorPrefix: opts.anchorPrefix,
      anchorStripRegex: opts.anchorStripRegex,
    };

    const allTocs: string[] = [];

    for (const filePath of targetFiles) {
      let content: string;
      try {
        content = readFileSync(filePath, 'utf8');
      } catch {
        console.error(`Warning: Cannot read file: ${filePath}`);
        continue;
      }

      const headings = parseHeadings(content);
      const toc = buildToc(headings, tocOptions);

      if (opts.insert) {
        if (!toc) {
          console.warn(`Warning: No headings found in ${filePath}, skipping.`);
          continue;
        }
        const updated = insertToc(content, toc, opts.marker);
        if (updated === null) {
          console.warn(
            `Warning: No markers found in ${filePath}. ` +
              `Add "${opts.marker}" and "${opts.marker.replace('<!--', '<!--/').replace('<!-- ', '<!-- /')}" to the file.`
          );
          continue;
        }
        try {
          writeFileSync(filePath, updated, 'utf8');
          console.log(`Updated: ${filePath}`);
        } catch {
          console.error(`Error: Cannot write to file: ${filePath}`);
        }
        continue;
      }

      if (targetFiles.length > 1) {
        allTocs.push(`<!-- ${filePath} -->\n${toc}`);
      } else {
        allTocs.push(toc);
      }
    }

    if (!opts.insert && allTocs.length > 0) {
      const output = allTocs.join('\n\n');
      if (opts.output) {
        try {
          writeFileSync(resolve(cwd, opts.output), output, 'utf8');
          console.log(`TOC written to: ${opts.output}`);
        } catch {
          console.error(`Error: Cannot write to output file: ${opts.output}`);
          process.exit(1);
        }
      } else {
        process.stdout.write(output + '\n');
      }
    }
  });

program.parse(process.argv);
