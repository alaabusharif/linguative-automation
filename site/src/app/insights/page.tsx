import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Perspective on interpretation, conference technology, and multilingual event delivery from the Linguative team.",
  alternates: { canonical: "/insights" },
};

export default function InsightsPage() {
  return (
    <PlaceholderPage
      eyebrow="Insights"
      title="Field notes from the booth and the stage."
      description="Articles on interpretation practice, conference technology, and event delivery will be published here."
    />
  );
}
