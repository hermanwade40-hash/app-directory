import '#/styles/globals.css';

import { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: { default: 'Digi PO Tracker', template: '%s | Digi PO Tracker' },
  metadataBase: new URL('https://digi-po-tracker.example.com'),
  description:
    'A purchase order finance dashboard for importing, tracking, exporting, and acknowledging vendor POs.',
  openGraph: {
    title: 'Digi PO Tracker',
    description:
      'A purchase order finance dashboard for importing, tracking, exporting, and acknowledging vendor POs.',
    images: [`/api/og?title=Digi%20PO%20Tracker`],
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
