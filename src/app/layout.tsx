import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import AppLayout from '@/components/AppLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Highlanders Amateur Taekwondo CIC | Edinburgh Martial Arts',
    template: '%s | Highlanders Taekwondo',
  },
  description: 'Professional Taekwondo training and community development in Edinburgh, Scotland. Classes for children, youth, and adults of all experience levels.',
  keywords: [
    'Taekwondo', 'Martial Arts Edinburgh', 'Self Defense Scotland', 'Taekwondo Classes Edinburgh',
    'Highlanders Taekwondo', 'Fitness Edinburgh', 'Amateur Taekwondo CIC', 'Scottish Martial Arts',
    'Taekwondo Scotland', 'Dojo Edinburgh'
  ],
  authors: [{ name: 'Highlanders Amateur Taekwondo CIC' }],
  creator: 'Highlanders Amateur Taekwondo CIC',
  publisher: 'Highlanders Amateur Taekwondo CIC',
  metadataBase: new URL('https://highlanderstaekwondo.club'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://highlanderstaekwondo.club',
    siteName: 'Highlanders Amateur Taekwondo CIC',
    title: 'Highlanders Amateur Taekwondo CIC | Edinburgh Martial Arts',
    description: 'Professional Taekwondo training and community development in Edinburgh, Scotland. Classes for children, youth, and adults of all experience levels.',
    images: [
      {
        url: '/images/logo.png',
        width: 800,
        height: 800,
        alt: 'Highlanders Amateur Taekwondo CIC Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Highlanders Amateur Taekwondo CIC | Edinburgh Martial Arts',
    description: 'Professional Taekwondo training and community development in Edinburgh, Scotland.',
    images: ['/images/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsClub",
              "name": "Highlanders Amateur Taekwondo CIC",
              "description": "Professional Taekwondo training, martial arts instruction, and community development in Edinburgh, Scotland.",
              "image": "https://highlanderstaekwondo.club/images/logo.png",
              "url": "https://highlanderstaekwondo.club",
              "telephone": "+44 131 234 5678",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "123 Highland Avenue",
                "addressLocality": "Edinburgh",
                "postalCode": "EH1 2YZ",
                "addressCountry": "GB"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 55.950000,
                "longitude": -3.200000
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "16:00",
                  "closes": "21:30"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Saturday",
                  "opens": "09:00",
                  "closes": "14:00"
                }
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <AppLayout>
          <Toaster position="top-right" />
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
