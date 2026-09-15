import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { solutions } from "@/lib/content/solutions";

export function generateStaticParams() {
  return solutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata(
  props: PageProps<"/solutions/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const solution = solutions.find((s) => s.slug === slug);
  if (!solution) return {};
  return {
    title: solution.title,
    description: solution.summary,
    alternates: { canonical: solution.href },
  };
}

export default async function SolutionPage(
  props: PageProps<"/solutions/[slug]">
) {
  const { slug } = await props.params;
  const solution = solutions.find((s) => s.slug === slug);
  if (!solution) notFound();

  return (
    <PlaceholderPage
      eyebrow="Solutions"
      title={solution.title}
      description={solution.summary}
    />
  );
}
