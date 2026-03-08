import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog';
import { MDXContent } from '@/components/mdx-content';
import { extractHeadings, TableOfContents } from '@/components/table-of-contents';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Starla Blog`,
    description: post.description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const wordCount = post.content.split(/\s+/).length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    wordCount,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: 'https://trystarla.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Starla',
      url: 'https://trystarla.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://trystarla.com/blog/${slug}`,
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://trystarla.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://trystarla.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://trystarla.com/blog/${slug}`,
      },
    ],
  };

  return (
    <article className="px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/blog"
          className="text-neutral-500 hover:text-white transition-colors text-sm mb-8 inline-block"
        >
          &larr; Back to blog
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 text-sm text-neutral-600 mb-4">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span>&middot;</span>
            <span>{post.readTime}</span>
            <span>&middot;</span>
            <span>{post.author}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-neutral-900 text-neutral-500 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Table of Contents */}
        <TableOfContents headings={extractHeadings(post.content)} />

        {/* Content */}
        <MDXContent source={post.content} />

        {/* CTA */}
        <div className="mt-16 p-8 rounded-3xl border border-neutral-800 bg-neutral-900/30 text-center">
          <h2 className="text-2xl font-light text-white mb-3">
            Ready to practice?
          </h2>
          <p className="text-neutral-400 mb-6">
            Get AI-powered feedback on every answer. Practice anytime, improve
            fast.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
          >
            Try Starla free
          </Link>
        </div>

        {/* Related Posts */}
        {(() => {
          const related = getRelatedPosts(slug);
          if (related.length === 0) return null;
          return (
            <div className="mt-16">
              <h2 className="text-xl font-light text-white mb-6">Related articles</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="p-5 rounded-2xl border border-neutral-900 hover:border-neutral-700 transition-colors group"
                  >
                    <p className="text-sm text-neutral-600 mb-2">
                      {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <h3 className="text-white font-light group-hover:text-neutral-300 transition-colors leading-snug">
                      {r.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </article>
  );
}
