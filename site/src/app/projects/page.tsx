import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected conferences, summits, and multilingual events delivered by Linguative.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <PlaceholderPage
      eyebrow="Projects"
      title="Case studies from the room."
      description="A full portfolio of conferences, summits, and delegations is being prepared, with photography and outcomes for each engagement."
    />
  );
}
