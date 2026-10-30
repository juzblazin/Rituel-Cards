import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getCategories, getCategory, getPostsByCategory } from "@/lib/blog";
import { CategoryNav, PostGrid } from "@/components/blog/post-card";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return buildMetadata({
    title: `${category.title} — Crypto Card Blog`,
    description: category.description || `Every RItuel article about ${category.title.toLowerCase()}.`,
    path: `/blog/category/${category.slug}`,
  });
}

export default async function BlogCategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const [category, posts, categories] = await Promise.all([
    getCategory(slug),
    getPostsByCategory(slug),
    getCategories(),
  ]);
  if (!category || posts.length === 0) notFound();

  return (
    <div className="container-page py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Blog", path: "/blog" },
              { name: category.title, path: `/blog/category/${category.slug}` },
            ]),
          ),
        }}
      />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/blog" className="hover:text-foreground">Blog</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{category.title}</span>
      </nav>
      <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
        {category.title}
      </h1>
      {category.description && (
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{category.description}</p>
      )}
      <div className="mt-6">
        <CategoryNav categories={categories} active={category.slug} />
      </div>
      <div className="mt-6">
        <PostGrid posts={posts} />
      </div>
    </div>
  );
}
