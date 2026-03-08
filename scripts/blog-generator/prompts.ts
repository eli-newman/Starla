/**
 * Prompt builders for blog post generation.
 *
 * Separated from the generator so prompts can be tuned independently.
 * Each function returns a plain string prompt ready for the AI.
 */

import { config } from './config';

interface ExistingPost {
  title: string;
  slug: string;
  tags: string[];
}

/**
 * Builds the prompt that asks the AI to pick a new topic.
 * Returns structured JSON with title, slug, description, tags, and target keyword.
 */
export function buildTopicPrompt(existing: ExistingPost[]): string {
  const existingTitles = existing.map((p) => `- "${p.title}" (${p.slug})`).join('\n');
  const existingTags = Array.from(new Set(existing.flatMap((p) => p.tags)));

  const guidance = config.topicGuidance.map((g, i) => `${i + 1}. ${g}`).join('\n');
  const examples = config.topicExamples.map((e) => `"${e}"`).join(', ');

  return `You are an SEO content strategist for ${config.brand.name}, ${config.brand.description}.

Here are the existing blog posts — DO NOT repeat these topics:
${existingTitles}

Existing tags used: ${existingTags.join(', ')}

Generate ONE new blog post idea that:
${guidance}

Example search queries to consider (but don't limit yourself to these): ${examples}

Respond with ONLY valid JSON (no markdown, no code fences):
{
  "title": "SEO-optimized title with target keyword",
  "slug": "url-friendly-slug",
  "description": "155 character meta description with keyword",
  "tags": ["tag1", "tag2", "tag3"],
  "targetKeyword": "the main keyword to target"
}`;
}

/**
 * Builds the prompt that generates the full article content.
 * Returns raw markdown (no front-matter).
 */
export function buildArticlePrompt(topic: {
  title: string;
  targetKeyword: string;
  description: string;
}): string {
  const rules = config.articleRules
    .concat([
      `Write for ${config.brand.audience}`,
      `End with a brief CTA paragraph mentioning ${config.brand.name} (1-2 sentences, not salesy)`,
    ])
    .map((r) => `- ${r}`)
    .join('\n');

  const antiPatterns = config.articleAntiPatterns.map((a) => `- ${a}`).join('\n');

  return `Write a blog post for ${config.brand.name}'s blog (${config.brand.description}).

Title: "${topic.title}"
Target keyword: "${topic.targetKeyword}"
Meta description: "${topic.description}"

Requirements:
${rules}

Do NOT include:
${antiPatterns}`;
}
