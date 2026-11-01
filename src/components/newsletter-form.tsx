"use client";

import { useRef, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = "idle" | "sending" | "done" | "error";

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const startedAt = useRef(Date.now());

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending" || status === "done") return;

    const form = event.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const fax = (form.elements.namedItem("fax") as HTMLInputElement).value;

    setStatus("sending");
    setError("");

    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fax, startedAt: startedAt.current }),
    }).catch(() => null);

    const result = (await response?.json().catch(() => null)) as
      | { ok?: boolean; error?: string }
      | null;

    if (response?.ok && result?.ok) {
      setStatus("done");
    } else {
      setStatus("error");
      setError(result?.error || "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={onSubmit}>
        <input
          type="text"
          name="fax"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <Input
          type="email"
          required
          name="email"
          autoComplete="email"
          aria-label="Email address"
          placeholder="Enter your email"
          className="h-9 flex-1"
          disabled={status === "done"}
        />
        <Button type="submit" className="h-9" disabled={status === "sending" || status === "done"}>
          {status === "done" ? (
            <>
              Subscribed <Check />
            </>
          ) : status === "sending" ? (
            "Subscribing…"
          ) : (
            "Subscribe"
          )}
        </Button>
      </form>
      {status === "error" && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
