"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, CreditCard, Loader2, Sparkles, Star, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { SUBMISSION_LIMITS, validateSubmission, type PlanKey, type SubmissionErrors, type SubmissionField } from "@/lib/submission";

const PLANS: {
  key: PlanKey;
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  icon: typeof Zap;
  features: string[];
  featured?: boolean;
}[] = [
  {
    key: "free",
    name: "Standard listing",
    price: "$0",
    cadence: "forever",
    blurb: "Get into the directory and country pages.",
    icon: Star,
    features: [
      "Card profile with full fee table",
      "Included in relevant country pages",
      "Standard review queue (5–7 days)",
      "One free data correction per quarter",
    ],
  },
  {
    key: "verified",
    name: "Verified Fast-Track",
    price: "$299",
    cadence: "one-time",
    blurb: "Verified badge plus a 48-hour data review.",
    icon: Zap,
    featured: true,
    features: [
      "Verified checkmark on every listing",
      "48-hour review and publishing",
      "Priority placement in guide pages",
      "Two data updates per quarter",
      "Schema + metadata audit of your profile",
    ],
  },
  {
    key: "sponsored",
    name: "Sponsored Partner",
    price: "$999",
    cadence: "per month",
    blurb: "Pinned placement and hero inventory.",
    icon: Sparkles,
    features: [
      "Pinned top-of-directory placement",
      "Hero / featured partner slot rotation",
      "Mid-feed banner inclusion",
      "Affiliate click reporting dashboard",
      "Unlimited fee updates",
      "Cancel anytime, 30-day terms",
    ],
  },
];

