import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  fields: [
    defineField({
      name: "language",
      type: "string",
      description: "Language of this version. Translations share the English post's slug and are served at rituel.xyz/<language>/blog/<slug>.",
      initialValue: "en",
      options: {
        list: [
          { title: "English", value: "en" },
          { title: "Español", value: "es" },
          { title: "Português (Brasil)", value: "pt-BR" },
          { title: "Français", value: "fr" },
          { title: "Deutsch", value: "de" },
          { title: "Tiếng Việt", value: "vi" },
          { title: "简体中文", value: "zh-CN" },
          { title: "Türkçe", value: "tr" },
          { title: "日本語", value: "ja" },
          { title: "한국어", value: "ko" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "translationOf",
      title: "Translation of",
      type: "reference",
      to: [{ type: "post" }],
      weak: true,
      description: "For translations: the English post this was translated from.",
      hidden: ({ document }) => !document?.language || document.language === "en",
    }),
    defineField({ name: "title", type: "string", validation: (rule) => rule.required().max(110) }),
    defineField({
      name: "slug",
      type: "slug",
      description: "The post URL: rituel.xyz/blog/<slug>",
      options: {
        source: "title",
        maxLength: 96,
        // Translations reuse the English slug, so a slug only has to be unique per language.
        isUnique: async (slug, context) => {
          const client = context.getClient({ apiVersion: "2025-01-01" });
          const id = context.document?._id.replace(/^drafts\./, "");
          const language = (context.document?.language as string | undefined) ?? "en";
          const count = await client.fetch<number>(
            `count(*[_type == "post" && slug.current == $slug && coalesce(language, "en") == $language && !(_id in [$id, "drafts." + $id])])`,
            { slug, language, id },
          );
          return count === 0;
        },
      },
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
    defineField({
      name: "keyTakeaways",
      title: "Key takeaways",
      type: "array",
      of: [{ type: "string" }],
      description: "3–5 one-line facts shown in a box at the top of the post. AI answers quote these directly.",
      validation: (rule) => rule.max(6),
    }),
    defineField({ name: "body", type: "blockContent", validation: (rule) => rule.required() }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      description: "Optional questions and short answers shown at the end and sent to Google as FAQ data.",
      of: [
        {
          type: "object",
          name: "faq",
          fields: [
            defineField({ name: "question", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "answer", type: "text", rows: 3, validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: "question", subtitle: "answer" } },
        },
      ],
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title (optional)",
      type: "string",
      description: "Overrides the title in Google results. Leave blank to use the post title.",
      validation: (rule) => rule.max(70),
    }),
  ],
  orderings: [{ title: "Newest first", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", subtitle: "publishedAt", language: "language", media: "mainImage" },
    prepare: ({ title, subtitle, language, media }) => ({
      title: language && language !== "en" ? `[${language}] ${title}` : title,
      subtitle,
      media,
    }),
  },
});
