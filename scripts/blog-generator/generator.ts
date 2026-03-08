/**
 * Core blog post generator.
 *
 * Reads existing posts, generates a new topic via AI, writes the article,
 * and saves the .mdx file. Pure logic — no CLI concerns.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { GoogleGenAI } from '@google/genai';
import { config } from './config';
import { buildTopicPrompt, buildArticlePrompt } from './prompts';

export interface GeneratedPost {
  filename: string;
  title: string;
  slug: string;
  wordCount: number;
  readTime: string;
  filePath: string;
}

interface ExistingPost {
  title: string;
  slug: string;
  tags: string[];
}

/**
 * Reads all existing blog posts from the blog directory.
 */
export function getExistingPosts(blogDir: string): ExistingPost[] {
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(config.extension));
  return files.map((filename) => {
    const raw = fs.readFileSync(path.join(blogDir, filename), 'utf-8');
    const { data } = matter(raw);
    return {
      title: data.title as string,
      slug: (data.slug as string) ?? filename.replace(config.extension, ''),
      tags: (data.tags as string[]) ?? [],
    };
  });
}

/**
 * Calls Gemini to generate text content.
 */
async function generate(ai: GoogleGenAI, prompt: string): Promise<string> {
  const result = await ai.models.generateContent({
    model: config.model,
    contents: prompt,
  });
  return result.text?.trim() ?? '';
}

/**
 * Parses the topic JSON from the AI response.
 * Handles responses wrapped in code fences.
 */
function parseTopic(raw: string): {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  targetKeyword: string;
} {
  const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
}

/**
 * Generates a new blog post and writes it to disk.
 * Returns metadata about the generated post, or null if generation was skipped.
 */
export async function generatePost(options?: {
  dryRun?: boolean;
}): Promise<GeneratedPost | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  const ai = new GoogleGenAI({ apiKey });
  const blogDir = path.join(process.cwd(), config.blogDir);
  const existing = getExistingPosts(blogDir);

  // Step 1: Generate topic
  const topicRaw = await generate(ai, buildTopicPrompt(existing));

  let topic;
  try {
    topic = parseTopic(topicRaw);
  } catch {
    throw new Error(`Failed to parse topic JSON: ${topicRaw}`);
  }

  // Check for duplicate slug
  if (existing.some((p) => p.slug === topic.slug)) {
    console.log(`Slug "${topic.slug}" already exists, skipping`);
    return null;
  }

  // Step 2: Generate article
  const content = await generate(ai, buildArticlePrompt(topic));

  if (content.length < config.minWords) {
    throw new Error(`Generated content too short (${content.length} chars)`);
  }

  // Step 3: Compute metadata
  const wordCount = content.split(/\s+/).length;
  const readTime = `${Math.max(config.minReadTime, Math.ceil(wordCount / config.wordsPerMinute))} min read`;

  // Step 4: Assemble MDX
  const frontMatter = {
    title: topic.title,
    description: topic.description,
    date: new Date().toISOString().split('T')[0],
    author: config.author,
    tags: topic.tags,
    readTime,
    slug: topic.slug,
  };

  const mdx = matter.stringify(content, frontMatter);

  // Step 5: Write file
  const filename = `${topic.slug}${config.extension}`;
  const filePath = path.join(blogDir, filename);

  if (!options?.dryRun) {
    fs.writeFileSync(filePath, mdx, 'utf-8');
  }

  return { filename, title: topic.title, slug: topic.slug, wordCount, readTime, filePath };
}
