import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";

export function BlogEmpty() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-foreground">
        <Newspaper className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">First posts are on the way</h2>
      <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
        We are writing fee breakdowns, card launches and country guides. In the meantime, the directory has every
        card we track.
      </p>
      <Link
        href="/"
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        Browse all cards <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
