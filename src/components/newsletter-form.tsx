"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [done, setDone] = useState(false);

  return (
    <form
      className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        setDone(true);
      }}
    >
      <Input
        type="email"
        required
        name="email"
        autoComplete="email"
        aria-label="Email address"
        placeholder="Enter your email"
        className="h-9 flex-1"
      />
      <Button type="submit" className="h-9" disabled={done}>
        {done ? (
          <>
            Subscribed <Check />
          </>
        ) : (
          "Subscribe"
        )}
      </Button>
    </form>
  );
}
