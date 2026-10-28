-- RItuel schema for Neon Postgres.
--
-- Apply once over the DIRECT connection, which `neon env pull` writes as
-- DATABASE_URL_UNPOOLED. Transaction-mode pooling does not hold a session, and
-- schema changes want one:
--   neon psql -- -f db/schema.sql
--   psql "$DATABASE_URL_UNPOOLED" -f db/schema.sql
-- or paste the file into the Neon SQL Editor.
--
-- Every statement is idempotent, so re-running it after a change is safe.

create table if not exists card_submissions (
  id            text primary key,
  company       text not null,
  card_name     text not null,
  email         text not null,
  plan          text not null default 'free',
  website       text,
  contact_name  text,
  message       text,
  country       text not null default 'unknown',
  status        text not null default 'new',
  received_at   timestamptz not null default now(),
  constraint card_submissions_plan_check check (plan in ('free', 'verified', 'sponsored')),
  constraint card_submissions_status_check check (status in ('new', 'reviewing', 'published', 'rejected'))
);

create index if not exists card_submissions_received_at_idx
  on card_submissions (received_at desc);

create index if not exists card_submissions_email_idx
  on card_submissions (lower(email));

create index if not exists card_submissions_status_idx
  on card_submissions (status, received_at desc);

create table if not exists affiliate_clicks (
  id          bigint generated always as identity primary key,
  slug        text not null,
  card        text,
  source      text,
  country     text not null default 'unknown',
  clicked_at  timestamptz not null default now()
);

create index if not exists affiliate_clicks_slug_idx
  on affiliate_clicks (slug, clicked_at desc);

create index if not exists affiliate_clicks_clicked_at_idx
  on affiliate_clicks (clicked_at desc);
