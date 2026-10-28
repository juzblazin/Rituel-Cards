# Database data guide

Four tables. Two hold the card catalog (you fill these), two are written by the app at runtime (you never fill them).

| Table | Rows today | Who writes it | Purpose |
| --- | --- | --- | --- |
| `cards` | 63 | you | one row per card; the directory, card pages and comparisons all read this |
| `card_tiers` | 28 | you | 0..n tiers per card (optional; 10 of the 63 cards have any) |
| `card_benefits` | 0 | you | 0..n structured benefits per card or tier (lounge, insurance, rebates…) |
| `card_submissions` | 2 | `POST /api/submit-card` | issuer leads from the submission form |
| `affiliate_clicks` | 6 | `POST /api/track` | outbound click events on "Get card" |

Schema is in [cards-schema.sql](cards-schema.sql) and [schema.sql](schema.sql). Column types below are exactly what `information_schema` reports.

---

## 1. `cards` — 106 columns, 103 of them yours

`id`, `created_at`, `updated_at` are database-generated; leave them alone.

In the tables below, **Req** means: ✔ required (defaults exist, but a card without it looks broken), ○ recommended — shown when present, fine to leave blank, – stored in the column but no page renders it yet, so you can skip it while you build out data.

### Conventions used throughout

| Rule | Value |
| --- | --- |
| Percentages | plain numbers in percent units — `1.5` means 1.5%, `0` means free |
| Money | USD numbers, no `$` or commas — `19.99`, `0.00` |
| Arrays | `text[]` in SQL; in a CSV/spreadsheet cell separate items with a pipe — `USDC\|ETH\|BTC` |
| Booleans | `true` / `false` |
| Dates | `YYYY-MM-DD` |
| Colours | `#rrggbb` hex |
| Countries | ISO-3166 alpha-2, uppercase — `US`, `DE`, `GB`. Every code must exist in [countries.ts](../src/lib/countries.ts) or it gets no country page |
| Crypto tickers | uppercase symbol — `USDC`, `BTC`, `EURe` |
| `rating_score` | 0–10, one decimal — `8.7` |

### Identity and links

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `name` | text | ✔ | `ether.fi Cash` | product name as displayed |
| `slug` | text | ✔ | `etherfi-cash` | URL key: lowercase, hyphens, **unique**. Creates `/card/etherfi-cash` |
| `tagline` | text | ○ | `Self-custody Visa with 3% cashback…` | one line, shown under the name |
| `affiliate_url` | text | ✔ | `https://ether.fi/cash` | where "Get card" sends people |
| `website` | text | ○ | `ether.fi` | shown in the card page links |
| `issuer_bank` | text | – | `Third National` | program manager, shown as issuer |

`logo_url` and `card_image_url` exist but no page renders them yet — the tile is drawn from `logo_text` + `brand_*` instead. Leave blank unless you plan to use them.

### Card tile (the generated graphic in the directory)

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `logo_text` | text | ✔ | `e` | 1–3 characters monogram |
| `brand_from` | text | ✔ | `#0f3d2e` | gradient start |
| `brand_to` | text | ✔ | `#54d2a1` | gradient end |
| `brand_ink` | text | ✔ | `#eafff6` | text colour on the tile; must contrast with the gradient |

### Classification (these drive the filters)

| Column | Type | Req | Allowed | Example |
| --- | --- | --- | --- | --- |
| `network` | text | ✔ | `visa` `mastercard` `unionpay` | `visa` |
| `card_type` | text | ✔ | `debit` `credit` `prepaid` | `debit` |
| `custody_model` | text | ✔ | `custodial` `self_custody` `hybrid` | `self_custody` |
| `audience` | text | ✔ | `personal` `business` `both` | `both` |

Anything outside those lists is rejected by a CHECK constraint (see [cards-schema.sql](cards-schema.sql)); the mapper still falls back (`visa`, `debit`, `custodial`, `both`) when reading rows written before those constraints existed. Do not use `dual_mode` or `other` — the UI has no filter for them.

`custody_tech` and `settlement_chain` are free text and currently unrendered.

