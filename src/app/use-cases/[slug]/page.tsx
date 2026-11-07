import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { useCaseBySlug, useCasePages } from "@/lib/taxonomy";
import { GuideView, guideMetadata } from "@/components/guide-view";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return useCasePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = useCaseBySlug.get(slug);
  return page ? guideMetadata(page, "use-cases") : {};
}

export default async function UseCasePage({ params }: Props) {
  const { slug } = await params;
  const page = useCaseBySlug.get(slug);
  if (!page) notFound();
  return <GuideView page={page} base="use-cases" />;
}
