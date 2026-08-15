import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "react-hot-toast";

const inter   = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit  = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

export const metadata: Metadata = {
  metadataBase:        new URL(process.env.NEXT_PUBLIC_APP_URL || "https://socialboostgh.com"),
  title: {
    default:  "SocialBoost GH — Grow Your Social Media Instantly",
    template: "%s | SocialBoost GH",
  },
  description:         "Buy high-quality followers, likes, views and engagement for TikTok, YouTube, Facebook, Instagram and X. Fast delivery, real engagement, 24/7 support.",
  keywords:            ["buy followers", "buy likes", "buy views", "SMM panel Ghana", "TikTok followers Ghana", "YouTube views Ghana"],
  authors:             [{ name: "SocialBoost GH" }],
  creator:             "SocialBoost GH",
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         "https://socialboostgh.com",
    title:       "SocialBoost GH — Grow Your Social Media Instantly",
    description: "Buy high-quality followers, likes, views and engagement for TikTok, YouTube, Facebook, Instagram and X.",
    siteName:    "SocialBoost GH",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "SocialBoost GH",
    description: "Buy high-quality social media engagement. Fast, safe, guaranteed.",
    creator:     "@socialboostgh",
  },
  robots: {
    index:  true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <SessionProvider>
          <ThemeProvider>
            <QueryProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  className: "!rounded-xl !font-medium",
                  style: {
                    background: "var(--toast-bg, #ffffff)",
                    color:      "var(--toast-color, #111827)",
                    border:     "1px solid var(--toast-border, #e5e7eb)",
                  },
                  success: { iconTheme: { primary: "#6366f1", secondary: "#fff" } },
                  error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
                }}
              />
            </QueryProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
