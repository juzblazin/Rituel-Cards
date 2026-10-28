-- RItuel card catalog — schema v2 (2026-10-28)
--
-- Canonical shape for `cards`, `card_tiers` and `card_benefits` in Neon
-- Postgres. Every statement is idempotent: running this file on an empty
-- database creates the catalog, and running it on the existing catalog
-- upgrades it in place without rewriting row data (the only data changes are
-- the two normalisations at the bottom).
--
-- Apply over the DIRECT connection (schema changes want a session):
--   psql "$DATABASE_URL_UNPOOLED" -f db/cards-schema.sql
-- or paste it into the Neon SQL Editor.
--
-- What v2 adds
--   cards         lifecycle + verification, cashback caps/categories, welcome
--                 bonus, top-up and fiat rails, credit terms, collateral,
--                 fixed fees, FX weekend markup, eligibility, fund protection,
--                 affiliate attribution, duplicate grouping, full-text search
--   card_tiers    caps, travel rewards, lounge allowance, updated_at
--   card_benefits new table: structured, source-verified perks
--   constraints   enum CHECKs (invalid values used to fall back silently)
--   indexes       GIN on countries/cryptos/chains + search_vector
--
-- After editing rows, refresh the app's snapshot with `npm run db:sync`.

create extension if not exists "uuid-ossp";

/* ------------------------------------------------------------------ */
/* Tables                                                             */
/* ------------------------------------------------------------------ */

create table if not exists cards (
  id                            uuid primary key default uuid_generate_v4(),
  name                          varchar not null,
  slug                          varchar not null unique,
  tagline                       varchar,
  logo_url                      text,
  card_image_url                text,
  affiliate_url                 text not null,
  issuer_bank                   varchar,

  -- architecture & custody
  network                       varchar not null default 'visa',
  card_type                     varchar not null default 'debit',
  custody_model                 varchar not null default 'custodial',
  custody_tech                  varchar,
  settlement_chain              varchar,

  -- forms & wallets
  has_virtual                   boolean default true,
  has_physical                  boolean default false,
  has_metal                     boolean default false,
  mobile_wallets                text[] default '{}',

  -- compliance & geography
  kyc_level                     varchar default 'full_kyc',
  kyc_notes                     text,
  supported_countries           text[] default '{}',
  excluded_countries            text[] default '{}',
  regional_scope                varchar,

  -- costs & fx
  annual_fee_usd                numeric default 0.00,
  monthly_fee_usd               numeric default 0.00,
  issuance_virtual_fee_usd      numeric default 0.00,
  issuance_physical_fee_usd     numeric default 0.00,
  topup_fee_pct                 numeric default 0.00,
  fx_fee_pct                    numeric default 0.00,
  fx_fee_notes                  text,
  is_gasless                    boolean default false,

  -- atm
  atm_fee_text                  text,
  atm_local_fee_pct             numeric default 0.00,
  atm_intl_fee_pct              numeric default 0.00,
  atm_monthly_free_allowance_usd numeric default 0.00,

  -- rewards & yield
  cashback_min_pct              numeric default 0.00,
  cashback_max_pct              numeric default 0.00,
  reward_asset_type             varchar default 'crypto',
  reward_assets_supported       text[] default '{}',
  balance_yield_apy_pct         numeric default 0.00,
  requires_staking              boolean default false,
  staking_token_name            varchar,
  borrowing_min_apr_pct         numeric,

  -- limits
  daily_spend_limit_usd         numeric,
  monthly_spend_limit_usd       numeric,
  daily_atm_limit_usd           numeric,

  -- currencies & networks
  supported_cryptos             text[] default '{}',
  supported_chains              text[] default '{}',

  -- perks & value-adds
  perks                         text[] default '{}',
  has_iban                      boolean default false,
  insurance_coverage_usd        numeric default 0.00,

  -- site display flags
  rating_score                  numeric default 7.5,
  review_count                  integer default 0,
  is_verified                   boolean default false,
  is_sponsored                  boolean default false,
  sponsor_priority              integer default 99,

  created_at                    timestamptz default now(),
  updated_at                    timestamptz default now()
);

