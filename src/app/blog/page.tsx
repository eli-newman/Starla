import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Interview Tips & Career Advice | Starla Blog',
  description:
    'Expert interview preparation tips, STAR method guides, behavioral question breakdowns, and career advice for college students and new graduates.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Interview Tips & Career Advice | Starla Blog',
    description:
      'Expert interview preparation tips, STAR method guides, and career advice for college students.',
    type: 'website',
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 text-center">
          <p className="text-neutral-500 text-sm font-mono uppercase tracking-widest mb-4">
            Blog
          </p>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-white mb-4">
            Interview tips & career advice
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Actionable guides to help you prepare, practice, and land the offer.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group p-8 rounded-3xl border border-neutral-900 hover:border-neutral-800 transition-colors block"
            >
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
              </div>
              <h2 className="text-xl font-medium text-white group-hover:text-neutral-300 transition-colors mb-3">
                {post.title}
              </h2>
              <p className="text-neutral-500 text-sm leading-relaxed mb-4">
                {post.description}
              </p>
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
