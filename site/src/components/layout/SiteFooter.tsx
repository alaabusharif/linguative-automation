import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { solutionsNav } from "@/lib/content/navigation";

const columns = [
  {
    title: "Solutions",
    links: solutionsNav.map((s) => ({ label: s.label, href: s.href })),
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Projects", href: "/projects" },
      { label: "Insights", href: "/insights" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy-950 text-ivory-50">
      <Container className="grid grid-cols-1 gap-12 py-16 sm:py-20 lg:grid-cols-[1.618fr_1fr_1fr] lg:gap-8">
        <div className="max-w-[var(--width-minor)]">
          <Logo tone="light" />
          <p className="mt-6 text-sm leading-relaxed text-ivory-200/70">
            {/* PLACEHOLDER — final positioning copy pending SEO/content pass */}
            Specialist interpretation, conference technology, and multilingual
            event solutions for international organizations, governments, and
            corporations — based in Jordan, operating worldwide.
          </p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-gold-200">
              {col.title}
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory-200/80 transition-colors hover:text-gold-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <div className="border-t border-ivory-50/10">
        <Container className="flex flex-col items-start justify-between gap-4 py-6 text-xs text-ivory-200/60 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} Linguative. All rights reserved.</p>
          <p>Amman, Jordan — serving clients internationally.</p>
        </Container>
      </div>
    </footer>
  );
}
