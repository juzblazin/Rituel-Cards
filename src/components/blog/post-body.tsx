import Link from "next/link";
import { PortableText, type PortableTextBlock, type PortableTextComponents } from "@portabletext/react";
import { imageDimensions, imageUrl, type BlogImage } from "@/lib/blog";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-5 text-[15px] leading-7 text-muted-foreground">{children}</p>,
    h2: ({ children }) => (
      <h2 className="mt-10 text-2xl font-semibold tracking-tight text-foreground">{children}</h2>
    ),
    h3: ({ children }) => <h3 className="mt-8 text-lg font-semibold tracking-tight text-foreground">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-brand pl-4 text-[15px] italic leading-7 text-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-5 list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-5 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">{children}</ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    code: ({ children }) => <code className="rounded bg-muted px-1 py-0.5 font-mono text-[13px]">{children}</code>,
    link: ({ value, children }) => {
      const href: string = value?.href ?? "";
      const className = "font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground";
      if (href.startsWith("/")) {
        return (
          <Link href={href} className={className}>
            {children}
          </Link>
        );
      }
      return (
        <a href={href} className={className} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }: { value: BlogImage }) => {
      const size = imageDimensions(value);
      return (
      <figure className="mt-8">
        {/* eslint-disable-next-line @next/next/no-img-element -- Sanity's CDN already resizes and converts format. */}
        <img
          src={imageUrl(value, 1200)}
          alt={value.alt ?? ""}
          width={size ? 1200 : undefined}
          height={size ? Math.round((1200 * size.height) / size.width) : undefined}
          loading="lazy"
          decoding="async"
          className="w-full rounded-xl border border-border"
        />
        {value.caption && (
          <figcaption className="mt-2 text-center text-xs text-muted-foreground">{value.caption}</figcaption>
        )}
      </figure>
      );
    },
  },
};

export function PostBody({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
