import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPostDate, imageUrl, type BlogPostSummary } from "@/lib/blog";

export function PostCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-foreground/20 hover:shadow-lg"
    >
      <div className="aspect-[16/9] bg-muted">
        {post.mainImage && (
          // eslint-disable-next-line @next/next/no-img-element -- Sanity's CDN already resizes and converts format.
          <img
            src={imageUrl(post.mainImage, 800, 450)}
            alt={post.mainImage.alt ?? ""}
            width={800}
            height={450}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {post.categories.length > 0 && (
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {post.categories.map((category) => category.title).join(" · ")}
          </div>
        )}
        <h2 className="mt-1.5 text-base font-semibold leading-snug tracking-tight text-foreground group-hover:text-muted-foreground">
          {post.title}
        </h2>
        <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between border-t border-border pt-2.5 text-xs text-muted-foreground">
          <span>
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time> · {post.readingMinutes} min read
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-foreground transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

export function PostGrid({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}

export function CategoryNav({ categories, active }: { categories: { title: string; slug: string }[]; active?: string }) {
  if (categories.length === 0) return null;
  const pill = "rounded-full border px-3 py-1 text-xs font-medium transition";
  const on = "border-foreground/20 bg-brand/10 text-foreground";
  const off = "border-border text-muted-foreground hover:text-foreground";
  return (
    <nav aria-label="Blog categories" className="flex flex-wrap gap-2">
      <Link href="/blog" className={`${pill} ${active ? off : on}`} aria-current={active ? undefined : "page"}>
        All posts
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/blog/category/${category.slug}`}
          className={`${pill} ${active === category.slug ? on : off}`}
          aria-current={active === category.slug ? "page" : undefined}
        >
          {category.title}
        </Link>
      ))}
    </nav>
  );
}
