import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (rule) => rule.required().max(110) }),
    defineField({
      name: "slug",
      type: "slug",
      description: "The post URL: rituel.xyz/blog/<slug>",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      type: "text",
      rows: 3,
      description: "Shown on the blog list and used as the Google description (aim for 120–160 characters).",
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "mainImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string", title: "Alt text" })],
    }),
    defineField({ name: "author", type: "reference", to: [{ type: "author" }] }),
    defineField({ name: "categories", type: "array", of: [{ type: "reference", to: [{ type: "category" }] }] }),
    defineField({
      name: "relatedCards",
      title: "Related card slugs",
      type: "array",
      of: [{ type: "string" }],
      description: "Optional. Card slugs from the directory (e.g. redotpay) to show under the post.",
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "body", type: "blockContent", validation: (rule) => rule.required() }),
    defineField({
      name: "seoTitle",
      title: "SEO title (optional)",
      type: "string",
      description: "Overrides the title in Google results. Leave blank to use the post title.",
      validation: (rule) => rule.max(70),
    }),
  ],
  orderings: [{ title: "Newest first", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "publishedAt", media: "mainImage" } },
});
