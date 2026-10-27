import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How RItuel collects, uses and protects personal data, including analytics and affiliate tracking.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Legal</div>
        <h1 className="mt-1 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">Privacy policy</h1>
        <p className="mt-3 text-sm leading-5 text-muted-foreground">
          Last updated: 27 October 2026. This is a template policy for a pre-launch product and is not legal advice.
          Have qualified counsel review it before launch.
        </p>

        <div className="mt-6 space-y-5 text-sm leading-6 text-muted-foreground">
          <Block title="1. What we collect">
            <p>
              We collect the minimum data needed to operate a card directory: page views, approximate country derived
              from your IP address, browser and device type, referring URL, and outbound affiliate clicks. If you
              submit a card through the issuer form, we collect the company name, contact name, email address and any
              information you include in the message.
            </p>
          </Block>
          <Block title="2. How we use it">
            <p>
              Country data is used to show availability badges and to choose a default region. Analytics are used to
              understand which guides and comparisons are useful. Affiliate click data is used to measure outbound
              performance and, for sponsored partners, to report aggregate click volume.
            </p>
          </Block>
          <Block title="3. Cookies">
            <p>
              We set a country cookie so your selected market persists between visits. Analytics may set first-party
              cookies if enabled. You can clear cookies in your browser at any time; the directory will fall back to
              IP-based country detection or “all countries”.
            </p>
          </Block>
          <Block title="4. Affiliate links">
            <p>
              Outbound card links route through <code className="rounded bg-muted px-1">/go/[slug]</code> and
              append UTM parameters. The destination issuer may set its own cookies and process your data under its
              own privacy policy. We do not receive your application data, identity documents or card details.
            </p>
          </Block>
          <Block title="5. Data sharing">
            <p>
              We share aggregate analytics with infrastructure providers and, where configured, a webhook endpoint
              for lead delivery. We do not sell personal data. Sponsored partners receive aggregate click counts, not
              individual user records.
            </p>
          </Block>
          <Block title="6. Your rights">
            <p>
              Depending on your jurisdiction, you may have the right to access, correct or delete personal data we
              hold about you, or to object to processing. Email{" "}
              <a href={`mailto:${site.email}`} className="font-medium text-foreground underline underline-offset-4">{site.email}</a>{" "}
              and we will respond within the period required by applicable law.
            </p>
          </Block>
          <Block title="7. Retention">
            <p>
              Issuer submission records are retained for up to 24 months for verification and dispute purposes.
              Server logs and click events are retained for up to 12 months in aggregate form.
            </p>
          </Block>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
          See also: <Link href="/terms" className="font-medium text-foreground underline underline-offset-4">Terms of use</Link> ·{" "}
          <Link href="/methodology" className="font-medium text-foreground underline underline-offset-4">Methodology</Link> ·{" "}
          <Link href="/submit-card" className="font-medium text-foreground underline underline-offset-4">Submit a card</Link>
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
