import { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: "gold" | "ivory";
  align?: "left" | "center";
  titleAs?: "h2" | "h3";
};

export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = "gold",
  align = "left",
  titleAs: Title = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={`max-w-[var(--width-narrow)] ${
        align === "center" ? "mx-auto text-center" : ""
      }`}
    >
      {eyebrow ? (
        <div className={align === "center" ? "flex justify-center" : ""}>
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </div>
      ) : null}
      <Title
        className={`mt-4 text-h3 sm:text-h2 ${
          tone === "ivory" ? "text-ivory-50" : "text-navy-950"
        }`}
      >
        {title}
      </Title>
      {lead ? (
        <p
          className={`mt-4 text-lead ${
            tone === "ivory" ? "text-ivory-200/85" : "text-charcoal-500"
          }`}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
