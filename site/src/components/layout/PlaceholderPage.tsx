import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { ReactNode } from "react";

/**
 * Reusable template for routes not yet designed. Keeps the header/footer
 * and typographic system consistent so navigation never 404s while pages
 * are built out one at a time, per the phased homepage-first workflow.
 */
export function PlaceholderPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-navy-950 pt-36 pb-24 text-ivory-50 sm:pt-40 sm:pb-28">
      <Container narrow>
        <Eyebrow tone="ivory">{eyebrow}</Eyebrow>
        <h1 className="mt-5 text-h2 text-ivory-50 sm:text-h1">{title}</h1>
        <p className="mt-5 max-w-[34rem] text-lead text-ivory-100/75">
          {description}
        </p>
        <p className="mt-3 text-sm text-gold-300">
          This page is in development and will follow the homepage&rsquo;s
          approved visual language.
        </p>
        {children}
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/contact" variant="primary" className="!bg-gold-500 !border-gold-500 !text-navy-950 hover:!bg-gold-400">
            Contact us
          </Button>
          <Button href="/" variant="ghost">
            Back to homepage
          </Button>
        </div>
      </Container>
    </section>
  );
}