create table if not exists card_tiers (
  id                     uuid primary key default uuid_generate_v4(),
  card_id                uuid references cards (id) on delete cascade,
  tier_name              varchar not null,
  tier_order             integer default 1,
  annual_fee_usd         numeric default 0.00,
  monthly_fee_usd        numeric default 0.00,
  stake_or_portfolio_req text,
  cashback_pct           numeric default 0.00,
  fx_fee_pct             numeric default 0.00,
  balance_yield_apy_pct  numeric default 0.00,
  atm_free_allowance_usd numeric default 0.00,
  atm_fee_notes          text,
  daily_spend_limit_usd  numeric,
  tier_perks             text[] default '{}',
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

create table if not exists card_benefits (
  id               uuid primary key default uuid_generate_v4(),
  card_id          uuid not null references cards (id) on delete cascade,
  tier_id          uuid references card_tiers (id) on delete cascade,
  benefit_type     varchar not null,
  title            varchar not null,
  value_json       jsonb not null default '{}'::jsonb,
  details          text,
  source_url       text,
  last_verified_at date default current_date,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now()
);

/* ------------------------------------------------------------------ */
/* v2 columns — `cards`                                               */
/* ------------------------------------------------------------------ */

alter table cards
  -- lifecycle & provenance
  add column if not exists status                     varchar not null default 'live',
  add column if not exists source_url                 text,
  add column if not exists last_verified_at           date,

  -- rewards detail
  add column if not exists cashback_cap_monthly_usd   numeric,
  add column if not exists reward_categories          jsonb not null default '[]'::jsonb,
  add column if not exists cashback_exclusions        text[] not null default '{}',
  add column if not exists payout_schedule            varchar,
  add column if not exists welcome_bonus_usd          numeric,
  add column if not exists welcome_bonus_token        varchar,
  add column if not exists welcome_bonus_spend_usd    numeric,
  add column if not exists welcome_bonus_ends_at      date,

  -- top-up & fiat rails
  add column if not exists topup_cap_monthly_usd      numeric,
  add column if not exists topup_methods              text[] not null default '{}',
  add column if not exists fiat_currencies            text[] not null default '{}',

  -- credit terms
  add column if not exists credit_limit_usd           numeric,
  add column if not exists apr_pct                    numeric,
  add column if not exists credit_check_required      boolean not null default false,
  add column if not exists secured                    boolean not null default false,
  add column if not exists collateral_ltv_pct         numeric,

  -- fixed fees
  add column if not exists replacement_fee_usd        numeric not null default 0,
  add column if not exists inactivity_fee_usd         numeric not null default 0,
  add column if not exists delivery_fee_usd           numeric not null default 0,

  -- fx
  add column if not exists fx_weekend_markup_pct      numeric,

  -- eligibility & protection
  add column if not exists age_min                    integer not null default 18,
  add column if not exists residency_required         boolean not null default false,
  add column if not exists kyc_provider               varchar,
  add column if not exists funds_protection           varchar,

  -- distribution & attribution
  add column if not exists app_required               boolean not null default true,
  add column if not exists platforms                  text[] not null default '{}',
  add column if not exists official_url               text,
  add column if not exists affiliate_network          varchar,
  add column if not exists parent_slug                varchar,

  -- search
  add column if not exists search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(tagline, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'C')
  ) stored;

alter table cards alter column sponsor_priority set default 99;

/* ------------------------------------------------------------------ */
/* v2 columns — `card_tiers`                                          */
/* ------------------------------------------------------------------ */

alter table card_tiers
  add column if not exists cashback_cap_monthly_usd numeric,
  add column if not exists travel_reward_pct        numeric not null default 0,
  add column if not exists atm_monthly_cap_usd      numeric,
  add column if not exists topup_cap_monthly_usd    numeric,
  add column if not exists lounge_visits_per_year   integer,
  add column if not exists updated_at               timestamptz not null default now();

