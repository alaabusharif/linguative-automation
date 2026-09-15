import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell Linguative about your conference, and our team will propose an interpretation and technology plan.",
  alternates: { canonical: "/contact" },
};

const fields: Array<{
  id: string;
  label: string;
  type: "text" | "email" | "date";
  required?: boolean;
  span?: "full";
}> = [
  { id: "name", label: "Full name", type: "text", required: true },
  { id: "organization", label: "Organization", type: "text" },
  { id: "email", label: "Email", type: "email", required: true },
  { id: "event-date", label: "Event date", type: "date" },
];

export default function ContactPage() {
  return (
    <>
      <section className="bg-navy-950 pt-36 pb-20 text-ivory-50 sm:pt-40 sm:pb-24">
        <Container narrow>
          <Eyebrow tone="ivory">Contact</Eyebrow>
          <h1 className="mt-5 text-h2 text-ivory-50 sm:text-h1">
            Tell us what your delegates need to hear.
          </h1>
          <p className="mt-5 max-w-[34rem] text-lead text-ivory-100/75">
            {/* PLACEHOLDER — final copy pending content workstream */}
            Share a few details about your event and our team will follow
            up with an interpretation and technology plan.
          </p>
        </Container>
      </section>

      <section className="bg-ivory-50 py-20 sm:py-24">
        <Container narrow>
          <form className="grid grid-cols-1 gap-6 sm:grid-cols-2" aria-describedby="form-note">
            {fields.map((field) => (
              <div key={field.id} className={field.span === "full" ? "sm:col-span-2" : ""}>
                <label htmlFor={field.id} className="text-sm font-medium text-navy-950">
                  {field.label}
                  {field.required ? <span className="text-gold-700"> *</span> : null}
                </label>
                <input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  required={field.required}
                  className="mt-2 w-full rounded-sm border border-navy-950/15 bg-ivory-50 px-4 py-3 text-sm text-navy-950 outline-none transition-colors focus:border-gold-600"
                />
              </div>
            ))}

            <div className="sm:col-span-2">
              <label htmlFor="message" className="text-sm font-medium text-navy-950">
                Tell us about the event
                <span className="text-gold-700"> *</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="mt-2 w-full rounded-sm border border-navy-950/15 bg-ivory-50 px-4 py-3 text-sm text-navy-950 outline-none transition-colors focus:border-gold-600"
              />
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" variant="primary">
                Request a proposal
              </Button>
              <p id="form-note" className="mt-4 text-xs text-charcoal-500">
                This form is a design placeholder; submission handling is
                pending backend integration.
              </p>
            </div>
          </form>
        </Container>
      </section>
    </>
  );
}
