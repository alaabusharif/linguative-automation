import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/ui/Reveal";

/**
 * PLACEHOLDER project entries — generic categories only, no client names
 * invented. Replace with real case studies (name, client, photography)
 * once supplied.
 */
const projects = [
  {
    category: "International summit",
    scale: "6 languages · 3-day programme",
    caption: "Plenary hall — photography pending",
  },
  {
    category: "Diplomatic forum",
    scale: "12 booths · hybrid delivery",
    caption: "Delegation session — photography pending",
  },
  {
    category: "Corporate conference",
    scale: "Livestream · 4 breakout rooms",
    caption: "Main stage — photography pending",
  },
];

export function SelectedProjects() {
  return (
    <section className="bg-navy-950 py-24 text-ivory-50 sm:py-28 lg:py-32">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <SectionHeading
              eyebrow="Selected work"
              title="In the room where it matters."
              tone="ivory"
            />
          </Reveal>
          <Reveal delay={80}>
            <Link
              href="/projects"
              className="hidden shrink-0 text-sm font-medium text-gold-200 hover:text-gold-100 sm:inline-flex sm:items-center sm:gap-2"
            >
              All projects
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
                <path d="M1 5h13.5M9.5 1l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <Reveal key={project.category} delay={index * 90}>
              <Link href="/projects" className="group block">
                <ImagePlaceholder caption={project.caption} className="aspect-[4/5] w-full" />
                <div className="mt-5">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-300">
                    {project.category}
                  </p>
                  <p className="mt-2 text-sm text-ivory-100/70">{project.scale}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={280} className="mt-10 sm:hidden">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-gold-200">
            All projects
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
              <path d="M1 5h13.5M9.5 1l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
