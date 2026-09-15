import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";

const logoSlots = Array.from({ length: 6 }, (_, i) => i + 1);

export function CredibilitySection() {
  return (
    <section className="bg-ivory-100 py-24 sm:py-28 lg:py-32">
      <Container>
        <Reveal>
          <div className="text-center">
            <div className="flex justify-center">
              <Eyebrow>Trusted in the room</Eyebrow>
            </div>
            <p className="mx-auto mt-4 max-w-[30rem] text-sm text-charcoal-500">
              Client and partner marks pending approval — placeholders shown
              for layout only.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {logoSlots.map((slot, index) => (
            <Reveal key={slot} delay={index * 40}>
              <div className="flex h-16 items-center justify-center rounded-sm border border-navy-950/10 bg-ivory-50 text-[0.6875rem] font-medium uppercase tracking-wide text-charcoal-500">
                Client {slot}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={220}>
          <blockquote className="mx-auto mt-16 max-w-[var(--width-narrow)] text-center">
            <p className="font-display text-h4 italic text-navy-950">
              &ldquo;[Client testimonial pending — placeholder reserved for
              approved quote.]&rdquo;
            </p>
            <footer className="mt-5 text-sm text-charcoal-500">
              — Placeholder, Title, Organization
            </footer>
          </blockquote>
        </Reveal>
      </Container>
    </section>
  );
}
