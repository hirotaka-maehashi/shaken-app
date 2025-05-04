-- Enable RLS and allow full access to own company
alter table public.companies enable row level security;

create policy "Users can manage their own companies"
on public.companies
for all
to public
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