### Form factor and wallets

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `has_virtual` | bool | ✔ | `true` | filter + badge |
| `has_physical` | bool | ✔ | `true` | filter + badge |
| `mobile_wallets` | text[] | ○ | `apple_pay\|google_pay` | only `apple_pay`, `google_pay`, `samsung_pay` are kept |
| `has_metal` | bool | – | `false` | stored, not rendered |

### Compliance and geography

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `kyc_level` | text | ✔ | `light_kyc` | `no_kyc` `light_kyc` `full_kyc` |
| `no_kyc_limit_usd` | numeric | ○ | `500` | spend cap before KYC; only meaningful for `no_kyc` |
| `supported_countries` | text[] | ✔ | `US\|CA\|DE\|GB` | drives `/countries/[code]` pages and the country filter |
| `regional_scope` | text | ○ | `EEA & UK` | human label — `Global (60+ countries)`, `United States` |
| `kyc_notes`, `excluded_countries` | text / text[] | – | | stored, not rendered |

Pick the country set deliberately: each code in `supported_countries` puts the card on that country's page, and the country list pages are generated from the union of these arrays.

### Pricing

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `annual_fee_usd` | numeric | ✔ | `0` | |
| `monthly_fee_usd` | numeric | ✔ | `0` | |
| `issuance_physical_fee_usd` | numeric | ✔ | `9.99` | becomes the "issuance fee" shown in the UI |
| `topup_fee_pct` | numeric | ✔ | `0` | |
| `topup_fee_notes` | text | ○ | `Free crypto top-ups` | |
| `fx_fee_pct` | numeric | ✔ | `1.5` | the headline number in comparisons |
| `fx_fee_notes` | text | ○ | `0% FX on all currencies` | |
| `issuance_virtual_fee_usd`, `is_gasless` | numeric / bool | – | | stored, not rendered |

The virtual-issuance fee is the one real mismatch: only the **physical** on-ramp fee reaches the UI. If virtual issuance is the priced one, put it in `issuance_physical_fee_usd`.

### ATM

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `atm_local_fee_pct` | numeric | ✔ | `2.5` | the ATM figure the UI shows |
| `atm_fee_text` | text | ○ | `2.5% after $500/mo free` | badge text; overrides the number in the label |
| `atm_monthly_free_allowance_usd` | numeric | ○ | `500` | |
| `monthly_atm_limit_usd` | numeric | ○ | `2000` | withdrawal cap; falls back to the free allowance |
| `atm_intl_fee_pct` | numeric | – | | stored, not rendered |

### Rewards, yield and payout

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `cashback_min_pct` | numeric | ✔ | `3` | |
| `cashback_max_pct` | numeric | ✔ | `3.5` | |
| `payout_token` | text | ○ | `ETH` | what cashback is paid in |
| `staking_requirement` | text | ○ | `None for Cash; $10,000 for Luxe` | free text shown on the page |
| `reward_asset_type` | text | – | `crypto` | `crypto` `stablecoin` `native_token` `stocks_gold` — stored only |
| `reward_assets_supported`, `balance_yield_apy_pct`, `requires_staking`, `staking_token_name`, `borrowing_min_apr_pct` | array / numeric / bool | – | | stored, not rendered yet |

### Limits

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `daily_spend_limit_usd` | numeric | ○ | `25000` | shown as the daily spend cap |
| `monthly_spend_limit_usd`, `daily_atm_limit_usd` | numeric | – | | stored, not rendered |

### Supported assets

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `supported_cryptos` | text[] | ✔ | `USDC\|ETH\|USDT\|BTC` | powers the crypto filter and `/crypto/[token]` hubs |
| `supported_chains` | text[] | ✔ | `Ethereum\|Arbitrum\|Base` | powers `/crypto/[chain]` hubs |

Chains are matched as **exact strings**. Use these spellings, which the hub pages expect:

```
Ethereum · Polygon · Arbitrum · Bitcoin · Base · Solana · Optimism ·
BNB Chain · Tron · OKX Chain · Stellar · XRP Ledger · Gnosis · Monero · Cronos
```