/* ------------------------------------------------------------------ */
/* Enum CHECKs                                                        */
/*                                                                    */
/* Added NOT VALID so one bad legacy row cannot abort the upgrade;    */
/* they still apply to every new write. Existing rows are validated    */
/* individually below and only reported, never deleted.               */
/* ------------------------------------------------------------------ */

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cards_network_check') then
    alter table cards add constraint cards_network_check
      check (network in ('visa', 'mastercard', 'unionpay', 'other')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cards_card_type_check') then
    alter table cards add constraint cards_card_type_check
      check (card_type in ('debit', 'credit', 'prepaid', 'dual_mode')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cards_custody_model_check') then
    alter table cards add constraint cards_custody_model_check
      check (custody_model in ('custodial', 'self_custody', 'hybrid')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cards_audience_check') then
    alter table cards add constraint cards_audience_check
      check (audience in ('personal', 'business', 'both')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cards_kyc_level_check') then
    alter table cards add constraint cards_kyc_level_check
      check (kyc_level in ('no_kyc', 'light_kyc', 'full_kyc')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cards_reward_asset_type_check') then
    alter table cards add constraint cards_reward_asset_type_check
      check (reward_asset_type in ('crypto', 'stablecoin', 'native_token', 'stocks_gold')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cards_status_check') then
    alter table cards add constraint cards_status_check
      check (status in ('live', 'waitlist', 'beta', 'paused', 'discontinued')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cards_payout_schedule_check') then
    alter table cards add constraint cards_payout_schedule_check
      check (payout_schedule in ('per_transaction', 'weekly', 'monthly', 'on_demand')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'card_benefits_benefit_type_check') then
    alter table card_benefits add constraint card_benefits_benefit_type_check
      check (benefit_type in (
        'cashback', 'welcome_bonus', 'lounge', 'subscription_rebate', 'travel',
        'insurance', 'purchase_protection', 'fx', 'atm', 'yield', 'concierge', 'other'
      )) not valid;
  end if;
end $$;

create or replace function catalog_validate_constraint(tbl regclass, con name)
returns void language plpgsql as $$
begin
  execute format('alter table %s validate constraint %I', tbl, con);
exception when others then
  raise notice 'catalog: % on % left NOT VALID — %', con, tbl, sqlerrm;
end $$;

select catalog_validate_constraint('cards', 'cards_network_check');
select catalog_validate_constraint('cards', 'cards_card_type_check');
select catalog_validate_constraint('cards', 'cards_custody_model_check');
select catalog_validate_constraint('cards', 'cards_audience_check');
select catalog_validate_constraint('cards', 'cards_kyc_level_check');
select catalog_validate_constraint('cards', 'cards_reward_asset_type_check');
select catalog_validate_constraint('cards', 'cards_status_check');
select catalog_validate_constraint('cards', 'cards_payout_schedule_check');
select catalog_validate_constraint('card_benefits', 'card_benefits_benefit_type_check');

drop function catalog_validate_constraint(regclass, name);

/* ------------------------------------------------------------------ */
/* Indexes                                                            */
/* ------------------------------------------------------------------ */

create index if not exists idx_cards_slug on cards (slug);
create index if not exists idx_cards_kyc on cards (kyc_level);
create index if not exists idx_cards_custody on cards (custody_model);
create index if not exists idx_cards_type on cards (card_type);
create index if not exists idx_cards_sponsored on cards (is_sponsored desc, rating_score desc);
create index if not exists idx_cards_status on cards (status);
create index if not exists idx_cards_listing on cards (sponsor_priority, rating_score desc) where status = 'live';

-- Array containment (`supported_countries @> '{DE}'`) and search.
create index if not exists idx_cards_countries_gin on cards using gin (supported_countries);
create index if not exists idx_cards_cryptos_gin on cards using gin (supported_cryptos);
create index if not exists idx_cards_chains_gin on cards using gin (supported_chains);
create index if not exists idx_cards_search on cards using gin (search_vector);

create index if not exists idx_card_tiers_card_id on card_tiers (card_id);
create index if not exists idx_card_benefits_card_id on card_benefits (card_id, sort_order);
create index if not exists idx_card_benefits_tier_id on card_benefits (tier_id);

/* ------------------------------------------------------------------ */
/* updated_at                                                         */
/* ------------------------------------------------------------------ */

create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists cards_touch_updated_at on cards;
create trigger cards_touch_updated_at before update on cards
for each row execute function touch_updated_at();

drop trigger if exists card_tiers_touch_updated_at on card_tiers;
create trigger card_tiers_touch_updated_at before update on card_tiers
for each row execute function touch_updated_at();

/* ------------------------------------------------------------------ */
/* Documentation (shows in the Neon table view)                       */
/* ------------------------------------------------------------------ */

comment on column cards.status is 'live | waitlist | beta | paused | discontinued — only live rows belong in the directory.';
comment on column cards.reward_categories is 'Array of {category, pct, capUsd, notes}; mirrors the issuer reward table.';
comment on column cards.cashback_cap_monthly_usd is 'Monthly spend or earn cap for the headline cashback rate; null = uncapped.';
comment on column cards.payout_schedule is 'per_transaction | weekly | monthly | on_demand';
comment on column cards.topup_methods is 'bank_transfer | card | crypto | apple_pay | google_pay | cash';
comment on column cards.platforms is 'ios | android | web';
comment on column cards.funds_protection is 'Free text, e.g. "FDIC via partner bank up to $250k" or "none".';
comment on column cards.parent_slug is 'Slug of the canonical product when this row is a regional/duplicate variant.';
comment on table card_benefits is 'Structured card or tier benefits (lounge, insurance, rebates) with source URL and verification date.';
comment on column card_benefits.value_json is 'Machine-readable value, e.g. {"visits": 4, "guests": 1} or {"capUsd": 300, "pct": 4.5}.';

/* ------------------------------------------------------------------ */
/* Data normalisations                                                */
/* ------------------------------------------------------------------ */

-- The Bitcoin hub matches the chain name exactly, so rows that stored the
-- ticker in `supported_chains` never appeared on /crypto/bitcoin.
update cards
set supported_chains = array_replace(supported_chains, 'BTC', 'Bitcoin')
where 'BTC' = any (supported_chains);

-- New rows without an explicit rank should sort after every ranked card.
update cards set sponsor_priority = 99 where sponsor_priority is null;
