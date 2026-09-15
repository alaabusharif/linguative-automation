import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function ContactCTA() {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-24 text-ivory-50 sm:py-28 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-0 h-[34rem] w-[34rem] rounded-full opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, var(--color-gold-400) 0%, transparent 70%)",
        }}
      />
      <Container className="relative text-center">
        <Reveal>
          <div className="flex justify-center">
            <Eyebrow tone="ivory">Start a conversation</Eyebrow>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mx-auto mt-5 max-w-[24ch] text-h2 text-ivory-50 sm:text-display">
            Tell us what your delegates need to hear.
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-5 max-w-[34rem] text-lead text-ivory-100/75">
            {/* PLACEHOLDER — final copy pending content workstream */}
            Share your dates, languages, and format, and our team will
            propose an interpretation and technology plan within one working
            day.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button href="/contact" variant="primary" className="!bg-gold-500 !border-gold-500 !text-navy-950 hover:!bg-gold-400">
              Request a proposal
            </Button>
            <Button href="/solutions" variant="ghost">
              View all solutions
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
