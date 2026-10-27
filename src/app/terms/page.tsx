import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Use",
  description: "Terms governing use of RItuel's crypto card directory, comparisons and calculators.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Legal</div>
        <h1 className="mt-1 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">Terms of use</h1>
        <p className="mt-3 text-sm leading-5 text-muted-foreground">
          Last updated: 27 October 2026. This is a template agreement for a pre-launch product and is not legal
          advice. Have qualified counsel review it before launch.
        </p>

        <div className="mt-6 space-y-5 text-sm leading-6 text-muted-foreground">
          <Block title="1. Informational purpose">
            <p>
              RItuel publishes information about crypto debit, credit and prepaid cards. Nothing on this site is
              financial, legal, tax or investment advice, and nothing is an offer to sell a financial product. Card
              eligibility, fees and limits are determined solely by the issuer.
            </p>
          </Block>
          <Block title="2. Accuracy">
            <p>
              We work from published issuer documentation, but fee schedules change without notice. Data on this
              build is illustrative seed data. Always verify the current fees, limits and country availability with
              the issuer before applying. We are not liable for decisions made on stale data.
            </p>
          </Block>
          <Block title="3. Affiliate relationships">
            <p>
              We may receive a commission when you open a card through an outbound link. Sponsored placements are
              labelled. Sponsorship does not alter the fee values, comparison maths or editor score. See our{" "}
              <Link href="/methodology" className="font-medium text-foreground underline underline-offset-4">methodology</Link>.
            </p>
          </Block>
          <Block title="4. No financial advice">
            <p>
              Crypto assets are volatile and may be subject to tax, sanctions and local regulatory restrictions.
              Crypto card rewards may be taxable. You are responsible for compliance with the laws of your
              jurisdiction and for your own key management if you use a self-custody product.
            </p>
          </Block>
          <Block title="5. Third-party sites">
            <p>
              Outbound links lead to issuer websites that we do not control. Their terms and privacy policies apply.
              We are not responsible for their content, availability or processing of your application.
            </p>
          </Block>
          <Block title="6. Intellectual property">
            <p>
              Card names, logos and trademarks belong to their respective owners and are used for identification
              only. The RItuel name, editorial content, comparison structure and calculator logic are our
              property. You may quote short excerpts with attribution and a link.
            </p>
          </Block>
          <Block title="7. Limitation of liability">
            <p>
              To the maximum extent permitted by law, {site.name} is not liable for indirect or consequential loss
              arising from use of the site, including loss of profits, crypto price movement or card application
              outcomes. Nothing in these terms excludes liability that cannot be excluded by law.
            </p>
          </Block>
          <Block title="8. Contact">
            <p>
              Questions about these terms:{" "}
              <a href={`mailto:${site.email}`} className="font-medium text-foreground underline underline-offset-4">{site.email}</a>.
            </p>
          </Block>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
          See also: <Link href="/privacy" className="font-medium text-foreground underline underline-offset-4">Privacy policy</Link> ·{" "}
          <Link href="/methodology" className="font-medium text-foreground underline underline-offset-4">Methodology</Link> ·{" "}
          <Link href="/submit-card" className="font-medium text-foreground underline underline-offset-4">List a card</Link>
        </div>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-1">{children}</div>
    </section>
  );
}
