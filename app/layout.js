import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display"
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "AnimeAiring — Anime Release Schedule & Upcoming Episodes",
    template: "%s | AnimeAiring"
  },
  description:
    "Track weekly anime episode schedules and upcoming releases with live countdowns and official streaming links.",
  verification: {
    google: "<meta name="google-site-verification" content="txippdlpp4CGrd31GNP0olRK9xTfB-9fZdUCah8XTX4" />"
  openGraph: {
    type: "website",
    siteName: "AnimeAiring"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable} bg-ink text-white font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
