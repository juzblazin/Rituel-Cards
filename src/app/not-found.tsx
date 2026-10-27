import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-foreground">
        <Compass className="h-6 w-6" />
      </span>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Page not found</h1>
      <p className="mt-2 max-w-md text-sm leading-5 text-muted-foreground">
        That card, country or comparison is not in the directory. It may have been renamed, merged or never listed.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Browse all cards <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/countries"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:border-foreground/20"
        >
          Browse countries
        </Link>
      </div>
    </div>
  );
}
