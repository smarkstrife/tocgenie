# tocgenie

A fast CLI tool that generates a **table of contents** for markdown files — with anchor links compatible with GitHub, GitLab, Bitbucket, or any custom platform. Works out of the box with any git repository.

**Generated with [tocgenie](https://github.com/smarkstrife/tocgenie)**

<!-- toc -->
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Real World Examples](#real-world-examples)
  - [Single File](#single-file)
  - [Entire Repository](#entire-repository)
  - [In-Place Insertion](#in-place-insertion)
  - [CI / Automation](#ci--automation)
  - [Using in Another Project](#using-in-another-project)
- [Options](#options)
- [Platform Flavors](#platform-flavors)
- [Development](#development)
- [Project Structure](#project-structure)
<!-- /toc -->

---

## Installation

**Clone and build:**
```bash
git clone https://github.com/smarkstrife/tocgenie.git
cd tocgenie
npm install
npm run build
```

**Install globally** (run `tocgenie` from anywhere):
```bash
npm install -g .
```

**Use as a dev dependency in another project:**
```bash
npm install --save-dev /path/to/tocgenie
```

---

## Quick Start

```bash
# Generate TOC for a single file
tocgenie README.md

# Insert TOC directly into a file (add markers first — see below)
tocgenie --insert README.md

# Generate TOC for all tracked .md files in a git repo
tocgenie
```

---

## Real World Examples

### Single File

Generate a TOC and print to stdout:
```bash
tocgenie README.md
```

Output:
```
- [Installation](#installation)
- [Usage](#usage)
  - [Options](#options)
  - [Examples](#examples)
- [Contributing](#contributing)
```

Save the TOC to a separate file:
```bash
tocgenie -O toc.md README.md
```

**Real file example** — given a file `story.md` with this structure:

```markdown
# The Last Compiler
## Prologue
## Chapter 1: The Bug
### The Discovery
### The Aftermath
## Chapter 2: The Fix
## Epilogue
```

Running:
```bash
tocgenie --no-git story.md
```

Produces:
```
- [The Last Compiler](#the-last-compiler)
  - [Prologue](#prologue)
  - [Chapter 1: The Bug](#chapter-1-the-bug)
    - [The Discovery](#the-discovery)
    - [The Aftermath](#the-aftermath)
  - [Chapter 2: The Fix](#chapter-2-the-fix)
  - [Epilogue](#epilogue)
```

Skip the top-level heading and use an ordered list:
```bash
tocgenie --no-git --min-level 2 --ordered story.md
```

Output:
```
1. [Prologue](#prologue)
1. [Chapter 1: The Bug](#chapter-1-the-bug)
   1. [The Discovery](#the-discovery)
   1. [The Aftermath](#the-aftermath)
1. [Chapter 2: The Fix](#chapter-2-the-fix)
1. [Epilogue](#epilogue)
```

---

### Entire Repository

Scan all git-tracked `.md` files in the current repo:
```bash
tocgenie
```

Include files not yet committed to git:
```bash
tocgenie --include-untracked
```

Not in a git repo? Walk the filesystem instead:
```bash
tocgenie --no-git docs/
```

---

### In-Place Insertion

This is the most common workflow. Add two marker comments anywhere in your markdown file:

```markdown
## Table of Contents

<!-- toc -->
<!-- /toc -->

## Introduction
```

Then run:
```bash
tocgenie --insert README.md
```

tocgenie replaces everything between the markers with the generated TOC. Re-running the command is safe — it always replaces the existing content, never duplicates it.

**Custom marker:**
```bash
tocgenie --insert --marker "<!-- contents -->" README.md
```

---

### CI / Automation

Keep your TOC up to date automatically. Add tocgenie as a dev dependency and a script in `package.json`:

```json
{
  "scripts": {
    "toc": "tocgenie --insert README.md"
  },
  "devDependencies": {
    "tocgenie": "file:../tocgenie"
  }
}
```

Then run it as part of your workflow:
```bash
npm run toc
```

Or in a GitHub Actions workflow:
```yaml
- name: Update TOC
  run: npx tocgenie --insert README.md
```

---

### Using in Another Project

**Option 1 — Global install (recommended for personal use):**
```bash
npm install -g /path/to/tocgenie
tocgenie --insert README.md   # works in any directory
```

**Option 2 — Local dev dependency:**
```bash
npm install --save-dev /path/to/tocgenie
```

Add to `package.json`:
```json
"scripts": {
  "toc": "tocgenie --insert README.md"
}
```

**Option 3 — One-off via node directly:**
```bash
node /path/to/tocgenie/dist/cli.js --no-git README.md
```

---

## Options

| Flag | Short | Default | Description |
|---|---|---|---|
| `--flavor <flavor>` | `-f` | `github` | Anchor flavor: `github`, `gitlab`, `bitbucket`, `generic` |
| `--min-level <n>` | | `1` | Minimum heading level to include |
| `--max-level <n>` | | `6` | Maximum heading level to include |
| `--ordered` | `-o` | `false` | Use ordered (`1.`) list markers |
| `--no-link` | | `false` | Omit anchor links (plain text outline) |
| `--indent <n>` | | `2` | Spaces per indent level |
| `--output <file>` | `-O` | stdout | Write TOC to a file |
| `--insert` | `-i` | `false` | Insert/replace TOC in-place between markers |
| `--marker <marker>` | | `<!-- toc -->` | Marker used for in-place insertion |
| `--include-untracked` | | `false` | Include untracked (but not gitignored) files |
| `--no-git` | | `false` | Walk the filesystem instead of using git |
| `--anchor-prefix <prefix>` | | `""` | Custom prefix for `generic` flavor |
| `--anchor-strip-regex <regex>` | | none | Custom strip regex for `generic` flavor |
| `[files...]` | | all `.md` | Explicit files or globs to process |

---

## Platform Flavors

Different platforms generate anchor slugs differently. Use `--flavor` to match your target platform.

| Flavor | Example heading | Generated anchor |
|---|---|---|
| `github` (default) | `## My Heading` | `#my-heading` |
| `gitlab` | `## My Heading` | `#my-heading` |
| `bitbucket` | `## My Heading` | `#markdown-header-my-heading` |
| `generic` | configurable via `--anchor-prefix` / `--anchor-strip-regex` | custom |

**Examples:**
```bash
tocgenie -f gitlab README.md
tocgenie -f bitbucket README.md
tocgenie -f generic --anchor-prefix "section-" README.md
```

---

## Development

```bash
npm test              # run all tests
npm run test:watch    # watch mode
npm run build         # compile TypeScript
npm run dev -- --no-git README.md   # run without building
```

---

## Project Structure

```
src/
├── cli.ts        Entry point and argument parsing
├── parser.ts     Markdown heading extraction
├── anchor.ts     Anchor/slug generation per platform flavor
├── toc.ts        TOC assembly and in-place insertion
├── git.ts        Git-aware and filesystem file discovery
└── types.ts      Shared type definitions
tests/
├── parser.test.ts
├── anchor.test.ts
├── toc.test.ts
└── fixtures/     Sample .md files used in tests
```

---

**Author:** Shikhar Srivastava
