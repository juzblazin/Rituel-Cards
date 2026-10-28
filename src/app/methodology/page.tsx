import type { Metadata } from "next";
import { BarChart3, Database, RefreshCw, Scale, ShieldCheck } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { cards } from "@/lib/data";
import { supportedCountries } from "@/lib/taxonomy";
import { Badge } from "@/components/ui";

export const metadata: Metadata = buildMetadata({
  title: "How We Score a Crypto Card — Methodology",
  description:
    "The Rituel Editor Score: how we weight fees and spreads, risk-adjusted net rewards, custody, funding flexibility, payment rails, eligibility and perks — plus our data and audit standards.",
  path: "/methodology",
});

const personas = [
  { key: "minimalist", label: "Everyday Cash-Back Minimalist" },
  { key: "nomad", label: "Cross-Border Nomad / Traveler" },
  { key: "purist", label: "Web3 Self-Custody Purist" },
  { key: "trader", label: "High-Volume CEX Trader / Founder" },
] as const;

type PersonaKey = (typeof personas)[number]["key"];
type WeightKey = PersonaKey | "baseline";

const pillars: {
  name: string;
  metrics: string;
  weights: Record<WeightKey, number>;
}[] = [
  {
    name: "Cost Efficiency & Spread Transparency",
    metrics:
      "Explicit transaction fees, JIT/preload conversion spread, foreign exchange (FX) markup, ATM withdrawal surcharges, POS surcharges, inactivity penalties.",
    weights: { baseline: 25, minimalist: 30, nomad: 35, purist: 15, trader: 20 },
  },
  {
    name: "Risk-Adjusted Net Rewards (NEY)",
    metrics:
      "Base-tier yield ($0 stake), realistic mid-tier yield, monthly earning caps, payout asset volatility/liquidity (fiat/USDC/BTC vs. proprietary platform tokens).",
    weights: { baseline: 20, minimalist: 30, nomad: 15, purist: 15, trader: 25 },
  },
  {
    name: "Custody, Solvency & Counterparty Trust",
    metrics:
      "Smart-contract account abstraction/self-custody vs. hybrid preload vs. centralized custodial CEX; Proof of Reserves; FDIC pass-through insurance; MiCA licensing status.",
    weights: { baseline: 20, minimalist: 15, nomad: 10, purist: 40, trader: 15 },
  },
  {
    name: "Funding Flexibility & Tax Efficiency",
    metrics:
      "Multi-chain L1/L2 deposit rails, stablecoin settlement, collateralized borrow/credit mode (avoiding taxable disposition events), yield generated on idle balances.",
    weights: { baseline: 12, minimalist: 5, nomad: 10, purist: 15, trader: 15 },
  },
  {
    name: "Everyday POS Utility & Payment Rails",
    metrics:
      "Native Apple Pay & Google Pay tokenization, virtual and physical issuance, transaction spend limits ($50K–$3M monthly caps), real-time support responsiveness.",
    weights: { baseline: 10, minimalist: 10, nomad: 10, purist: 5, trader: 15 },
  },
  {
    name: "Geographic Eligibility & Onboarding",
    metrics:
      "Regulatory availability (US, UK, EEA, APAC, LATAM), local residency friction, identity verification (KYC/KYB) turnaround speed, upfront fee clarity.",
    weights: { baseline: 8, minimalist: 5, nomad: 10, purist: 5, trader: 5 },
  },
  {
    name: "Lifestyle Perks & Ancillary Benefits",
    metrics:
      "Airport lounge access (Priority Pass/DragonPass), subscription rebates (Spotify, Netflix), travel health insurance, purchase protection.",
    weights: { baseline: 5, minimalist: 5, nomad: 10, purist: 5, trader: 5 },
  },
];

const weightKeys: WeightKey[] = ["baseline", ...personas.map((p) => p.key)];

function totalWeight(key: WeightKey) {
  return pillars.reduce((sum, pillar) => sum + pillar.weights[key], 0);
}

