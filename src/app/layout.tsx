import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Starla — AI Interview Coach',
  description: 'Master your next interview with AI-powered coaching, real-time voice interaction, and personalized feedback.',
  keywords: ['interview prep', 'AI interview coach', 'mock interview', 'behavioral interview', 'technical interview', 'career', 'STAR method'],
  authors: [{ name: 'Eli Newman' }],
  creator: 'Eli Newman',
  metadataBase: new URL('https://trystarla.com'),
  openGraph: {
    title: 'Starla — AI Interview Coach',
    description: 'Practice interviews with an AI coach that gives real-time feedback on your answers.',
    url: 'https://trystarla.com',
    siteName: 'Starla',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starla — AI Interview Coach',
    description: 'Practice interviews with an AI coach that gives real-time feedback on your answers.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Starla',
              url: 'https://trystarla.com',
              description:
                'AI-powered interview preparation platform for college students and new graduates.',
              sameAs: [],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'eli@starla-ai.com',
                contactType: 'customer support',
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
