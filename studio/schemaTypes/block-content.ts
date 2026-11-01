import { defineArrayMember, defineField, defineType } from "sanity";

export const blockContent = defineType({
  name: "blockContent",
  title: "Body",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
          { title: "Code", value: "code" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              defineField({
                name: "href",
                type: "url",
                title: "URL",
                validation: (rule) => rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
              }),
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", type: "string", title: "Alt text", validation: (rule) => rule.required() }),
        defineField({ name: "caption", type: "string" }),
      ],
    }),
    defineArrayMember({
      type: "object",
      name: "table",
      title: "Table",
      fields: [
        defineField({ name: "caption", type: "string" }),
        defineField({
          name: "headerRow",
          type: "boolean",
          title: "First row is a header",
          initialValue: true,
        }),
        defineField({
          name: "rows",
          type: "array",
          validation: (rule) => rule.required().min(1),
          of: [
            {
              type: "object",
              name: "row",
              fields: [
                defineField({
                  name: "cells",
                  type: "array",
                  of: [{ type: "string" }],
                  validation: (rule) => rule.required().min(1),
                }),
              ],
              preview: { select: { title: "cells.0", subtitle: "cells.1" } },
            },
          ],
        }),
      ],
      preview: {
        select: { caption: "caption", rows: "rows" },
        prepare: ({ caption, rows }) => ({ title: caption || "Table", subtitle: `${rows?.length ?? 0} rows` }),
      },
    }),
  ],
});
