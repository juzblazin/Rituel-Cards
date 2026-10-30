import type { Metadata } from "next";
import { Newspaper, Rss } from "lucide-react";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getCategories, getPosts } from "@/lib/blog";
import { BlogEmpty } from "@/components/blog/blog-empty";
import { CategoryNav, PostGrid } from "@/components/blog/post-card";

// Posts are published from Sanity without a rebuild.
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Crypto Card Blog — Fee Changes, Launches & Guides",
  description:
    "News and analysis on crypto debit and credit cards: fee and cashback changes, new launches, country availability and how-to guides.",
  path: "/blog",
});

export default async function BlogIndexPage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);

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
            The fine print, explained
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Fee changes, new card launches and practical guides, written from the same data as the directory.
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
