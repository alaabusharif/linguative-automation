/**
 * Stand-in for real photography. Per brief: no invented/AI equipment
 * imagery — real conference, interpreter-booth, and event photography must
 * be supplied and dropped in via next/image. This renders a quiet,
 * on-brand gradient block with a caption so the gap is legible during
 * review rather than looking like a broken image.
 */
export function ImagePlaceholder({
  caption,
  className = "",
  variant = "navy",
}: {
  caption: string;
  className?: string;
  variant?: "navy" | "ivory";
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-sm ${
        variant === "navy"
          ? "bg-[linear-gradient(155deg,var(--color-navy-900),var(--color-navy-700))]"
          : "bg-[linear-gradient(155deg,var(--color-ivory-200),var(--color-ivory-100))]"
      } ${className}`}
    >
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full opacity-[0.07]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.15" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.15" />
        <rect x="0" y="0" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="0.15" />
      </svg>
      <span
        className={`absolute bottom-4 left-4 rounded-sm px-3 py-1.5 text-[0.6875rem] font-medium tracking-wide backdrop-blur-sm ${
          variant === "navy"
            ? "bg-ivory-50/10 text-ivory-100"
            : "bg-navy-950/5 text-navy-700"
        }`}
      >
        {caption}
      </span>
    </div>
  );
}
