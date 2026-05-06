import '#/styles/globals.css';

import { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: { default: 'ForumSpace', template: '%s | ForumSpace' },
  metadataBase: new URL('https://forumspace.example.com'),
  description:
    'A modern forum website for categories, threads, replies, moderation, and community activity.',
  openGraph: {
    title: 'ForumSpace',
    description:
      'A modern forum website for categories, threads, replies, moderation, and community activity.',
    images: [`/api/og?title=ForumSpace`],
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="[color-scheme:dark]">
      <body
        className={`min-h-screen overflow-y-scroll bg-slate-950 font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
