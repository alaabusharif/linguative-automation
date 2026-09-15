import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

const languages = [
  "Arabic",
  "French",
  "Spanish",
  "Mandarin",
  "Russian",
  "German",
  "Turkish",
  "Italian",
  "Portuguese",
  "Japanese",
  "Korean",
  "Farsi",
];

export function TranslationSection() {
  return (
    <section className="bg-ivory-50 py-24 sm:py-28 lg:py-32">
      <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1fr_1.618fr] lg:gap-16">
        <Reveal className="order-2 lg:order-1">
          <div className="flex flex-wrap gap-2.5">
            {languages.map((lang, index) => (
              <span
                key={lang}
                style={{ transitionDelay: `${index * 30}ms` }}
                className="rounded-full border border-navy-950/12 px-4 py-2 text-xs font-medium tracking-wide text-navy-950/80"
              >
                {lang}
              </span>
            ))}
            <span className="rounded-full bg-navy-950 px-4 py-2 text-xs font-medium tracking-wide text-ivory-50">
              +18 more
            </span>
          </div>
        </Reveal>

        <Reveal delay={80} className="order-1 lg:order-2">
          <Eyebrow>Translation &amp; localization</Eyebrow>
          <h2 className="mt-5 text-h3">
            The written word, held to the same standard as the spoken one.
          </h2>
          <p className="mt-4 max-w-[36rem] text-charcoal-500">
            {/* PLACEHOLDER — final copy pending content workstream */}
            Certified, legal, technical, and conference-document translation
            with terminology managed across every language pair your
            programme requires — reviewed by native-language specialists,
            not machine output alone.
          </p>
          <div className="mt-8">
            <Button href="/solutions/translation-localization" variant="secondary">
              View translation services
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
