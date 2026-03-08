#!/usr/bin/env npx tsx

/**
 * CLI entry point for the blog generator.
 *
 * Usage:
 *   npx tsx scripts/blog-generator               # Generate a post
 *   npx tsx scripts/blog-generator --dry-run      # Preview without writing
 *   npx tsx scripts/blog-generator --list          # List existing posts
 */

import { generatePost, getExistingPosts } from './generator';
import { config } from './config';
import path from 'path';

const args = process.argv.slice(2);

async function main() {
  // --list: Show existing posts and exit
  if (args.includes('--list')) {
    const blogDir = path.join(process.cwd(), config.blogDir);
    const posts = getExistingPosts(blogDir);
    console.log(`\n${posts.length} existing posts:\n`);
    for (const post of posts) {
      console.log(`  ${post.slug}`);
      console.log(`    "${post.title}"`);
      console.log(`    tags: ${post.tags.join(', ')}\n`);
    }
    return;
  }

  const dryRun = args.includes('--dry-run');

  if (dryRun) {
    console.log('[dry-run] Generating topic and article without writing to disk...\n');
  }

  const result = await generatePost({ dryRun });

  if (!result) {
    console.log('No post generated (duplicate topic detected).');
    return;
  }

  console.log(`${dryRun ? '[dry-run] Would create' : 'Created'}: ${result.filename}`);
  console.log(`  Title:     ${result.title}`);
  console.log(`  Slug:      ${result.slug}`);
  console.log(`  Words:     ${result.wordCount}`);
  console.log(`  Read time: ${result.readTime}`);
  console.log(`  Path:      ${result.filePath}`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
