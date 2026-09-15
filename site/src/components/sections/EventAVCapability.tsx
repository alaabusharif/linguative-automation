import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const stages = [
  {
    step: "Plan",
    copy: "Programme design, run-of-show, and technical specification aligned to your venue and audience.",
  },
  {
    step: "Build",
    copy: "Staging, booths, and hybrid infrastructure installed and tested well ahead of doors-open.",
  },
  {
    step: "Run",
    copy: "Engineers and interpreters on site for the full programme, live-managing every channel.",
  },
  {
    step: "Broadcast",
    copy: "Livestreaming and recording delivered to remote delegates and archived for the record.",
  },
];

export function EventAVCapability() {
  return (
    <section className="bg-charcoal-900 py-24 text-ivory-50 sm:py-28 lg:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Event & AV capability"
            title="Hybrid meetings run like one event, not two."
            lead="In-room and remote delegates share the same programme, the same interpretation, and the same production quality — from opening plenary to final recording."
            tone="ivory"
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((stage, index) => (
            <Reveal key={stage.step} delay={index * 90}>
              <div className="relative pl-8">
                <span
                  aria-hidden
                  className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-gold-400"
                />
                <span
                  aria-hidden
                  className="absolute left-[3px] top-4 h-[calc(100%-1rem)] w-px bg-ivory-50/15 lg:hidden"
                />
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-h4 text-ivory-50">{stage.step}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ivory-100/65">
                  {stage.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
