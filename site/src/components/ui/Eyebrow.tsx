import { ReactNode } from "react";

export function Eyebrow({
  children,
  tone = "gold",
}: {
  children: ReactNode;
  tone?: "gold" | "ivory";
}) {
  return (
    <span
      className={`inline-flex items-center gap-3 text-[0.8125rem] font-medium uppercase tracking-[0.2em] ${
        tone === "gold" ? "text-gold-700" : "text-ivory-200"
      }`}
    >
      <span
        aria-hidden
        className={`h-px w-8 ${tone === "gold" ? "bg-gold-500" : "bg-ivory-200"}`}
      />
      {children}
    </span>
  );
}
