import "./globals.css";
import Link from "next/link";
import { cn, theme } from "./lib/theme";

const nav = [
  { href: "/", label: "Home" },
  { href: "/lessons", label: "Lessons" },
  { href: "/review", label: "Review" },
  { href: "/progress", label: "Progress" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // IMPORTANT: give <html> a fallback bg so Safari gutters/edges match
    <html lang="en" className="h-full bg-yellow-50">
      <body className={cn("min-h-screen antialiased overflow-x-hidden", theme.page.text)}>
        {/* ======================================================
            GLOBAL BACKGROUND STACK (applies to ALL pages)
            Order matters — do not rearrange
           ====================================================== */}

        {/* 1) Background image (ONLY layer with filter) */}
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-30 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/backgrounds/home-sql-warm.png')",
            filter: "hue-rotate(-5deg) saturate(.5) brightness(1.75)",
          }}
        />

        {/* 2) Warm yellow tint (no filter) */}
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-20 bg-yellow-100/20 mix-blend-multiply"
        />

        {/* 3) Readability overlay (no filter) */}
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 bg-white/55 backdrop-blur-[2px]"
        />

        {/* ======================================================
            HEADER
           ====================================================== */}
        <header
          className={cn(
            "sticky top-0 z-10 backdrop-blur",
            theme.header.bg,
            theme.header.border
          )}
        >
          <div className="flex w-full items-center justify-between px-4 py-3 md:px-8">
            <Link
              href="/"
              className={cn("font-semibold tracking-tight", theme.header.text)}
            >
              SQL Trainer
            </Link>

            <nav className="flex items-center gap-1">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm transition",
                    theme.header.link,
                    theme.header.linkHoverBg
                  )}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* ======================================================
            MAIN CONTENT
           ====================================================== */}
        <main className="w-full px-4 py-8 md:px-8">{children}</main>

        {/* ======================================================
            FOOTER
           ====================================================== */}
        <footer className="border-t bg-white/70 backdrop-blur-[2px]">
          <div
            className={cn(
              "w-full px-4 py-6 text-xs md:px-8 text-center",
              theme.page.mutedText
            )}
          >
            <span className="font-medium">Retention Labs</span>
            <span className="mx-1">—</span>
            <span>where practice becomes mastery</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
