import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Starla — AI Interview Coach',
  description: 'Master your next interview with AI-powered coaching, real-time voice interaction, and personalized feedback.',
  keywords: ['interview prep', 'AI interview coach', 'mock interview', 'behavioral interview', 'technical interview', 'career'],
  authors: [{ name: 'Eli Newman' }],
  creator: 'Eli Newman',
  metadataBase: new URL('https://starla-ai.vercel.app'),
  openGraph: {
    title: 'Starla — AI Interview Coach',
    description: 'Practice interviews with an AI coach that gives real-time feedback on your answers.',
    url: 'https://starla-ai.vercel.app',
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
