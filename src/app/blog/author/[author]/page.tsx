import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthor, getPostsByAuthor, imageUrl } from "@/lib/blog";
import { breadcrumbJsonLd, buildMetadata, personJsonLd } from "@/lib/seo";
import { PostGrid } from "@/components/blog/post-card";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ author: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { author: slug } = await params;
  const author = await getAuthor(slug);
  if (!author) return {};
  return buildMetadata({
    title: `${author.name}${author.role ? `, ${author.role}` : ""} — Rituel Cards Blog`,
    description: author.bio || `Articles about crypto cards written by ${author.name} for Rituel Cards.`,
    path: `/blog/author/${author.slug}`,
  });
}

export default async function AuthorPage({ params }: Props) {
  const { author: slug } = await params;
  const [author, posts] = await Promise.all([getAuthor(slug), getPostsByAuthor(slug)]);
  if (!author || posts.length === 0) notFound();

  const avatar = author.image ? imageUrl(author.image, 160, 160) : undefined;

  return (
    <div className="container-page py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            mainEntity: personJsonLd({ ...author, imageUrl: avatar }),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Blog", path: "/blog" },
              { name: author.name, path: `/blog/author/${author.slug}` },
            ]),
          ),
        }}
      />
      <div className="mx-auto max-w-3xl">
        <Link href="/blog" className="text-xs text-muted-foreground hover:text-foreground">Blog</Link>
        <div className="mt-4 flex items-center gap-4">
          {avatar && (
            // eslint-disable-next-line @next/next/no-img-element -- Sanity's CDN already resizes and converts format.
            <img src={avatar} alt="" width={80} height={80} className="size-20 rounded-full border border-border object-cover" />
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{author.name}</h1>
            {author.role && <p className="mt-1 text-sm text-muted-foreground">{author.role}</p>}
          </div>
        </div>
        {author.bio && <p className="mt-5 text-base leading-7 text-muted-foreground">{author.bio}</p>}
        {author.links && author.links.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-3 text-sm">
            {author.links.map((link) => (
              <li key={link}>
                <a href={link} rel="me noopener noreferrer" target="_blank" className="text-brand hover:underline">
                  {new URL(link).hostname.replace(/^www\./, "")}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">Articles</h2>
        <PostGrid posts={posts} />
      </div>
    </div>
  );
}
