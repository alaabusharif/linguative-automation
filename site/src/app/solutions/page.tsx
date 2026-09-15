import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { solutions } from "@/lib/content/solutions";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Interpretation, conference technology, translation and localization, event management, audiovisual and hybrid solutions, and transcription.",
  alternates: { canonical: "/solutions" },
};

export default function SolutionsPage() {
  return (
    <section className="bg-navy-950 pt-36 pb-24 text-ivory-50 sm:pt-40 sm:pb-28">
      <Container>
        <Eyebrow tone="ivory">Solutions</Eyebrow>
        <h1 className="mt-5 max-w-[20ch] text-h2 text-ivory-50 sm:text-h1">
          Every discipline an international event needs, under one roof.
        </h1>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-ivory-50/10 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution, index) => (
            <Link
              key={solution.href}
              href={solution.href}
              className="group flex flex-col justify-between bg-navy-950 p-8 transition-colors hover:bg-navy-800"
            >
              <div>
                <span className="font-display text-sm text-gold-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-4 text-h4 text-ivory-50">{solution.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ivory-100/65">
                  {solution.summary}
                </p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-gold-200">
                Learn more
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden className="transition-transform group-hover:translate-x-1">
                  <path d="M1 5h13.5M9.5 1l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
