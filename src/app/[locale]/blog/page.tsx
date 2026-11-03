import type { Metadata } from "next";
import { Newspaper, Rss } from "lucide-react";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getNavCategories, getPosts } from "@/lib/blog";
import { BlogEmpty } from "@/components/blog/blog-empty";
import { CategoryNav, PostGrid } from "@/components/blog/post-card";

// Posts are published from Sanity without a rebuild.
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Rituel Cards Intelligence — Crypto Debit Card Teardowns, Fees & Payment Rails",
  description:
    "Independent benchmarks on self-custody crypto cards, DeFi collateral borrowing, zero-FX travel spending, and BaaS issuing rails. Data reviewed late 2026.",
  path: "/blog",
});

export default async function BlogIndexPage() {
  const [posts, categories] = await Promise.all([getPosts(), getNavCategories()]);

  return (
    <div className="container-page py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])),
        }}
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Newspaper className="h-3 w-3" /> Blog
          </div>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Rituel Cards Intelligence: Web3 Payment Rails, Card Teardowns & Regulatory Guides
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Rituel delivers independent research, fee audits, and technical teardowns across four Web3 payment
            pillars: self-custody hardware and smart contract cards, Layer-1 and Layer-2 blockchain rails,
            zero-FX travel and MiCA/FCA regulatory corridors, and white-label banking issuers including
            Monavate, Baanx, and Rain.
          </p>
        </div>
        <a
          href="/blog/rss.xml"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground transition hover:bg-muted"
        >
          <Rss className="h-3.5 w-3.5" /> RSS
        </a>
      </div>

      <div className="mt-6">
        <CategoryNav categories={categories} />
      </div>

      <div className="mt-6">{posts.length > 0 ? <PostGrid posts={posts} /> : <BlogEmpty />}</div>
    </div>
  );
}
