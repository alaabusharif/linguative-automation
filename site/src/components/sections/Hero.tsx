import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/ui/Reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-950 pt-36 pb-24 text-ivory-50 sm:pt-40 sm:pb-28 lg:pt-44 lg:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[42rem] w-[42rem] rounded-full opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle, var(--color-gold-400) 0%, transparent 70%)",
        }}
      />

      <Container className="relative grid grid-cols-1 items-end gap-14 lg:grid-cols-[1.618fr_1fr] lg:gap-10">
        <div>
          <Reveal>
            <Eyebrow tone="ivory">Interpretation &middot; Conference Technology &middot; Translation</Eyebrow>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 max-w-[18ch] text-[2.75rem] leading-[1.08] text-ivory-50 sm:text-h1 lg:text-display">
              Communication{" "}
              <span className="font-display italic text-gold-200">
                beyond
              </span>{" "}
              language.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            {/* PLACEHOLDER positioning statement — final copy from SEO/content workstream */}
            <p className="mt-8 max-w-[38rem] text-lead text-ivory-100/80">
              Linguative delivers simultaneous interpretation, conference
              technology, and multilingual event management for
              international organizations, governments, and corporations —
              engineered so every delegate hears, and is heard, without a
              second thought.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button href="/contact" variant="primary" className="!bg-gold-500 !border-gold-500 !text-navy-950 hover:!bg-gold-400">
                Plan your event
              </Button>
              <Button href="/solutions" variant="ghost">
                Explore solutions
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="lg:pb-2">
          <ImagePlaceholder
            caption="Simultaneous interpretation booth — photography pending"
            className="aspect-[3/4] w-full"
          />
        </Reveal>
      </Container>

      <Container className="relative mt-20 lg:mt-28">
        <Reveal delay={280}>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-ivory-50/10 pt-8 sm:grid-cols-4">
            {[
              ["120+", "conferences delivered"],
              ["30+", "working languages"],
              ["ISO", "booth & system standards"],
              ["Jordan", "based, working worldwide"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-h4 text-gold-200">{value}</dt>
                <dd className="mt-1 text-sm text-ivory-100/65">{label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
