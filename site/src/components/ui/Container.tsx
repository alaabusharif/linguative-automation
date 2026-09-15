import { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
  as?: "div" | "section" | "header" | "footer";
};

export function Container({
  children,
  className = "",
  narrow = false,
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={`mx-auto w-full px-6 sm:px-8 lg:px-12 ${
        narrow ? "max-w-[var(--width-narrow)]" : "max-w-[var(--width-content)]"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
