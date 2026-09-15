import Link from "next/link";

/**
 * PLACEHOLDER WORDMARK.
 *
 * The approved Linguative emblem (architectural L + bridge element + three
 * figures, built on a golden-ratio grid) is locked and must not be
 * redesigned, reinterpreted, or regenerated here. No attempt at the mark is
 * made in code — this renders the wordmark only, as a stand-in, until the
 * real logo files (SVG preferred, plus a reversed/light variant for dark
 * backgrounds) are supplied. Swap this component's contents for an
 * <Image>/<svg> of the real asset; every call site already passes `tone`
 * so the swap is a one-file change.
 */
export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <Link
      href="/"
      aria-label="Linguative — Communication Beyond Language. Home"
      className="group inline-flex flex-col leading-none"
    >
      <span
        className={`font-display text-[1.5rem] font-medium tracking-[0.02em] ${
          tone === "light" ? "text-ivory-50" : "text-navy-950"
        }`}
      >
        LINGUATIVE
      </span>
      <span
        className={`mt-1 text-[0.625rem] font-medium uppercase tracking-[0.28em] ${
          tone === "light" ? "text-gold-200" : "text-gold-700"
        }`}
      >
        Communication Beyond Language
      </span>
    </Link>
  );
}
