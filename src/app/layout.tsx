import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { FavoritesProvider } from "@/lib/favorites";
import { InterviewsProvider } from "@/lib/interviews";
import { AuthMenu } from "@/components/AuthMenu";
import { BackToTopButton } from "@/components/BackToTopButton";
import { FavoritesHeaderLink } from "@/components/FavoritesHeaderLink";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IT Interview Preparation",
  description: "Curated IT interview questions across categories, sorted from easy to hard.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <AuthProvider>
          <FavoritesProvider>
            <InterviewsProvider>
              <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                  <Link href="/" className="flex items-center gap-2 font-semibold">
                    <span className="text-xl" aria-hidden>🎯</span>
                    <span>IT Interview Prep</span>
                  </Link>
                  <div className="flex items-center gap-3">
                    <FavoritesHeaderLink />
                    <AuthMenu />
                  </div>
                </div>
              </header>
              <main className="mx-auto w-full max-w-5xl px-6 py-10">{children}</main>
              <footer className="border-t border-zinc-200 py-8 text-center text-xs text-zinc-500 dark:border-zinc-800">
                Built with Next.js · Static export · Deployed on Cloudflare Pages
              </footer>
              <BackToTopButton />
            </InterviewsProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
