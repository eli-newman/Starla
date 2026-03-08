/**
 * Blog Generator Configuration
 *
 * Edit this file to customize the generator for any project.
 * All project-specific settings live here — the generator itself is generic.
 */

export const config = {
  /** Directory where .mdx blog posts are stored (relative to project root) */
  blogDir: 'src/content/blog',

  /** File extension for blog posts */
  extension: '.mdx',

  /** Gemini model to use for generation */
  model: 'gemini-2.5-flash',

  /** Author name for generated posts */
  author: 'Starla Team',

  /** Minimum word count — posts shorter than this are rejected */
  minWords: 500,

  /** Words per minute for read time estimation */
  wordsPerMinute: 250,

  /** Minimum read time in minutes */
  minReadTime: 3,

  /**
   * Brand context — tells the AI who you are and who you write for.
   * This is injected into both the topic and article prompts.
   */
  brand: {
    name: 'Starla',
    description: 'an AI interview prep tool for college students and new graduates',
    audience: 'college students with little/no interview experience',
    domain: 'trystarla.com',
  },

  /**
   * Topic generation prompt additions.
   * These guide what kinds of topics the AI picks.
   */
  topicGuidance: [
    'Targets a high-volume search query college students actually Google',
    'Is specific enough to rank (not too broad)',
    'Complements existing content without overlapping',
    'Has clear search intent (informational)',
  ],

  /**
   * Example topics to seed the AI's understanding of good topics.
   * These are just examples — they won't be generated unless the AI picks them.
   */
  topicExamples: [
    'how to answer tell me about yourself',
    'interview tips for introverts',
    'what to wear to an interview',
    'how to follow up after an interview',
    'common interview mistakes',
  ],

  /**
   * Article writing rules injected into the generation prompt.
   * Customize tone, structure, and SEO requirements here.
   */
  articleRules: [
    '800-1200 words',
    'Write in markdown (H2 and H3 headings only, no H1)',
    'Start with a direct answer to the search query in the first paragraph (for featured snippets and AI citations)',
    'Use the target keyword naturally 3-5 times',
    'Include practical, actionable advice (numbered lists, bullet points)',
    'Conversational but authoritative tone',
    'Do NOT include front-matter — just the markdown content',
    'Do NOT start with a heading — start with the opening paragraph directly',
    'Include at least one "Pro tip:" or "Quick tip:" callout',
    'Use bold for key terms on first mention',
  ],

  /** Things the AI should NOT include in the article */
  articleAntiPatterns: [
    'Any YAML front-matter',
    'An H1 heading',
    'Generic filler ("In today\'s competitive job market...")',
    'Markdown code fences around the entire output',
  ],
};