export function SubmitCardForm() {
  const [plan, setPlan] = useState<PlanKey>("verified");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<SubmissionErrors>({});
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const [submissionId, setSubmissionId] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const choose = (key: PlanKey) => {
    setPlan(key);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      company: String(data.get("company") ?? ""),
      cardName: String(data.get("cardName") ?? ""),
      website: String(data.get("website") ?? ""),
      contactName: String(data.get("contactName") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
      plan,
      fax: String(data.get("fax") ?? ""),
      startedAt: startedAt.current,
    };

    const checked = validateSubmission(payload);
    if (checked.ok && !data.get("consent")) {
      setFieldErrors({});
      setStatus("error");
      setError("Tick the box to confirm you're authorised to submit this listing.");
      form.querySelector<HTMLElement>('[name="consent"]')?.focus();
      return;
    }
    if (!checked.ok) {
      setFieldErrors(checked.errors);
      setStatus("error");
      setError("Please fix the highlighted fields.");
      form.querySelector<HTMLElement>(`[name="${Object.keys(checked.errors)[0]}"]`)?.focus();
      return;
    }

    setStatus("loading");
    setError("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/submit-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        id?: string;
        error?: string;
        fieldErrors?: SubmissionErrors;
      };
      if (!response.ok || !body.ok) {
        setFieldErrors(body.fieldErrors ?? {});
        setStatus("error");
        setError(body.error || "Something went wrong. Email hello@rituel.xyz and we'll sort it.");
        return;
      }
      setSubmissionId(body.id ?? "");
      setStatus("success");
      form.reset();
      startedAt.current = Date.now();
    } catch {
      setStatus("error");
      setError("Network error. Email hello@rituel.xyz and we'll pick it up manually.");
    }
  }

  return (
    <div>
      <div className="grid gap-3 lg:grid-cols-3">
        {PLANS.map((item) => {
          const Icon = item.icon;
          const active = plan === item.key;
          return (
            <div
              key={item.key}
              className={cn(
                "relative flex flex-col rounded-xl border bg-card p-5 transition",
                active ? "border-primary ring-1 ring-primary/20" : "border-border",
              )}
            >
              {item.featured && (
                <span className="absolute -top-2.5 left-4 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                  Most popular
                </span>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                {active && <Check className="h-4 w-4 text-success" />}
              </div>
              <h3 className="mt-3 text-base font-semibold text-foreground">{item.name}</h3>
              <p className="text-xs text-muted-foreground">{item.blurb}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight text-foreground">{item.price}</span>
                <span className="text-xs text-muted-foreground">{item.cadence}</span>
              </div>
              <ul className="mt-3 flex-1 space-y-1.5">
                {item.features.map((feature) => (
                  <li key={feature} className="flex gap-1.5 text-xs leading-4 text-muted-foreground">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" /> {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => choose(item.key)}
                className={cn(
                  "mt-4 inline-flex h-9 items-center justify-center gap-1 rounded-lg px-3 text-xs font-semibold transition",
                  active
                    ? "bg-primary text-primary-foreground hover:bg-primary/80"
                    : "border border-border bg-card text-foreground hover:bg-muted",
                )}
              >
                {active ? "Selected" : "Choose plan"} <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>

      <div ref={formRef} id="submit-form" className="mt-6 scroll-mt-24 rounded-xl border border-border bg-card p-5 sm:p-6">
        {status === "success" ? (
          <div className="py-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
              <Check className="h-6 w-6" strokeWidth={3} />
            </div>
            <h3 className="mt-3 text-lg font-semibold text-foreground">Submission received</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-5 text-muted-foreground">
              Reference <span className="font-mono text-foreground">{submissionId || "pending"}</span>. We&apos;ll review
              the fee schedule and reply within two business days. If you selected a paid plan, a payment link
              follows after the data check.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setError("");
              }}
              className="mt-4 rounded-lg border border-border px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted"
            >
              Submit another card
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Submission</div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">Tell us about the card</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  We review every submission manually. Fee schedules and country lists preferred.
                </p>
              </div>
              <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Plan: {PLANS.find((item) => item.key === plan)?.name}
              </span>
            </div>

            <form onSubmit={onSubmit} noValidate className="mt-4 grid gap-3 sm:grid-cols-2">
              {/* Honeypot: hidden from people, filled in by naive bots. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Fax
                  <input name="fax" type="text" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <Field label="Company / issuer" name="company" placeholder="Acme Financial Ltd" required errors={fieldErrors} />
              <Field label="Card name" name="cardName" placeholder="Acme Crypto Card" required errors={fieldErrors} />
              <Field label="Website" name="website" placeholder="https://acme.com/card" type="url" errors={fieldErrors} />
              <Field label="Your name" name="contactName" placeholder="Alex Morgan" autoComplete="name" errors={fieldErrors} />
              <Field label="Work email" name="email" placeholder="alex@acme.com" type="email" required autoComplete="email" errors={fieldErrors} />
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground" htmlFor="plan-select">
                  Plan
                </label>
                <select
                  id="plan-select"
                  value={plan}
                  onChange={(event) => setPlan(event.target.value as PlanKey)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {PLANS.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.name} — {item.price} {item.cadence}
                    </option>
                  ))}
                </select>
              </div>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Anything we should know? (fees, availability, launch date)
                </span>
                <textarea
                  name="message"
                  rows={4}
                  maxLength={SUBMISSION_LIMITS.message}
                  aria-invalid={Boolean(fieldErrors.message) || undefined}
                  placeholder="We're launching in the EEA in November. Fees: 0% FX, 1% top-up, $0 annual. Happy to share the full schedule."
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
                {fieldErrors.message && <span className="mt-1 block text-xs text-destructive">{fieldErrors.message}</span>}
              </label>
              <label className="flex items-start gap-2 sm:col-span-2">
                <input type="checkbox" name="consent" required className="mt-0.5 h-3.5 w-3.5 accent-primary" />
                <span className="text-xs leading-4 text-muted-foreground">
                  I&apos;m authorised to submit this listing and confirm the fee data is accurate to the best of my
                  knowledge. I understand RItuel may verify the data independently.
                </span>
              </label>

              {error && (
                <p role="alert" className="text-xs text-destructive sm:col-span-2">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/80 disabled:cursor-wait disabled:opacity-70"
                >
                  {status === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
                  {status === "loading" ? "Submitting…" : "Submit for review"}
                </button>
                <span className="text-[10px] text-muted-foreground">
                  Payment is collected after the data review. Stripe or USDC invoice.
                </span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  required,
  autoComplete,
  errors,
}: {
  label: string;
  name: SubmissionField;
  placeholder: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  errors: SubmissionErrors;
}) {
  const error = errors[name];
  const errorId = `${name}-error`;
  return (
    <label>
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={SUBMISSION_LIMITS[name]}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30",
        )}
      />
      {error && (
        <span id={errorId} className="mt-1 block text-xs text-destructive">
          {error}
        </span>
      )}
    </label>
  );
}
