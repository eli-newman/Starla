import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Starla — AI Interview Coach',
  description: 'Master your next interview with AI-powered coaching and real-time feedback.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
