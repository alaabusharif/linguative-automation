import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { solutions } from "@/lib/content/solutions";

export function CoreSolutions() {
  return (
    <section className="bg-ivory-50 py-24 sm:py-28 lg:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="What we do"
            title="Six disciplines, one delivery team."
            lead="From the interpreter in the booth to the stream reaching a delegate on another continent, Linguative runs the full communication layer of an event as a single, accountable service."
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-navy-950/10 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution, index) => (
            <Reveal key={solution.href} delay={index * 60}>
              <Link
                href={solution.href}
                className="group flex h-full flex-col justify-between bg-ivory-50 p-8 transition-colors hover:bg-navy-950"
              >
                <div>
                  <span className="font-display text-sm text-gold-700 group-hover:text-gold-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-h4 text-navy-950 group-hover:text-ivory-50">
                    {solution.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal-500 group-hover:text-ivory-100/70">
                    {solution.summary}
                  </p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-navy-950 group-hover:text-gold-200">
                  Learn more
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden className="transition-transform group-hover:translate-x-1">
                    <path d="M1 5h13.5M9.5 1l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
