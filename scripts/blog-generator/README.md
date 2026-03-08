# Blog Generator

Automated SEO blog post generator powered by Gemini AI. Generates a unique, keyword-targeted MDX article every day and commits it to the repo via GitHub Actions.

## How It Works

```
1. Reads existing posts  →  Avoids duplicate topics
2. Picks a keyword       →  AI selects a high-volume search query
3. Writes the article    →  800-1200 word SEO-optimized MDX
4. Saves to disk         →  Front-matter + content, ready to deploy
```

The generator is a two-step AI pipeline:
- **Step 1 (Topic):** Gemini analyzes existing posts and picks a new long-tail keyword that hasn't been covered yet
- **Step 2 (Article):** Gemini writes a full article optimized for that keyword with proper heading structure, featured snippet formatting, and a CTA

## Usage

```bash
# Generate a new post
npx tsx scripts/blog-generator

# Preview without writing to disk
npx tsx scripts/blog-generator --dry-run

# List all existing posts
npx tsx scripts/blog-generator --list
```

Requires `GEMINI_API_KEY` in your environment:

```bash
# From .env.local
source .env.local && export GEMINI_API_KEY && npx tsx scripts/blog-generator
```

## Automated Daily Posts (GitHub Actions)

The workflow at `.github/workflows/daily-blog-post.yml` runs at 8am UTC daily:

1. Checks out the repo
2. Runs the generator
3. If a new post was created, commits and pushes to `main`

### Setup

Add `GEMINI_API_KEY` as a repository secret:

**GitHub → Settings → Secrets and variables → Actions → New repository secret**

The workflow also supports manual triggering from the Actions tab (`workflow_dispatch`).

## Project Structure

```
scripts/blog-generator/
├── index.ts       # CLI entry point (--dry-run, --list)
├── generator.ts   # Core logic: read posts, call AI, write MDX
├── prompts.ts     # Prompt builders for topic + article generation
├── config.ts      # All customizable settings
└── README.md
```

## Configuration

All settings live in `config.ts`:

| Setting | Default | Description |
|---------|---------|-------------|
| `blogDir` | `src/content/blog` | Where MDX files are stored |
| `extension` | `.mdx` | Blog post file extension |
| `model` | `gemini-2.5-flash` | Gemini model for generation |
| `author` | `Starla Team` | Author name in front-matter |
| `minWords` | `500` | Reject posts shorter than this |
| `wordsPerMinute` | `250` | For read time calculation |
| `brand` | `{ name, description, audience, domain }` | Your brand context |
| `topicGuidance` | `string[]` | Rules for topic selection |
| `topicExamples` | `string[]` | Example search queries |
| `articleRules` | `string[]` | Writing rules for the article |
| `articleAntiPatterns` | `string[]` | Things to avoid |

### Adapting for Another Project

1. Update `config.ts` with your brand, audience, and blog directory
2. Adjust `topicGuidance` and `articleRules` for your niche
3. Update `topicExamples` with relevant search queries
4. Run `--dry-run` to test before committing

## Output Format

Each generated post is a standard MDX file with YAML front-matter:

```yaml
---
title: "How to Answer 'Tell Me About Yourself' in a Job Interview"
description: "Master the most common interview opener with examples..."
date: "2026-03-08"
author: "Starla Team"
tags:
  - interview questions
  - interview prep
readTime: "7 min read"
slug: "how-to-answer-tell-me-about-yourself"
---

Article content in markdown...
```

## SEO Features

- **Keyword targeting:** Each post targets a specific long-tail keyword
- **Featured snippet format:** Opens with a direct answer for position zero
- **Meta description:** 155-char description with target keyword
- **Heading hierarchy:** H2/H3 only (H1 is the page title)
- **Internal linking CTA:** Each post ends with a link back to the product
- **Deduplication:** Reads all existing posts to avoid topic overlap
- **Auto sitemap:** Posts are automatically included in `sitemap.xml` at build time
