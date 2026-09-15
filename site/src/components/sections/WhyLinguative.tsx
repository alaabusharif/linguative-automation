import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";

const pillars = [
  {
    title: "Language",
    copy:
      "Accredited interpreters and translators working across 30+ languages, matched to subject matter, not just a language pair.",
    icon: (
      <path d="M4 6h16M4 12h10M4 18h16M15 6c0 6-3 10-3 12" strokeLinecap="round" />
    ),
  },
  {
    title: "People",
    copy:
      "A named project lead on every engagement, on site from load-in to close — not a call centre passing your booking along.",
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14.5 14.6c2.6.2 4.5 2.4 4.5 5.4" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Technology",
    copy:
      "ISO-standard interpretation systems, hybrid infrastructure, and livestreaming operated by our own engineers, not a rental hand-off.",
    icon: (
      <>
        <rect x="4" y="5" width="16" height="11" rx="1.2" />
        <path d="M9 20h6M12 16v4" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Conferences",
    copy:
      "Full event delivery — logistics, staging, and multilingual production — run by the same team responsible for the language layer.",
    icon: (
      <>
        <path d="M4 20V10l8-5 8 5v10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 20v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

export function WhyLinguative() {
  return (
    <section className="bg-navy-950 py-24 text-ivory-50 sm:py-28 lg:py-32">
      <Container className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.618fr] lg:gap-16">
        <Reveal>
          <div className="lg:sticky lg:top-32">
            <Eyebrow tone="ivory">Why Linguative</Eyebrow>
            <h2 className="mt-5 text-h3 text-ivory-50 sm:text-h2">
              One team across language, people, technology, and the
              conference itself.
            </h2>
            <p className="mt-5 max-w-[30rem] text-charcoal-300">
              {/* PLACEHOLDER differentiation copy — final wording pending content workstream */}
              Most vendors hand you off between a translation agency, an AV
              contractor, and an event planner. Linguative runs all three as
              one accountable service, so nothing is lost between the
              booth, the stage, and the stream.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-ivory-50/10 sm:grid-cols-2">
          {pillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 70} className="bg-navy-950 p-8">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                className="text-gold-300"
                aria-hidden
              >
                {pillar.icon}
              </svg>
              <h3 className="mt-5 text-h4 text-ivory-50">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory-100/65">
                {pillar.copy}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