One existing row (`crypto-com-visa`) has `BTC` where it should say `Bitcoin`, so that card is missing from the Bitcoin page. Symbol hubs are USDT, USDC, BTC, ETH, SOL, XMR, EURe plus chains; other tickers still appear in the filter but have no hub page.

### Editorial content

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `description` | text | ○ | 2–4 sentences | card page intro |
| `pros` | text[] | ○ | `Self-custody\|3% cashback\|0% FX` | 3–4 short points |
| `cons` | text[] | ○ | `Light KYC required\|2.5% ATM after allowance` | 2–3 short points |
| `perks` | text[] | ○ | `Apple & Google Pay\|No FX markup` | badges |
| `requirements_text` | text | ○ | `Light KYC (ID + selfie), 18+` | eligibility line |
| `launched_at` | date | ○ | `2025-06-18` | drives the "new" badge, the "newest" sort and the sitemap's last-modified date |

### Ranking and listings

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `rating_score` | numeric | ✔ | `9.1` | 0–10; directory order and "best of" picks |
| `review_count` | integer | ○ | `1284` | displayed next to the rating |
| `is_sponsored` | bool | ○ | `true` | sponsored slot styling |
| `sponsor_priority` | integer | ○ | `1` | **lower sorts first**; everyone else `99` |
| `is_verified` | bool | ○ | `true` | verified badge; unrendered columns: `has_iban`, `insurance_coverage_usd` |

Ordering in the directory is `sponsor_priority asc, rating_score desc, name asc`.

---

## 2. `card_tiers` — optional, 0..n rows per card

Linked to `cards.id` (`on delete cascade`). Optional: 10 of 63 cards have tiers today, 28 rows in total.

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `card_id` | uuid | ✔ | | the parent card's id; the CSV template uses `card_slug` instead |
| `tier_name` | text | ✔ | `Luxe` | free text — `Standard`, `VIP`, `Icy White`… |
| `tier_order` | integer | ✔ | `1` | 1 = lowest tier |
| `annual_fee_usd` | numeric | ✔ | `0` | |
| `monthly_fee_usd` | numeric | ○ | `0` | |
| `stake_or_portfolio_req` | text | ○ | `$10,000` / `BGB stake / VIP status` | |
| `cashback_pct` | numeric | ✔ | `3.5` | |
| `fx_fee_pct` | numeric | ○ | `0` | |
| `tier_perks` | text[] | ○ | `Metal card\|Higher limits` | |
| `atm_free_allowance_usd` | numeric | ○ | `500` | |
| `daily_spend_limit_usd` | numeric | – | | stored, not rendered |
| `balance_yield_apy_pct`, `atm_fee_notes` | numeric / text | – | | stored, not rendered |

---

## 3. `card_submissions` — app writes this

One row per submission from `/submit-card`. Nothing to prepare; listed so you know it exists.

```
id text pk · company · card_name · email · plan (free|verified|sponsored)
website · contact_name · message · country (default 'unknown')
status (new|reviewing|published|rejected, default 'new') · received_at timestamptz
```

## 4. `affiliate_clicks` — app writes this

One row per outbound card click, for monetisation reporting.

```
id bigint pk · slug · card · source · country (default 'unknown') · clicked_at timestamptz
```

---

## 5. v2 columns (2026-10-28)

Additive: every one is nullable or defaulted, so leaving them blank renders exactly what the site showed before. The mapper in `src/lib/cards-db.ts` already snapshots them; pages can adopt them incrementally.

### Lifecycle and provenance

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `status` | text | ✔ | `live` | `live` `waitlist` `beta` `paused` `discontinued` — CHECK-constrained; only `live` is covered by the directory listing index |
| `source_url` | text | ○ | `https://ether.fi/cash` | issuer page the row was last checked against |
| `last_verified_at` | date | ○ | `2026-10-28` | shown nowhere yet; drives future "stale data" reports |

