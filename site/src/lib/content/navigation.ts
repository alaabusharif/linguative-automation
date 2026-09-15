export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export type NavGroup = {
  label: string;
  href: string;
  children?: NavItem[];
};

export const solutionsNav: NavItem[] = [
  {
    label: "Interpretation",
    href: "/solutions/interpretation",
    description: "Simultaneous & consecutive interpretation",
  },
  {
    label: "Conference Technology",
    href: "/solutions/conference-technology",
    description: "Booths, receivers, delegate systems",
  },
  {
    label: "Translation & Localization",
    href: "/solutions/translation-localization",
    description: "Certified and specialist translation",
  },
  {
    label: "Event Management",
    href: "/solutions/event-management",
    description: "Multilingual conferences & summits",
  },
  {
    label: "Audiovisual & Hybrid Solutions",
    href: "/solutions/audiovisual-hybrid",
    description: "Livestreaming, recording, hybrid meetings",
  },
  {
    label: "Transcription",
    href: "/solutions/transcription",
    description: "Multilingual transcription services",
  },
];

export const primaryNav: NavGroup[] = [
  { label: "Home", href: "/" },
  { label: "Solutions", href: "/solutions", children: solutionsNav },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];
