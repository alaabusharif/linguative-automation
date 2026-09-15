import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/ui/Reveal";

const capabilities = [
  "ISO 2603 / 4043 certified interpreter booths",
  "Simultaneous, consecutive, and whispered (chuchotage) interpretation",
  "Distance and hybrid interpreting platforms",
  "Delegate microphone and multi-channel receiver systems",
];

export function InterpretationShowcase() {
  return (
    <section className="bg-ivory-100 py-24 sm:py-28 lg:py-32">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.618fr_1fr] lg:gap-14">
          <Reveal>
            <ImagePlaceholder
              caption="Interpreter booth in session — photography pending"
              variant="ivory"
              className="aspect-[16/11] w-full"
            />
          </Reveal>

          <Reveal delay={100} className="flex flex-col justify-center">
            <Eyebrow>Interpretation &amp; conference technology</Eyebrow>
            <h2 className="mt-5 text-h3">
              Built to the standard diplomacy runs on.
            </h2>
            <p className="mt-4 text-charcoal-500">
              {/* PLACEHOLDER — final copy pending content workstream */}
              Every booth, receiver, and channel we deploy is specified to
              conference-interpretation standards, operated by engineers who
              stay in the room for the full session.
            </p>
            <ul className="mt-7 flex flex-col gap-3">
              {capabilities.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-navy-950">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mt-0.5 shrink-0 text-gold-700" aria-hidden>
                    <circle cx="9" cy="9" r="8.25" stroke="currentColor" strokeWidth="1.1" />
                    <path d="M5.5 9.3l2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button href="/solutions/interpretation" variant="secondary">
                View interpretation services
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Reveal delay={140}>
            <ImagePlaceholder
              caption="Delegate microphone unit — photography pending"
              variant="ivory"
              className="aspect-[16/10] w-full"
            />
          </Reveal>
          <Reveal delay={200}>
            <ImagePlaceholder
              caption="Interpretation control room — photography pending"
              variant="ivory"
              className="aspect-[16/10] w-full"
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
