import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cardBySlug } from "@/lib/data";
import { formatPostDate, getPost, getPosts, imageUrl } from "@/lib/blog";
import { blogPostingJsonLd, breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";
import { PostBody } from "@/components/blog/post-body";
import { PostCard } from "@/components/blog/post-card";
import { CardArt, Rating } from "@/components/ui";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    keywords: post.categories.map((category) => category.title),
    image: post.mainImage
      ? { url: imageUrl(post.mainImage, 1200, 630), width: 1200, height: 630, alt: post.mainImage.alt ?? post.title }
      : undefined,
    article: {
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author.name] : undefined,
      tags: post.categories.map((category) => category.title),
    },
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const relatedCards = post.relatedCards.flatMap((cardSlug) => cardBySlug.get(cardSlug) ?? []);
  const morePosts = (await getPosts()).filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <article className="container-page py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            blogPostingJsonLd({
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              publishedAt: post.publishedAt,
              updatedAt: post.updatedAt,
              imageUrl: post.mainImage ? imageUrl(post.mainImage, 1200, 630) : undefined,
              author: post.author
                ? {
                    name: post.author.name,
                    slug: post.author.slug,
                    role: post.author.role,
                    bio: post.author.bio,
                    imageUrl: post.author.image ? imageUrl(post.author.image, 400, 400) : undefined,
                    links: post.author.links,
                  }
                : undefined,
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Blog", path: "/blog" },
              { name: post.title, path: `/blog/${post.slug}` },
            ]),
          ),
        }}
      />

      {post.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(post.faqs.map((faq) => ({ q: faq.question, a: faq.answer })))) }}
        />
      )}

      <div className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
          {post.categories[0] && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link href={`/blog/category/${post.categories[0].slug}`} className="hover:text-foreground">
                {post.categories[0].title}
              </Link>
            </>
          )}
        </nav>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">{post.title}</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">{post.excerpt}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {post.author && (
            <>
              <Link href={`/blog/author/${post.author.slug}`} rel="author" className="font-medium text-foreground hover:underline">
                {post.author.name}
              </Link>
              {post.author.role && <span>· {post.author.role}</span>}
              <span aria-hidden>·</span>
            </>
          )}
          <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} min read</span>
        </div>
      </div>

      {post.mainImage && (
        <div className="mx-auto mt-8 max-w-4xl">
          {/* eslint-disable-next-line @next/next/no-img-element -- Sanity's CDN already resizes and converts format. */}
          <img
            src={imageUrl(post.mainImage, 1600, 900)}
            alt={post.mainImage.alt ?? ""}
            width={1600}
            height={900}
            fetchPriority="high"
            className="w-full rounded-xl border border-border"
          />
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        {post.keyTakeaways.length > 0 && (
          <aside aria-labelledby="key-takeaways" className="mt-10 rounded-xl border border-brand/30 bg-brand-soft/60 p-5">
            <h2 id="key-takeaways" className="text-sm font-semibold uppercase tracking-wide text-foreground">Key takeaways</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-foreground">
              {post.keyTakeaways.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        )}

        <PostBody value={post.body} />

        {post.faqs.length > 0 && (
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Frequently asked questions</h2>
            <dl className="mt-4 space-y-5">
              {post.faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="font-medium text-foreground">{faq.question}</dt>
                  <dd className="mt-1 text-sm leading-6 text-muted-foreground">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {relatedCards.length > 0 && (
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Cards in this article</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {relatedCards.map((card) => (
                <Link
                  key={card.slug}
                  href={`/card/${card.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-foreground/20"
                >
                  <CardArt card={card} className="h-11 w-16 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{card.name}</div>
                    <Rating score={card.ratingScore} className="mt-0.5" />
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {morePosts.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">More from the blog</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {morePosts.map((item) => (
              <PostCard key={item.slug} post={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
