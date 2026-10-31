create table public.nov_ballot_2026_vaults_v1 (
 token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
 revision integer not null default 1 check (revision > 0),
 vault jsonb not null check (octet_length(vault::text) <= 100000),
 updated_at timestamptz not null default now()
);
alter table public.nov_ballot_2026_vaults_v1 enable row level security;
revoke all on public.nov_ballot_2026_vaults_v1 from public, anon, authenticated;
grant select, insert, update on public.nov_ballot_2026_vaults_v1 to service_role;
comment on table public.nov_ballot_2026_vaults_v1 is 'Isolated encrypted Nov ballot sync. No direct client access. Capability hashes only; no passcodes or plaintext votes.';
