"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { primaryNav, solutionsNav } from "@/lib/content/navigation";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const solutionsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [renderedPathname, setRenderedPathname] = useState(pathname);
  if (pathname !== renderedPathname) {
    setRenderedPathname(pathname);
    setMobileOpen(false);
    setSolutionsOpen(false);
  }

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!solutionsRef.current?.contains(event.target as Node)) {
        setSolutionsOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSolutionsOpen(false);
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const solid = scrolled || mobileOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? "bg-ivory-50/95 shadow-[0_1px_0_0_rgba(10,23,48,0.08)] backdrop-blur"
          : "bg-transparent"
      }`}
    >
      <Container className="flex items-center justify-between py-4">
        <Logo tone={solid ? "dark" : "light"} />

        <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
          {primaryNav.map((item) =>
            item.children ? (
              <div key={item.href} ref={solutionsRef} className="relative">
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={solutionsOpen}
                  onClick={() => setSolutionsOpen((v) => !v)}
                  className={`flex items-center gap-1.5 text-sm font-medium tracking-wide transition-colors ${
                    solid ? "text-navy-950 hover:text-gold-700" : "text-ivory-50 hover:text-gold-200"
                  }`}
                >
                  {item.label}
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
                {solutionsOpen ? (
                  <div
                    role="menu"
                    className="absolute left-1/2 top-full mt-4 w-[22rem] -translate-x-1/2 rounded-sm border border-navy-950/10 bg-ivory-50 p-3 shadow-xl"
                  >
                    {solutionsNav.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        role="menuitem"
                        className="block rounded-sm px-4 py-3 transition-colors hover:bg-navy-950/[0.04]"
                      >
                        <span className="block text-sm font-medium text-navy-950">
                          {child.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-charcoal-500">
                          {child.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  solid ? "text-navy-950 hover:text-gold-700" : "text-ivory-50 hover:text-gold-200"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden lg:block">
          <Button href="/contact" variant={solid ? "primary" : "ghost"} className="!py-2.5 !px-6 text-sm">
            Start a conversation
          </Button>
        </div>

        <button
          type="button"
          className="lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="relative flex h-5 w-6 flex-col justify-between">
            <span
              className={`h-px w-full transition-transform ${solid ? "bg-navy-950" : "bg-ivory-50"} ${
                mobileOpen ? "translate-y-[9px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-full transition-opacity ${solid ? "bg-navy-950" : "bg-ivory-50"} ${
                mobileOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`h-px w-full transition-transform ${solid ? "bg-navy-950" : "bg-ivory-50"} ${
                mobileOpen ? "-translate-y-[9px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </Container>

      {mobileOpen ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-navy-950/10 bg-ivory-50 lg:hidden"
        >
          <Container className="flex flex-col gap-1 py-4">
            {primaryNav.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className="block py-3 text-base font-medium text-navy-950"
                >
                  {item.label}
                </Link>
                {item.children ? (
                  <div className="mb-2 flex flex-col gap-0.5 border-l border-navy-950/10 pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="py-2 text-sm text-charcoal-500"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            <Button href="/contact" className="mt-3 w-full justify-center">
              Start a conversation
            </Button>
          </Container>
        </nav>
      ) : null}
    </header>
  );
}
