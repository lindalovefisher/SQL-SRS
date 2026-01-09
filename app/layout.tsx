import "./globals.css";
import Link from "next/link";
import { cn, theme } from "./lib/theme";

const nav = [
  { href: "/", label: "Home" },
  { href: "/lessons", label: "Lessons" },
  { href: "/practice", label: "Practice" },
  { href: "/review", label: "Review" },
  { href: "/progress", label: "Progress" },
];


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen antialiased", theme.page.bg, theme.page.text)}>

        <header
          className={cn(
            "sticky top-0 z-10 backdrop-blur",
            theme.header.bg,
            theme.header.border
          )}
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className={cn("font-semibold tracking-tight", theme.header.text)}>
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


        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>

        <footer className="border-t bg-white">
          <div className={cn("mx-auto max-w-5xl px-4 py-6 text-xs", theme.page.mutedText)}>
            MVP • Text + practice first
          </div>
        </footer>
      </body>
    </html>
  );
}

