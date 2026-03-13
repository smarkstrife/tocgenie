import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Returns all .md files tracked by git in the current repo.
 * Throws if not inside a git repository.
 */
export function gitTrackedMarkdownFiles(cwd: string): string[] {
  try {
    const output = execSync('git ls-files "*.md"', { cwd, encoding: 'utf8' });
    return output
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean)
      .map((f) => join(cwd, f));
  } catch {
    throw new Error(
      `Not inside a git repository (or git is not installed).\n` +
        `Run from inside a git repo, or use --no-git to walk the filesystem instead.`
    );
  }
}

/**
 * Returns all .md files tracked by git, plus untracked ones not in .gitignore.
 */
export function gitAllMarkdownFiles(cwd: string): string[] {
  try {
    const output = execSync('git ls-files --others --exclude-standard "*.md"', {
      cwd,
      encoding: 'utf8',
    });
    const untracked = output
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean)
      .map((f) => join(cwd, f));

    const tracked = gitTrackedMarkdownFiles(cwd);
    return [...tracked, ...untracked];
  } catch {
    throw new Error(
      `Not inside a git repository (or git is not installed).\n` +
        `Run from inside a git repo, or use --no-git to walk the filesystem instead.`
    );
  }
}

/**
 * Recursively walks the filesystem and returns all .md files.
 */
export function walkMarkdownFiles(dir: string): string[] {
  const results: string[] = [];

  function walk(current: string) {
    const entries = readdirSync(current);
    for (const entry of entries) {
      if (entry.startsWith('.') || entry === 'node_modules') continue;
      const full = join(current, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (entry.endsWith('.md') || entry.endsWith('.markdown')) {
        results.push(full);
      }
    }
  }

  walk(dir);
  return results;
}

/**
 * Discovers markdown files based on CLI options.
 */
export function discoverFiles(options: {
  files: string[];
  noGit: boolean;
  includeUntracked: boolean;
  cwd: string;
}): string[] {
  const { files, noGit, includeUntracked, cwd } = options;

  if (files.length > 0) {
    return files;
  }

  if (noGit) {
    return walkMarkdownFiles(cwd);
  }

  if (includeUntracked) {
    return gitAllMarkdownFiles(cwd);
  }

  return gitTrackedMarkdownFiles(cwd);
}
