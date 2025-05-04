-- companies
alter table public.companies enable row level security;

create policy "Users can manage their own companies"
on public.companies
for all
to public
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- vehicles
alter table public.vehicles enable row level security;

create policy "Users can manage their own vehicles"
on public.vehicles
for all
to public
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- line_tokens
alter table public.line_tokens enable row level security;

create policy "Users can manage their own line tokens"
on public.line_tokens
for all
to public
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- maintenance_schedule
alter table public.maintenance_schedule enable row level security;

create policy "Users can manage their own maintenance records"
on public.maintenance_schedule
for all
to public
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
