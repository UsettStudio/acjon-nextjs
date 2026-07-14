
import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Playfair_Display,
  Poppins,
  Space_Grotesk,
  Teko,
  Unbounded,
} from "next/font/google";
import "./globals.scss";
import "swiper/css/bundle";
import { ToastContainer } from "react-toastify";
import { SITE_URL, siteConfig } from "@/data/siteConfig";

// Initialize Google Fonts
export const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-bricolage-grotesque",
  display: "swap",
  axes: ["opsz"],
  preload: true,
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  preload: false,
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  preload: false,
});

const teko = Teko({
  variable: "--font-teko",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  preload: false,
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Usett 3D Studio – 3D-visualisering i Østfold",
    template: "%s | Usett",
  },
  description: siteConfig.description,
  applicationName: siteConfig.legalName,
  authors: [{ name: siteConfig.legalName, url: SITE_URL }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  category: "3D-visualisering",
  formatDetection: { telephone: true, email: true, address: true },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: SITE_URL,
    siteName: siteConfig.legalName,
    title: "Usett 3D Studio – 3D-visualisering i Østfold",
    description: siteConfig.description,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "Usett 3D Studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Usett 3D Studio – 3D-visualisering i Østfold",
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no"
      className={`
          ${bricolageGrotesque.variable} 
          ${playfairDisplay.variable} 
          ${poppins.variable} 
          ${spaceGrotesk.variable} 
          ${teko.variable} 
          ${unbounded.variable}
        `}
    >
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}

