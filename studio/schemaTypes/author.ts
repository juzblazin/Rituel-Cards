import { defineField, defineType } from "sanity";

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "role", type: "string", description: "e.g. Editor, Research lead" }),
    defineField({ name: "image", type: "image", options: { hotspot: true } }),
    defineField({ name: "bio", type: "text", rows: 3 }),
    defineField({
      name: "links",
      title: "Profile links",
      type: "array",
      of: [{ type: "url" }],
      description: "LinkedIn, X or personal site. Shown to Google as proof of who wrote the post.",
    }),
  ],
  preview: { select: { title: "name", subtitle: "role", media: "image" } },
});
