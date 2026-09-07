-- ==== 0001_init.sql ====
-- UPay Milestone 2 schema.
-- Run this once in the Supabase SQL Editor (dashboard.supabase.com -> your project -> SQL Editor -> New query).
-- Data model per UPay-ClaudeCode-Prompt.md.

create extension if not exists pgcrypto;

create table merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  settlement_address text not null,
  settlement_token text not null default 'USDC' check (settlement_token in ('USDC', 'EURC')),
  created_at timestamptz not null default now()
);

create table api_keys (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  key_prefix text not null,
  key_hash text not null,
  type text not null check (type in ('publishable', 'secret')),
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);
create index api_keys_key_hash_idx on api_keys(key_hash);
create index api_keys_merchant_id_idx on api_keys(merchant_id);

create table checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  amount numeric not null check (amount > 0),
  settle_token text not null check (settle_token in ('USDC', 'EURC')),
  recipient text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired')),
  is_subscription boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  success_url text,
  cancel_url text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 minutes')
);
create index checkout_sessions_merchant_id_idx on checkout_sessions(merchant_id);

create table payments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references checkout_sessions(id) on delete cascade,
  merchant_id uuid not null references merchants(id) on delete cascade,
  payer_address text not null,
  settle_token text not null check (settle_token in ('USDC', 'EURC')),
  amount numeric not null,
  source_chain text,
  source_token text,
  deposit_tx_hash text,
  spend_tx_hash text,
  status text not null default 'pending' check (status in ('pending', 'settled', 'failed')),
  settled_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index payments_session_id_idx on payments(session_id);
create index payments_merchant_id_idx on payments(merchant_id);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  payer_address text not null,
  delegate_address text not null,
  amount numeric not null check (amount > 0),
  token text not null check (token in ('USDC', 'EURC')),
  cadence text not null check (cadence in ('daily', 'weekly', 'monthly')),
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  next_charge_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index subscriptions_merchant_id_idx on subscriptions(merchant_id);

-- RLS: locked down everywhere. The app never talks to Supabase from the
-- browser — every read/write goes through Next.js API routes using the
-- service-role key, which bypasses RLS. No policies are defined on
-- purpose: the anon key (used only for auth-adjacent client bits, if any)
-- should never be able to read or write these tables directly.
alter table merchants enable row level security;
alter table api_keys enable row level security;
alter table checkout_sessions enable row level security;
alter table payments enable row level security;
alter table subscriptions enable row level security;

-- ==== 0002_api_key_plaintext.sql ====
-- UPay: adds a plaintext column for publishable keys only, so the dashboard
-- can actually display a merchant's pk_ after creation (like Stripe does).
-- Secret keys (type='secret') must never have this populated, they can
-- only ever be seen once, at creation or roll time, same as api_keys.key_hash
-- already assumed. Run this once in the Supabase SQL Editor.

alter table api_keys add column if not exists key_plaintext text;

-- Backfill the seeded demo merchant's known publishable key (see CLAUDE.md /
-- apps/demo-store/.env.local) so it shows up correctly without re-seeding.
update api_keys
set key_plaintext = 'pk_test_f8b1e39f4132a83845da1060'
where key_prefix = 'pk_test_f8b1e39f' and type = 'publishable' and key_plaintext is null;

-- ==== 0003_dashboard_wallet_auth.sql ====
-- UPay: wallet-connect dashboard onboarding.
-- Merchants can now log into /dashboard by connecting + signing with a
-- wallet instead of pasting an API key. owner_address is that login
-- identity, separate from settlement_address (where payouts land),
-- which stays independently editable in Settings.
-- Run this once in the Supabase SQL Editor.

alter table merchants add column if not exists owner_address text;
create unique index if not exists merchants_owner_address_idx on merchants (owner_address) where owner_address is not null;

-- Wallet-onboarded merchants don't collect an email up front.
alter table merchants alter column email drop not null;

-- ==== 0004_multi_chain_deposits.sql ====
-- UPay: multi-chain Unified Balance deposits.
-- Checkout can now pull USDC from more than one source chain to cover a single
-- payment (e.g. $1 on Base Sepolia + $3 on Ethereum Sepolia = $4 owed), which the
-- old single-value source_chain/deposit_tx_hash text columns can't represent without
-- losing the per-chain breakdown. source_deposits keeps the full structured record;
-- source_chain/deposit_tx_hash stay populated with a joined summary string so the
-- existing dashboard Payments view (which reads those two columns directly) keeps
-- working unchanged.
-- Run this once in the Supabase SQL Editor.

alter table payments add column if not exists source_deposits jsonb;

