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
