import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const metadata: Metadata = {
  title: "About",
  description:
    "Linguative is a Jordan-based specialist in interpretation, conference technology, and multilingual event delivery, serving clients internationally.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PlaceholderPage
      eyebrow="About"
      title="A communication team built for the conference room."
      description="Our history, leadership, and accreditations are being finalized for publication here."
    />
  );
}
