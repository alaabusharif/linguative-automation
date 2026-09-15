import { Hero } from "@/components/sections/Hero";
import { CoreSolutions } from "@/components/sections/CoreSolutions";
import { WhyLinguative } from "@/components/sections/WhyLinguative";
import { InterpretationShowcase } from "@/components/sections/InterpretationShowcase";
import { SelectedProjects } from "@/components/sections/SelectedProjects";
import { TranslationSection } from "@/components/sections/TranslationSection";
import { EventAVCapability } from "@/components/sections/EventAVCapability";
import { CredibilitySection } from "@/components/sections/CredibilitySection";
import { ContactCTA } from "@/components/sections/ContactCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CoreSolutions />
      <WhyLinguative />
      <InterpretationShowcase />
      <SelectedProjects />
      <TranslationSection />
      <EventAVCapability />
      <CredibilitySection />
      <ContactCTA />
    </>
  );
}