### Rewards detail

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `cashback_cap_monthly_usd` | numeric | ○ | `500` | null = uncapped |
| `reward_categories` | jsonb | ○ | `[{"category":"groceries","pct":3,"capUsd":100}]` | mirrors the issuer's reward table |
| `cashback_exclusions` | text[] | ○ | `Crypto purchases\|Gift cards` | |
| `payout_schedule` | text | ○ | `weekly` | `per_transaction` `weekly` `monthly` `on_demand` |
| `welcome_bonus_usd` · `welcome_bonus_token` · `welcome_bonus_spend_usd` · `welcome_bonus_ends_at` | numeric · text · numeric · date | ○ | `100` · `CRO` · `1500` · `2026-12-31` | |

### Top-up and fiat rails

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `topup_cap_monthly_usd` | numeric | ○ | `5000` | |
| `topup_methods` | text[] | ○ | `bank_transfer\|card\|crypto\|apple_pay` | |
| `fiat_currencies` | text[] | ○ | `USD\|EUR\|GBP` | ISO-4217 |

### Credit terms

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `credit_limit_usd` | numeric | ○ | `10000` | credit cards only |
| `apr_pct` | numeric | ○ | `24.99` | |
| `credit_check_required` | boolean | ○ | `true` | |
| `secured` | boolean | ○ | `true` | collateral-backed |
| `collateral_ltv_pct` | numeric | ○ | `70` | |

### Fees and FX

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `replacement_fee_usd` | numeric | ○ | `10` | defaults to `0` |
| `inactivity_fee_usd` | numeric | ○ | `3` | defaults to `0` |
| `delivery_fee_usd` | numeric | ○ | `15` | defaults to `0` |
| `fx_weekend_markup_pct` | numeric | ○ | `1` | extra markup on weekends |

### Eligibility and protection

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `age_min` | integer | ○ | `18` | defaults to `18` |
| `residency_required` | boolean | ○ | `true` | |
| `kyc_provider` | text | ○ | `Sumsub` | |
| `funds_protection` | text | ○ | `FDIC via partner bank up to $250k` | free text |

### Distribution and attribution

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `app_required` | boolean | ○ | `true` | defaults to `true` |
| `platforms` | text[] | ○ | `ios\|android\|web` | |
| `official_url` | text | ○ | `https://ether.fi` | distinct from the affiliate link |
| `affiliate_network` | text | ○ | `impact` | |
| `parent_slug` | text | ○ | `crypto-com-visa` | points a duplicate/regional row at its canonical card |

### `card_tiers` additions

| Column | Type | Req | Example | Notes |
| --- | --- | --- | --- | --- |
| `cashback_cap_monthly_usd` | numeric | ○ | `500` | |
| `travel_reward_pct` | numeric | ○ | `2` | defaults to `0` |
| `atm_monthly_cap_usd` | numeric | ○ | `2000` | |
| `topup_cap_monthly_usd` | numeric | ○ | `5000` | |
| `lounge_visits_per_year` | integer | ○ | `4` | |
| `updated_at` | timestamptz | auto | | maintained by trigger |

### `card_benefits` — structured perks

One row per benefit. `tier_id` null means the benefit applies to the card; otherwise it belongs to that tier and renders with it. `benefit_type` is CHECK-constrained to `cashback`, `welcome_bonus`, `lounge`, `subscription_rebate`, `travel`, `insurance`, `purchase_protection`, `fx`, `atm`, `yield`, `concierge`, `other`.

| Column | Type | Req | Example |
| --- | --- | --- | --- |
| `card_id` | uuid | ✔ | parent card |
| `tier_id` | uuid | – | null for card-level |
| `benefit_type` | text | ✔ | `lounge` |
| `title` | text | ✔ | `Priority Pass lounge access` |
| `value_json` | jsonb | ○ | `{"visits": 4, "guests": 1}` |
| `details` | text | ○ | `Pro and Private tiers only` |
| `source_url` | text | ○ | issuer terms page |
| `last_verified_at` | date | ○ | defaults to today |
| `sort_order` | integer | ○ | `0` |

```sql
insert into card_benefits (card_id, benefit_type, title, value_json, source_url)
select id, 'lounge', 'Priority Pass lounge access',
       '{"visits": 4, "guests": 1}'::jsonb,
       'https://crypto.com/document/us_credit_card'
from cards where slug = 'crypto-com-visa';
```

