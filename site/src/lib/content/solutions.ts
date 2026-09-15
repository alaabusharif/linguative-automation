export type Solution = {
  slug: string;
  title: string;
  href: string;
  summary: string;
};

/**
 * PLACEHOLDER summaries — structural stand-ins (accurate to Linguative's
 * service lines) pending final SEO-mapped copy.
 */
export const solutions: Solution[] = [
  {
    slug: "interpretation",
    title: "Interpretation",
    href: "/solutions/interpretation",
    summary:
      "Simultaneous and consecutive interpretation delivered by accredited conference interpreters, in the room or over a distance interpreting platform.",
  },
  {
    slug: "conference-technology",
    title: "Conference Technology",
    href: "/solutions/conference-technology",
    summary:
      "Interpreter booths, delegate microphone units, and receiver systems specified and operated to ISO conference standards.",
  },
  {
    slug: "translation-localization",
    title: "Translation & Localization",
    href: "/solutions/translation-localization",
    summary:
      "Certified, legal, and technical translation with terminology management across the language pairs international work demands.",
  },
  {
    slug: "event-management",
    title: "Event Management",
    href: "/solutions/event-management",
    summary:
      "End-to-end planning and delivery for multilingual conferences, summits, and delegations — logistics through to closing session.",
  },
  {
    slug: "audiovisual-hybrid",
    title: "Audiovisual & Hybrid Solutions",
    href: "/solutions/audiovisual-hybrid",
    summary:
      "Staging, livestreaming, recording, and hybrid-meeting infrastructure that keeps in-room and remote delegates on equal footing.",
  },
  {
    slug: "transcription",
    title: "Transcription",
    href: "/solutions/transcription",
    summary:
      "Accurate multilingual transcription of proceedings, panels, and interviews, formatted for the record or for publication.",
  },
];
