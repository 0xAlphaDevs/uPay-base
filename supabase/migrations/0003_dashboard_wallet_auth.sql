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