### Applying an audit

`npm run db:backfill` reads `db/import/card-refresh-<date>.json` and writes only changes marked `status: "apply"`; held and rejected findings are ignored. It is a dry run unless you add `--write`, and each touched card gets `source_url` + `last_verified_at`. Run `npm run db:sync` afterwards.

---

## Spreadsheet templates

[cards.csv](templates/cards.csv) and [card_tiers.csv](templates/card_tiers.csv) have every editable column as a header row, plus the current `ether.fi Cash` row to show formatting (with `|`-joined arrays and `YYYY-MM-DD` dates). Overwrite that example row with your own data.

## Importing a spreadsheet

`npm run db:import` loads a CSV straight into Neon and then refreshes the snapshot:

```bash
npm run db:import                       # db/import/cards.csv (+ card_tiers.csv if present)
npm run db:import -- --cards path.csv   # a specific file
npm run db:import -- --dry-run          # parse and validate, write nothing
npm run db:import -- --prune            # also delete cards that are not in the file
```

Cards are matched on `slug`, so running it twice updates instead of duplicating, and only the columns in your header are written — a 20-column sheet leaves the other 50 columns as they are. `card_tiers.csv` is optional and uses `card_slug` instead of `card_id`; supplying it replaces the tiers of every card it mentions.

It refuses unknown column names (compare with [cards-schema.sql](cards-schema.sql)) and reports invalid enum values, unknown country codes and unknown mobile wallets before writing anything. Cards in the database that are missing from the file are left alone and listed, unless you pass `--prune`.

**Quote cells that contain commas.** A plain CSV export from a spreadsheet writes `"EEA, Switzerland"`; if it does not, the record splits into extra fields. The importer can rebuild those rows (it knows every column's type, and a field separator is followed by no space while a prose comma is), and it prints which cells it merged — but that is inference, so quoting the cells is what makes an import exact. `--strict` refuses to guess and fails on any row with the wrong field count.

The other way in is `npm run db:sync` after editing rows directly, or `npm run db:seed`, which loads the [seed-cards.json](seed-cards.json) fixture. Any change to the table needs a sync before it reaches the pages — `npm run build` does that for you through `prebuild`.

## Minimum for one card

To add a card that looks complete and appears in every relevant filter:

```
name, slug, tagline, affiliate_url, website
logo_text, brand_from, brand_to, brand_ink
network, card_type, custody_model, audience
has_virtual, has_physical, mobile_wallets
kyc_level, no_kyc_limit_usd, supported_countries, regional_scope
annual_fee_usd, monthly_fee_usd, issuance_physical_fee_usd,
topup_fee_pct, fx_fee_pct, topup_fee_notes, fx_fee_notes
atm_local_fee_pct, atm_fee_text, monthly_atm_limit_usd
cashback_min_pct, cashback_max_pct, payout_token, staking_requirement
daily_spend_limit_usd, supported_cryptos, supported_chains
perks, description, pros, cons, requirements_text
rating_score, review_count, is_sponsored, sponsor_priority
```

Everything not in that list can be left blank and the page still renders, using the fallbacks below.

## What appears if a field is blank

| Field | Fallback |
| --- | --- |
| `brand_from` / `brand_to` / `brand_ink` | `#0f3d2e` / `#54d2a1` / `#eafff6` |
| `network`, `card_type`, `custody_model`, `audience`, `kyc_level` | `visa`, `debit`, `custodial`, `both`, `full_kyc` |
| `topup_fee_notes` | `Free crypto top-ups` |
| `fx_fee_notes` | `0% on USD spend` |
| `atm_fee_text` | `Free at in-network ATMs` |
| `daily_spend_limit_usd` | `10000` |
| `payout_token` | `USD` |
| `staking_requirement` | `None` |
| `requirements_text` | `Standard identity verification` |
| `rating_score`, `sponsor_priority` | `7.5`, `99` |
| `launched_at` | `2024-01-15` |
| `description`, `pros`, `cons`, `logo_text` | empty |
| tier `stake_or_portfolio_req` | `$0` |
