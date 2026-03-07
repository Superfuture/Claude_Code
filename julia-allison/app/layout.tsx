import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Julia Allison — Media Personality, Author & Speaker",
  description:
    "Julia Allison is a media personality, journalist, and speaker known for her work across print, television, and digital media. Available for speaking engagements, interviews, and brand partnerships.",
  keywords: [
    "Julia Allison",
    "media personality",
    "speaker",
    "journalist",
    "author",
    "TV personality",
    "keynote speaker",
    "brand partnerships",
  ],
  authors: [{ name: "Julia Allison" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://juliaallison.com",
    siteName: "Julia Allison",
    title: "Julia Allison — Media Personality, Author & Speaker",
    description:
      "Julia Allison is a media personality, journalist, and speaker. Available for speaking engagements, interviews, and brand partnerships.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Julia Allison",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Julia Allison — Media Personality, Author & Speaker",
    description:
      "Julia Allison is a media personality, journalist, and speaker.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Julia Allison",
  jobTitle: "Media Personality, Author & Speaker",
  url: "https://juliaallison.com",
  sameAs: [
    "https://instagram.com/juliaallison",
    "https://twitter.com/juliaallison",
    "https://linkedin.com/in/juliaallison",
  ],
  knowsAbout: [
    "Media",
    "Journalism",
    "Public Speaking",
    "Technology",
    "Culture",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <link rel="canonical" href="https://juliaallison.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  );
}
