import "./globals.css";
import Link from "next/link";

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
      <body className="min-h-screen bg-zinc-50 text-zinc-900">
        <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight">
              SQL Trainer
            </Link>

            <nav className="flex items-center gap-1">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>

        <footer className="border-t bg-white">
          <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-zinc-500">
            MVP • Text + practice first
          </div>
        </footer>
      </body>
    </html>
  );
}


/* import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b p-3">
          <nav className="flex gap-4 text-sm">
            <Link href="/">Home</Link>
            <Link href="/lessons">Lessons</Link>
            <Link href="/practice">Practice</Link>
            <Link href="/review">Review</Link>
            <Link href="/progress">Progress</Link>
          </nav>
        </header>

        {children}
      </body>
    </html>
  );
} */