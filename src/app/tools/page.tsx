import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, ChevronRight, Wrench } from "lucide-react";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Crypto Card Tools — Fee & Net Return Calculators",
  description:
    "Interactive crypto card tools: model your real monthly return after top-up fees, FX markups and annual fees across every card we track.",
  path: "/tools",
  keywords: ["crypto card calculator", "crypto card fee calculator", "crypto card comparison tool"],
});

const TOOLS = [
  {
    slug: "net-return-calculator",
    icon: Calculator,
    eyebrow: "Calculator",
    heading: "Net return calculator",
    description:
      "Enter your monthly spend and see what every card actually pays you after top-up fees, FX and annual fees.",
  },
];

const breadcrumbs = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Tools", path: "/tools" },
]);

export default function ToolsIndexPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Crypto Card</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="font-medium text-muted-foreground">Tools</span>
        </div>
      </div>

      <div className="container-page py-12 sm:py-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Wrench className="h-3 w-3" /> Tools · {TOOLS.length}
          </div>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Do the maths before you apply
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Headline cashback is marketing. These tools model the real numbers — fees in, rewards out —
            across every card in the directory.
          </p>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group flex flex-col rounded-xl border border-border bg-card p-4 transition hover:border-foreground/20 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {tool.eyebrow}
                  </span>
                </div>
                <h2 className="mt-3 text-sm font-semibold tracking-tight text-foreground group-hover:text-muted-foreground">
                  {tool.heading}
                </h2>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{tool.description}</p>
                <div className="mt-auto flex items-center justify-end border-t border-border pt-2.5">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-4">
                    Open tool <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