export default function MethodologyPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          <Scale className="h-3 w-3" /> Methodology
        </div>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          How We Score a Crypto Card
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Rituel exists because crypto card marketing pages are unusually good at hiding the numbers that actually
          matter. We collect, normalize, and weight real-world execution costs, counterparty risks, and on-chain
          utility so you can evaluate cards objectively.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge>{cards.length} cards tracked</Badge>
          <Badge>{supportedCountries.length} country directories</Badge>
          <Badge>Last reviewed October 2026</Badge>
        </div>
      </div>

      <div className="mt-10 space-y-6">
        <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-foreground">
                <BarChart3 className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">The Scoring Framework</h2>
            </div>
            <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              0–100 composite score / 0.0–10.0 rating
            </span>
          </div>

          <div className="mt-3 max-w-3xl space-y-2 text-sm leading-6 text-muted-foreground">
            <p>
              The Rituel Editor Score is an audited composite index. It is not an unverified user rating, and
              placement is never for sale.
            </p>
            <p>
              Because an everyday fiat spender, a digital nomad, a Web3 self-custody purist, and a high-volume
              trader have fundamentally different utility functions, we pair an objective{" "}
              <strong className="font-semibold text-foreground">Baseline Universal Weighting</strong> with{" "}
              <strong className="font-semibold text-foreground">Dynamic Persona Weight Profiles</strong>.
            </p>
          </div>

          <div className="mt-5 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[1040px] border-collapse text-left align-top">
              <caption className="sr-only">
                Evaluation pillars, audited metrics, baseline weights and persona weight profiles for the Rituel
                Editor Score.
              </caption>
              <thead>
                <tr className="border-b border-border bg-muted/60">
                  <th scope="col" className="w-10 px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    #
                  </th>
                  <th scope="col" className="w-[15%] px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Evaluation Pillar
                  </th>
                  <th scope="col" className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Core Audited Metrics
                  </th>
                  <th scope="col" className="w-20 px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-foreground">
                    Baseline Weight
                  </th>
                  {personas.map((persona) => (
                    <th
                      key={persona.key}
                      scope="col"
                      className="w-[11%] px-3 py-3 text-center text-[11px] font-semibold leading-4 text-muted-foreground"
                    >
                      {persona.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pillars.map((pillar, index) => (
                  <tr key={pillar.name} className="border-b border-border/70 last:border-0">
                    <td className="num px-3 py-3 text-xs font-semibold text-muted-foreground">{index + 1}</td>
                    <th scope="row" className="px-3 py-3 text-left text-sm font-semibold leading-5 text-foreground">
                      {pillar.name}
                    </th>
                    <td className="px-3 py-3 text-xs leading-5 text-muted-foreground">{pillar.metrics}</td>
                    <td className="bg-muted/40 px-3 py-3 text-center">
                      <span className="num inline-flex min-w-11 justify-center rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                        {pillar.weights.baseline}%
                      </span>
                    </td>
                    {personas.map((persona) => (
                      <td key={persona.key} className="num px-3 py-3 text-center text-xs text-muted-foreground">
                        {pillar.weights[persona.key]}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-muted/60">
                  <td />
                  <th scope="row" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground">
                    Total Weighting
                  </th>
                  <td className="px-3 py-3 text-xs font-medium text-muted-foreground">100-Point Normalized Scale</td>
                  {weightKeys.map((key) => (
                    <td
                      key={key}
                      className={`num px-3 py-3 text-center text-xs font-semibold text-foreground ${
                        key === "baseline" ? "bg-muted/40" : ""
                      }`}
                    >
                      {totalWeight(key)}%
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Every weight profile sums to 100%. The baseline profile applies when no persona is selected; selecting a
            persona re-weights the same seven pillars rather than changing the underlying audit data.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section icon={Database} title="Data Collection & Normalization Standard">
            <p>Every data point originates from a verifiable primary source:</p>
            <ul className="mt-2 space-y-1.5">
              {[
                "Issuer fee schedules and product disclosure statements (PDS)",
                "Cardholder terms and conditions",
                "Smart contract architectures and on-chain Proof of Reserves attestations",
                "Live application onboarding flows and terminal payment testing",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/40" aria-hidden /> {item}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Secondary commentary is strictly used to locate primary documentation. If an issuer does not disclose
              an exchange spread, fee tier, or limit, it is recorded as{" "}
              <strong className="font-semibold text-foreground">Unknown</strong> and penalised within the transparency
              sub-index rather than estimated.
            </p>
            <dl className="mt-4 space-y-3">
              {[
                [
                  "Currency Normalization",
                  "All fiat and token values are benchmarked to USD equivalent for uniform cross-comparison.",
                ],
                [
                  "Basis Points Normalization",
                  "Spreads, FX markups, and liquidation penalties are computed directly in basis points (bps, where 100 bps = 1.00%).",
                ],
                [
                  "Country Standard",
                  "Regional eligibility and sanctioned-market exclusions are mapped against ISO-3166 alpha-2 standards to feed our real-time geo-availability engine.",
                ],
              ].map(([term, detail]) => (
                <div key={term} className="rounded-lg border border-border bg-background p-3">
                  <dt className="text-xs font-semibold text-foreground">{term}</dt>
                  <dd className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section icon={ShieldCheck} title="Audit Cadence & Editorial Independence">
            <div className="space-y-3">
              {[
                [
                  "Scheduled Audits",
                  "Card records undergo scheduled re-audits quarterly. Immediate re-scoring occurs upon verified changes to fee schedules, tokenomics, or custodial backing.",
                ],
                [
                  "Verified Status",
                  "A listing loses its verified check if an issuer's fee schedule or regulatory licensing disclosure is older than six months without explicit re-confirmation.",
                ],
                [
                  "Commercial Separation",
                  "Commercial partnerships and affiliate links never alter weighting coefficients, formula outputs, or composite rankings. Sponsored cards undergo the identical 7-pillar audit.",
                ],
              ].map(([term, detail]) => (
                <div key={term} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    <h3 className="text-xs font-semibold text-foreground">{term}</h3>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof BarChart3;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="mt-2 space-y-2 text-sm leading-5 text-muted-foreground">{children}</div>
    </section>
  );
}
