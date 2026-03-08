import { ImageResponse } from 'next/og';
import { getPostBySlug, getAllPosts } from '@/lib/blog';

export const alt = 'Starla Blog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title ?? 'Starla Blog';
  const description = post?.description ?? 'Interview tips and career advice';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#0a0a0a',
          color: '#fafafa',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#a3a3a3',
              letterSpacing: '-0.02em',
            }}
          >
            Starla Blog
          </div>
        </div>
        <div
          style={{
            fontSize: '56px',
            fontWeight: 300,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '24px',
            maxWidth: '900px',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: '24px',
            color: '#a3a3a3',
            lineHeight: 1.4,
            maxWidth: '800px',
          }}
        >
          {description}
        </div>
      </div>
    ),
    { ...size },
  );
}
