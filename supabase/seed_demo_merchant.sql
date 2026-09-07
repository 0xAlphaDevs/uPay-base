-- Seeds one demo merchant + a publishable/secret API key pair.
-- Run this once, after 0001_init.sql, in the Supabase SQL Editor.
-- The final SELECT is the only place the plaintext keys are ever shown —
-- copy them into apps/web/.env.local and apps/demo-store/.env.local now,
-- the secret key can't be recovered from the database afterwards (only
-- its hash is stored, same as a real "reveal once" API key).

with new_keys as (
  select
    'pk_test_' || encode(gen_random_bytes(12), 'hex') as pk,
    'sk_test_' || encode(gen_random_bytes(12), 'hex') as sk
),
new_merchant as (
  insert into merchants (name, email, settlement_address, settlement_token)
  values ('Pixel Threads', 'founder@demostore.xyz', '0xA1c4d2000000000000000000000000E9b27F', 'USDC')
  returning id
),
inserted_pk as (
  insert into api_keys (merchant_id, key_prefix, key_hash, type)
  select new_merchant.id, left(new_keys.pk, 16), encode(digest(new_keys.pk, 'sha256'), 'hex'), 'publishable'
  from new_merchant, new_keys
),
inserted_sk as (
  insert into api_keys (merchant_id, key_prefix, key_hash, type)
  select new_merchant.id, left(new_keys.sk, 16), encode(digest(new_keys.sk, 'sha256'), 'hex'), 'secret'
  from new_merchant, new_keys
)
select
  new_merchant.id as merchant_id,
  new_keys.pk as publishable_key,
  new_keys.sk as secret_key
from new_merchant, new_keys;
