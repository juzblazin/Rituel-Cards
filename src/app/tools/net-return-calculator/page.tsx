import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cards } from "@/lib/data";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { NetReturnCalculator } from "@/components/calculator";

export const metadata: Metadata = buildMetadata({
  title: "Crypto Card Net Return Calculator (2026)",
  description:
    "Model your real monthly return on every crypto card: cashback minus top-up fees, FX markups and annual fees, ranked by net value.",
  path: "/tools/net-return-calculator",
  keywords: ["crypto card calculator", "net return calculator", "crypto card fees", "crypto cashback calculator"],
});

const breadcrumbs = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Tools", path: "/tools" },
  { name: "Net return calculator", path: "/tools/net-return-calculator" },
]);

export default function NetReturnCalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Crypto Card</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/tools" className="hover:text-foreground">Tools</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="font-medium text-muted-foreground">Net return calculator</span>
        </div>
      </div>

      <div className="container-page py-12">
        <NetReturnCalculator cards={cards} />
      </div>
    </>
  );
}
