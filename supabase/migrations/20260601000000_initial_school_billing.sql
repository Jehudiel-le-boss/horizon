create type public.school_role as enum (
  'owner',
  'director',
  'accountant',
  'cashier',
  'parent'
);

create type public.membership_status as enum ('invited', 'active', 'suspended');
create type public.academic_year_status as enum ('planned', 'active', 'closed');
create type public.admission_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');
create type public.guardian_link_status as enum ('pending', 'verified', 'rejected', 'revoked');
create type public.invoice_status as enum ('issued', 'settled', 'cancelled');
create type public.payment_method as enum ('cash', 'mobile_money', 'bank_transfer', 'check', 'fedapay', 'other');
create type public.payment_status as enum (
  'pending',
  'confirmed',
  'failed',
  'cancelled',
  'refund_pending',
  'partially_refunded',
  'refunded'
);
create type public.refund_status as enum ('requested', 'pending', 'confirmed', 'failed', 'cancelled');
create type public.notification_channel as enum ('in_app', 'email', 'whatsapp');

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  country_code char(2) not null default 'BJ',
  currency char(3) not null default 'XOF',
  timezone text not null default 'Africa/Porto-Novo',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.school_memberships (
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.school_role not null check (role <> 'parent'),
  status public.membership_status not null default 'invited',
  created_at timestamptz not null default now(),
  primary key (school_id, user_id)
);

create table public.academic_years (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  label text not null check (length(trim(label)) > 0),
  starts_on date not null,
  ends_on date not null,
  status public.academic_year_status not null default 'planned',
  created_at timestamptz not null default now(),
  unique (school_id, label),
  unique (id, school_id),
  check (ends_on > starts_on)
);

create table public.school_classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  level text,
  created_at timestamptz not null default now(),
  unique (school_id, name),
  unique (id, school_id)
);

create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null check (length(trim(full_name)) > 0),
  email text,
  phone text,
  created_at timestamptz not null default now(),
  unique (id, school_id)
);

create unique index guardians_school_email_unique
  on public.guardians (school_id, lower(email))
  where email is not null;

create table public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  admission_number text not null,
  full_name text not null check (length(trim(full_name)) > 0),
  created_at timestamptz not null default now(),
  unique (school_id, admission_number),
  unique (id, school_id)
);

create table public.guardian_student_links (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  guardian_id uuid not null,
  student_id uuid not null,
  status public.guardian_link_status not null default 'pending',
  verified_by uuid references public.profiles(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (guardian_id, school_id)
    references public.guardians(id, school_id) on delete cascade,
  foreign key (student_id, school_id)
    references public.students(id, school_id) on delete cascade,
  unique (guardian_id, student_id),
  check ((status = 'verified') = (verified_at is not null))
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  student_id uuid not null,
  academic_year_id uuid not null,
  class_id uuid not null,
  status public.admission_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (student_id, school_id)
    references public.students(id, school_id) on delete cascade,
  foreign key (academic_year_id, school_id)
    references public.academic_years(id, school_id) on delete restrict,
  foreign key (class_id, school_id)
    references public.school_classes(id, school_id) on delete restrict,
  unique (student_id, academic_year_id),
  unique (id, school_id)
);

create table public.fee_categories (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  description text,
  created_at timestamptz not null default now(),
  unique (school_id, name),
  unique (id, school_id)
);

create table public.fee_configurations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  academic_year_id uuid not null,
  class_id uuid not null,
  category_id uuid not null,
  amount bigint not null check (amount > 0),
  currency char(3) not null default 'XOF',
  due_on date,
  created_at timestamptz not null default now(),
  foreign key (academic_year_id, school_id)
    references public.academic_years(id, school_id) on delete cascade,
  foreign key (class_id, school_id)
    references public.school_classes(id, school_id) on delete cascade,
  foreign key (category_id, school_id)
    references public.fee_categories(id, school_id) on delete restrict,
  unique (school_id, academic_year_id, class_id, category_id),
  unique (id, school_id)
);

create table public.payment_plans (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  academic_year_id uuid not null,
  class_id uuid not null,
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  foreign key (academic_year_id, school_id)
    references public.academic_years(id, school_id) on delete cascade,
  foreign key (class_id, school_id)
    references public.school_classes(id, school_id) on delete cascade,
  unique (school_id, academic_year_id, class_id, name),
  unique (id, school_id)
);

create table public.payment_plan_installments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  plan_id uuid not null,
  sequence_number integer not null check (sequence_number > 0),
  label text not null check (length(trim(label)) > 0),
  amount bigint not null check (amount > 0),
  due_on date not null,
  created_at timestamptz not null default now(),
  foreign key (plan_id, school_id)
    references public.payment_plans(id, school_id) on delete cascade,
  unique (plan_id, sequence_number),
  unique (id, school_id)
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  enrollment_id uuid not null,
  academic_year_id uuid not null,
  invoice_number text not null,
  total_amount bigint not null check (total_amount > 0),
  currency char(3) not null default 'XOF',
  status public.invoice_status not null default 'issued',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (enrollment_id, school_id)
    references public.enrollments(id, school_id) on delete restrict,
  foreign key (academic_year_id, school_id)
    references public.academic_years(id, school_id) on delete restrict,
  unique (school_id, invoice_number),
  unique (enrollment_id),
  unique (id, school_id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  invoice_id uuid not null,
  amount bigint not null check (amount > 0),
  currency char(3) not null default 'XOF',
  method public.payment_method not null,
  status public.payment_status not null default 'pending',
  provider_reference text,
  idempotency_key uuid not null unique,
  note text,
  created_by uuid,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (invoice_id, school_id)
    references public.invoices(id, school_id) on delete restrict,
  unique (id, school_id),
  check (
    (status in ('confirmed', 'refund_pending', 'partially_refunded', 'refunded'))
    = (confirmed_at is not null)
  )
);

create unique index payments_provider_reference_unique
  on public.payments (method, provider_reference)
  where provider_reference is not null;

create table public.receipt_counters (
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null,
  last_number bigint not null default 0 check (last_number >= 0),
  primary key (school_id, academic_year_id),
  foreign key (academic_year_id, school_id)
    references public.academic_years(id, school_id) on delete restrict
);

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  payment_id uuid not null,
  academic_year_id uuid not null,
  receipt_number text not null,
  school_name text not null,
  academic_year_label text not null,
  student_name text not null,
  admission_number text not null,
  invoice_number text not null,
  amount bigint not null check (amount > 0),
  currency char(3) not null,
  payment_method public.payment_method not null,
  provider_reference text,
  payment_confirmed_at timestamptz not null,
  issued_at timestamptz not null default now(),
  foreign key (payment_id, school_id)
    references public.payments(id, school_id) on delete restrict,
  foreign key (academic_year_id, school_id)
    references public.academic_years(id, school_id) on delete restrict,
  unique (school_id, receipt_number),
  unique (payment_id)
);

create table public.payment_refunds (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  payment_id uuid not null,
  amount bigint not null check (amount > 0),
  status public.refund_status not null default 'requested',
  reason text not null check (length(trim(reason)) > 0),
  idempotency_key uuid not null unique,
  provider_reference text,
  requested_by uuid,
  decided_by uuid,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  foreign key (payment_id, school_id)
    references public.payments(id, school_id) on delete restrict,
  check ((status = 'confirmed') = (completed_at is not null))
);

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  payment_id uuid not null,
  event_type text not null check (length(trim(event_type)) > 0),
  actor_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  foreign key (payment_id, school_id)
    references public.payments(id, school_id) on delete restrict
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete restrict,
  actor_id uuid,
  action text not null check (length(trim(action)) > 0),
  entity_type text not null check (length(trim(entity_type)) > 0),
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  body text not null check (length(trim(body)) > 0),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (id, school_id)
);

create table public.notification_recipients (
  notification_id uuid not null,
  school_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz,
  primary key (notification_id, user_id),
  foreign key (notification_id, school_id)
    references public.notifications(id, school_id) on delete cascade
);

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  notification_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  channel public.notification_channel not null,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'failed', 'skipped')),
  provider_reference text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (notification_id, school_id)
    references public.notifications(id, school_id) on delete cascade
);

create index school_memberships_user_status_idx
  on public.school_memberships (user_id, status);
create index guardians_user_school_idx
  on public.guardians (user_id, school_id);
create index guardian_links_student_status_idx
  on public.guardian_student_links (student_id, status);
create index enrollments_school_year_class_idx
  on public.enrollments (school_id, academic_year_id, class_id, status);
create index invoices_school_created_idx
  on public.invoices (school_id, created_at desc);
create index payments_invoice_status_idx
  on public.payments (invoice_id, status);
create index payments_school_created_idx
  on public.payments (school_id, created_at desc);
create index payment_refunds_payment_status_idx
  on public.payment_refunds (payment_id, status);
create index notifications_school_created_idx
  on public.notifications (school_id, created_at desc);
create index notification_recipients_user_idx
  on public.notification_recipients (user_id, read_at);
create index audit_events_school_created_idx
  on public.audit_events (school_id, created_at desc);

create schema private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create function private.has_school_role(
  p_school_id uuid,
  p_roles public.school_role[] default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.school_memberships as m
    where m.school_id = p_school_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and (p_roles is null or m.role = any (p_roles))
  );
$$;

create function private.is_guardian_of_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.guardian_student_links as link
    join public.guardians as guardian
      on guardian.id = link.guardian_id
     and guardian.school_id = link.school_id
    where link.student_id = p_student_id
      and link.status = 'verified'
      and guardian.user_id = (select auth.uid())
  );
$$;

create function private.is_guardian_of_school(p_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.guardians as guardian
    join public.guardian_student_links as link
      on link.guardian_id = guardian.id
     and link.school_id = guardian.school_id
    where guardian.school_id = p_school_id
      and guardian.user_id = (select auth.uid())
      and link.status = 'verified'
  );
$$;

create function private.is_guardian_of_class(p_school_id uuid, p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.enrollments as enrollment
    where enrollment.school_id = p_school_id
      and enrollment.class_id = p_class_id
      and enrollment.status = 'accepted'
      and private.is_guardian_of_student(enrollment.student_id)
  );
$$;

revoke all on function private.has_school_role(uuid, public.school_role[]) from public, anon;
revoke all on function private.is_guardian_of_student(uuid) from public, anon;
revoke all on function private.is_guardian_of_school(uuid) from public, anon;
revoke all on function private.is_guardian_of_class(uuid, uuid) from public, anon;
grant execute on function private.has_school_role(uuid, public.school_role[]) to authenticated;
grant execute on function private.is_guardian_of_student(uuid) to authenticated;
grant execute on function private.is_guardian_of_school(uuid) to authenticated;
grant execute on function private.is_guardian_of_class(uuid, uuid) to authenticated;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger enrollments_set_updated_at
  before update on public.enrollments
  for each row execute procedure public.set_updated_at();

alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.school_memberships enable row level security;
alter table public.academic_years enable row level security;
alter table public.school_classes enable row level security;
alter table public.guardians enable row level security;
alter table public.students enable row level security;
alter table public.guardian_student_links enable row level security;
alter table public.enrollments enable row level security;
alter table public.fee_categories enable row level security;
alter table public.fee_configurations enable row level security;
alter table public.payment_plans enable row level security;
alter table public.payment_plan_installments enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.payment_refunds enable row level security;
alter table public.receipt_counters enable row level security;
alter table public.receipts enable row level security;
alter table public.payment_events enable row level security;
alter table public.audit_events enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_recipients enable row level security;
alter table public.notification_deliveries enable row level security;

grant select on all tables in schema public to authenticated;
alter default privileges in schema public grant select on tables to authenticated;

create policy "Members can read their school"
  on public.schools for select to authenticated
  using (private.has_school_role(id, null));
create policy "Owners can update their school"
  on public.schools for update to authenticated
  using (private.has_school_role(id, array['owner']::public.school_role[]))
  with check (private.has_school_role(id, array['owner']::public.school_role[]));

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
grant update (full_name, phone) on public.profiles to authenticated;

create policy "Members can read school memberships"
  on public.school_memberships for select to authenticated
  using (user_id = (select auth.uid()) or private.has_school_role(school_id, null));

create policy "School staff can read academic years"
  on public.academic_years for select to authenticated
  using (
    private.has_school_role(school_id, null)
    or private.is_guardian_of_school(school_id)
  );
create policy "School leaders can manage academic years"
  on public.academic_years for all to authenticated
  using (private.has_school_role(school_id, array['owner', 'director']::public.school_role[]))
  with check (private.has_school_role(school_id, array['owner', 'director']::public.school_role[]));

create policy "School staff and linked guardians can read classes"
  on public.school_classes for select to authenticated
  using (
    private.has_school_role(school_id, null)
    or private.is_guardian_of_class(school_id, id)
  );
create policy "School leaders can manage classes"
  on public.school_classes for all to authenticated
  using (private.has_school_role(school_id, array['owner', 'director']::public.school_role[]))
  with check (private.has_school_role(school_id, array['owner', 'director']::public.school_role[]));

create policy "Guardians are visible to their school and themselves"
  on public.guardians for select to authenticated
  using (
    user_id = (select auth.uid())
    or private.has_school_role(school_id, array['owner', 'director', 'accountant']::public.school_role[])
  );
create policy "School leaders can manage guardians"
  on public.guardians for all to authenticated
  using (private.has_school_role(school_id, array['owner', 'director']::public.school_role[]))
  with check (private.has_school_role(school_id, array['owner', 'director']::public.school_role[]));

create policy "School staff and linked guardians can read students"
  on public.students for select to authenticated
  using (
    private.has_school_role(school_id, null)
    or private.is_guardian_of_student(id)
  );
create policy "School leaders can manage students"
  on public.students for all to authenticated
  using (private.has_school_role(school_id, array['owner', 'director']::public.school_role[]))
  with check (private.has_school_role(school_id, array['owner', 'director']::public.school_role[]));

create policy "Related users can read guardian links"
  on public.guardian_student_links for select to authenticated
  using (
    private.has_school_role(school_id, array['owner', 'director', 'accountant']::public.school_role[])
    or exists (
      select 1 from public.guardians as guardian
      where guardian.id = guardian_id
        and guardian.user_id = (select auth.uid())
    )
  );
create policy "School leaders can manage guardian links"
  on public.guardian_student_links for all to authenticated
  using (private.has_school_role(school_id, array['owner', 'director']::public.school_role[]))
  with check (private.has_school_role(school_id, array['owner', 'director']::public.school_role[]));

create policy "School staff and linked guardians can read enrollments"
  on public.enrollments for select to authenticated
  using (
    private.has_school_role(school_id, null)
    or private.is_guardian_of_student(student_id)
  );
create policy "School leaders can manage enrollments"
  on public.enrollments for all to authenticated
  using (private.has_school_role(school_id, array['owner', 'director']::public.school_role[]))
  with check (private.has_school_role(school_id, array['owner', 'director']::public.school_role[]));

create policy "School staff and guardians can read fee categories"
  on public.fee_categories for select to authenticated
  using (
    private.has_school_role(school_id, null)
    or private.is_guardian_of_school(school_id)
  );
create policy "School leaders can manage fee categories"
  on public.fee_categories for all to authenticated
  using (private.has_school_role(school_id, array['owner', 'director', 'accountant']::public.school_role[]))
  with check (private.has_school_role(school_id, array['owner', 'director', 'accountant']::public.school_role[]));

create policy "Related users can read fee configurations"
  on public.fee_configurations for select to authenticated
  using (
    private.has_school_role(school_id, null)
    or private.is_guardian_of_class(school_id, class_id)
  );
create policy "School leaders can manage fee configurations"
  on public.fee_configurations for all to authenticated
  using (private.has_school_role(school_id, array['owner', 'director', 'accountant']::public.school_role[]))
  with check (private.has_school_role(school_id, array['owner', 'director', 'accountant']::public.school_role[]));

create policy "Related users can read payment plans"
  on public.payment_plans for select to authenticated
  using (
    private.has_school_role(school_id, null)
    or private.is_guardian_of_class(school_id, class_id)
  );
create policy "School leaders can manage payment plans"
  on public.payment_plans for all to authenticated
  using (private.has_school_role(school_id, array['owner', 'director', 'accountant']::public.school_role[]))
  with check (private.has_school_role(school_id, array['owner', 'director', 'accountant']::public.school_role[]));

create policy "Related users can read plan installments"
  on public.payment_plan_installments for select to authenticated
  using (
    private.has_school_role(school_id, null)
    or exists (
      select 1 from public.payment_plans as plan
      where plan.id = public.payment_plan_installments.plan_id
        and plan.school_id = public.payment_plan_installments.school_id
        and private.is_guardian_of_class(plan.school_id, plan.class_id)
    )
  );
create policy "School leaders can manage plan installments"
  on public.payment_plan_installments for all to authenticated
  using (private.has_school_role(school_id, array['owner', 'director', 'accountant']::public.school_role[]))
  with check (private.has_school_role(school_id, array['owner', 'director', 'accountant']::public.school_role[]));

create policy "Related users can read invoices"
  on public.invoices for select to authenticated
  using (
    private.has_school_role(school_id, null)
    or exists (
      select 1 from public.enrollments as enrollment
      where enrollment.id = public.invoices.enrollment_id
        and enrollment.school_id = public.invoices.school_id
        and enrollment.status = 'accepted'
        and private.is_guardian_of_student(enrollment.student_id)
    )
  );
create policy "School leaders can manage invoices"
  on public.invoices for all to authenticated
  using (private.has_school_role(school_id, array['owner', 'director', 'accountant']::public.school_role[]))
  with check (private.has_school_role(school_id, array['owner', 'director', 'accountant']::public.school_role[]));

create policy "Related users can read payments"
  on public.payments for select to authenticated
  using (
    private.has_school_role(school_id, null)
    or exists (
      select 1
      from public.invoices as invoice
      join public.enrollments as enrollment
        on enrollment.id = invoice.enrollment_id
       and enrollment.school_id = invoice.school_id
       and enrollment.status = 'accepted'
      where invoice.id = public.payments.invoice_id
        and invoice.school_id = public.payments.school_id
        and private.is_guardian_of_student(enrollment.student_id)
    )
  );

create policy "School leaders can read payment refunds"
  on public.payment_refunds for select to authenticated
  using (private.has_school_role(school_id, array['owner', 'director', 'accountant']::public.school_role[]));

create policy "School staff can read receipt counters"
  on public.receipt_counters for select to authenticated
  using (private.has_school_role(school_id, null));

create policy "Related users can read receipts"
  on public.receipts for select to authenticated
  using (
    private.has_school_role(school_id, null)
    or exists (
      select 1
      from public.payments as payment
      join public.invoices as invoice
        on invoice.id = payment.invoice_id
       and invoice.school_id = payment.school_id
      join public.enrollments as enrollment
        on enrollment.id = invoice.enrollment_id
       and enrollment.school_id = invoice.school_id
       and enrollment.status = 'accepted'
      where payment.id = public.receipts.payment_id
        and payment.school_id = public.receipts.school_id
        and private.is_guardian_of_student(enrollment.student_id)
    )
  );

create policy "School leaders can read payment events"
  on public.payment_events for select to authenticated
  using (private.has_school_role(school_id, array['owner', 'director', 'accountant']::public.school_role[]));
create policy "School leaders can read audit events"
  on public.audit_events for select to authenticated
  using (private.has_school_role(school_id, array['owner', 'director']::public.school_role[]));

create policy "School staff can read notifications"
  on public.notifications for select to authenticated
  using (
    private.has_school_role(school_id, null)
    or exists (
      select 1
      from public.notification_recipients as recipient
      where recipient.notification_id = public.notifications.id
        and recipient.school_id = public.notifications.school_id
        and recipient.user_id = (select auth.uid())
    )
  );
create policy "Recipients can read their notifications"
  on public.notification_recipients for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Recipients can mark their notifications as read"
  on public.notification_recipients for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
grant update (read_at) on public.notification_recipients to authenticated;
create policy "School leaders can read notification deliveries"
  on public.notification_deliveries for select to authenticated
  using (private.has_school_role(school_id, array['owner', 'director']::public.school_role[]));

create function public.prevent_payment_rewrite()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Payment records cannot be deleted';
  end if;

  if row(
    new.id,
    new.school_id,
    new.invoice_id,
    new.amount,
    new.currency,
    new.method,
    new.provider_reference,
    new.idempotency_key,
    new.note,
    new.created_by,
    new.created_at
  ) is distinct from row(
    old.id,
    old.school_id,
    old.invoice_id,
    old.amount,
    old.currency,
    old.method,
    old.provider_reference,
    old.idempotency_key,
    old.note,
    old.created_by,
    old.created_at
  ) then
    raise exception 'Payment details are immutable';
  end if;

  if old.confirmed_at is not null and new.confirmed_at is distinct from old.confirmed_at then
    raise exception 'Payment confirmation timestamp is immutable';
  end if;

  if not (
    old.status = new.status
    or (old.status = 'pending' and new.status in ('confirmed', 'failed', 'cancelled'))
    or (old.status = 'confirmed' and new.status = 'refund_pending')
    or (old.status = 'refund_pending' and new.status in ('partially_refunded', 'refunded'))
    or (old.status = 'partially_refunded' and new.status in ('refund_pending', 'refunded'))
  ) then
    raise exception 'Invalid payment status transition: % -> %', old.status, new.status;
  end if;

  return new;
end;
$$;

create trigger payments_prevent_rewrite
  before update or delete on public.payments
  for each row execute procedure public.prevent_payment_rewrite();

create function public.guard_payment_refund()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_payment public.payments%rowtype;
  v_reserved_amount bigint;
begin
  if tg_op = 'DELETE' then
    raise exception 'Refund records cannot be deleted';
  end if;

  if tg_op = 'UPDATE' then
    if row(
      new.id,
      new.school_id,
      new.payment_id,
      new.amount,
      new.reason,
      new.idempotency_key,
      new.requested_by,
      new.requested_at
    ) is distinct from row(
      old.id,
      old.school_id,
      old.payment_id,
      old.amount,
      old.reason,
      old.idempotency_key,
      old.requested_by,
      old.requested_at
    ) then
      raise exception 'Refund details are immutable';
    end if;

    if new.provider_reference is distinct from old.provider_reference
      and not (
        old.status = 'requested'
        and new.status = 'pending'
        and old.provider_reference is null
      ) then
      raise exception 'Refund provider reference can only be set when processing starts';
    end if;

    if new.decided_by is distinct from old.decided_by
      and not (
        old.status in ('requested', 'pending')
        and new.status in ('pending', 'confirmed', 'failed', 'cancelled')
      ) then
      raise exception 'Refund decision actor cannot be changed after a final status';
    end if;

    if old.completed_at is not null and new.completed_at is distinct from old.completed_at then
      raise exception 'Refund completion timestamp is immutable';
    end if;

    if not (
      old.status = new.status
      or (old.status = 'requested' and new.status in ('pending', 'cancelled'))
      or (old.status = 'pending' and new.status in ('confirmed', 'failed', 'cancelled'))
    ) then
      raise exception 'Invalid refund status transition: % -> %', old.status, new.status;
    end if;
  end if;

  select * into v_payment
  from public.payments
  where id = new.payment_id
    and school_id = new.school_id
  for update;

  if not found
    or v_payment.status not in ('confirmed', 'refund_pending', 'partially_refunded') then
    raise exception 'Only a confirmed payment can be refunded';
  end if;

  select coalesce(sum(refund.amount), 0) into v_reserved_amount
  from public.payment_refunds as refund
  where refund.payment_id = new.payment_id
    and refund.status in ('requested', 'pending', 'confirmed')
    and (tg_op = 'INSERT' or refund.id <> new.id);

  if v_reserved_amount + new.amount > v_payment.amount then
    raise exception 'Refunds exceed the original payment amount';
  end if;

  return new;
end;
$$;

create trigger payment_refunds_guard
  before insert or update or delete on public.payment_refunds
  for each row execute procedure public.guard_payment_refund();

create function public.prevent_append_only_rewrite()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception '% records cannot be changed or deleted', tg_table_name;
end;
$$;

create trigger receipts_prevent_rewrite
  before update or delete on public.receipts
  for each row execute procedure public.prevent_append_only_rewrite();
create trigger payment_events_prevent_rewrite
  before update or delete on public.payment_events
  for each row execute procedure public.prevent_append_only_rewrite();
create trigger audit_events_prevent_rewrite
  before update or delete on public.audit_events
  for each row execute procedure public.prevent_append_only_rewrite();

create function public.validate_receipt_payment()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.payments as payment
    join public.invoices as invoice
      on invoice.id = payment.invoice_id
     and invoice.school_id = payment.school_id
    join public.enrollments as enrollment
      on enrollment.id = invoice.enrollment_id
     and enrollment.school_id = invoice.school_id
    join public.students as student
      on student.id = enrollment.student_id
     and student.school_id = enrollment.school_id
    join public.schools as school
      on school.id = payment.school_id
    join public.academic_years as year
      on year.id = invoice.academic_year_id
     and year.school_id = invoice.school_id
    where payment.id = new.payment_id
      and payment.school_id = new.school_id
      and invoice.academic_year_id = new.academic_year_id
      and payment.status = 'confirmed'
      and payment.confirmed_at = new.payment_confirmed_at
      and payment.amount = new.amount
      and payment.currency = new.currency
      and payment.method = new.payment_method
      and payment.provider_reference is not distinct from new.provider_reference
      and school.name = new.school_name
      and year.label = new.academic_year_label
      and student.full_name = new.student_name
      and student.admission_number = new.admission_number
      and invoice.invoice_number = new.invoice_number
  ) then
    raise exception 'Receipt details must match a confirmed payment';
  end if;

  return new;
end;
$$;

create trigger receipts_validate_payment
  before insert on public.receipts
  for each row execute procedure public.validate_receipt_payment();

create function public.record_manual_payment(
  p_invoice_id uuid,
  p_amount bigint,
  p_method public.payment_method,
  p_idempotency_key uuid,
  p_external_reference text default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invoice public.invoices%rowtype;
  v_payment_id uuid;
  v_receipt_number bigint;
  v_receipt_code text;
  v_paid_amount bigint;
  v_school_slug text;
  v_year_label text;
  v_school_name text;
  v_student_name text;
  v_admission_number text;
  v_existing public.payments%rowtype;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if p_amount is null
    or p_amount <= 0
    or p_idempotency_key is null
    or p_method is null
    or p_method = 'fedapay' then
    raise exception 'Invalid manual payment details';
  end if;

  select * into v_invoice
  from public.invoices
  where id = p_invoice_id
  for update;
  if not found or v_invoice.status = 'cancelled' then
    raise exception 'Invoice not found or cancelled';
  end if;

  if not private.has_school_role(
    v_invoice.school_id,
    array['owner', 'director', 'accountant', 'cashier']::public.school_role[]
  ) then
    raise exception 'Not authorized to record payments for this school';
  end if;

  if not exists (
    select 1
    from public.enrollments as enrollment
    where enrollment.id = v_invoice.enrollment_id
      and enrollment.school_id = v_invoice.school_id
      and enrollment.status = 'accepted'
  ) then
    raise exception 'Payment requires an accepted enrollment';
  end if;

  select * into v_existing
  from public.payments
  where idempotency_key = p_idempotency_key;
  if found then
    if v_existing.school_id <> v_invoice.school_id
      or v_existing.invoice_id <> p_invoice_id
      or v_existing.amount <> p_amount
      or v_existing.method <> p_method
      or v_existing.provider_reference is distinct from nullif(trim(p_external_reference), '')
      or v_existing.note is distinct from nullif(trim(p_note), '') then
      raise exception 'Idempotency key has already been used for a different payment';
    end if;
    return v_existing.id;
  end if;

  select coalesce(
    sum(payment.amount - coalesce(refunds.confirmed_amount, 0)),
    0
  ) into v_paid_amount
  from public.payments as payment
  left join lateral (
    select sum(refund.amount) as confirmed_amount
    from public.payment_refunds as refund
    where refund.payment_id = payment.id
      and refund.status = 'confirmed'
  ) as refunds on true
  where payment.invoice_id = v_invoice.id
    and payment.status in ('confirmed', 'refund_pending', 'partially_refunded');

  if p_amount > v_invoice.total_amount - v_paid_amount then
    raise exception 'Payment exceeds the outstanding invoice balance';
  end if;

  insert into public.payments (
    school_id,
    invoice_id,
    amount,
    currency,
    method,
    status,
    provider_reference,
    idempotency_key,
    note,
    created_by,
    confirmed_at
  )
  values (
    v_invoice.school_id,
    v_invoice.id,
    p_amount,
    v_invoice.currency,
    p_method,
    'confirmed',
    nullif(trim(p_external_reference), ''),
    p_idempotency_key,
    nullif(trim(p_note), ''),
    (select auth.uid()),
    now()
  )
  on conflict (idempotency_key) do nothing
  returning id into v_payment_id;

  if v_payment_id is null then
    select * into v_existing
    from public.payments
    where idempotency_key = p_idempotency_key;

    if not found
      or v_existing.school_id <> v_invoice.school_id
      or v_existing.invoice_id <> p_invoice_id
      or v_existing.amount <> p_amount
      or v_existing.method <> p_method
      or v_existing.provider_reference is distinct from nullif(trim(p_external_reference), '')
      or v_existing.note is distinct from nullif(trim(p_note), '') then
      raise exception 'Idempotency key has already been used for a different payment';
    end if;

    return v_existing.id;
  end if;

  insert into public.payment_events (school_id, payment_id, event_type, actor_id)
  values (v_invoice.school_id, v_payment_id, 'manual_payment_confirmed', (select auth.uid()));

  select school.slug, school.name, year.label, student.full_name, student.admission_number
  into v_school_slug, v_school_name, v_year_label, v_student_name, v_admission_number
  from public.schools as school
  join public.academic_years as year
    on year.id = v_invoice.academic_year_id
   and year.school_id = school.id
  join public.enrollments as enrollment
    on enrollment.id = v_invoice.enrollment_id
   and enrollment.school_id = school.id
  join public.students as student
    on student.id = enrollment.student_id
   and student.school_id = school.id
  where school.id = v_invoice.school_id;

  insert into public.receipt_counters (school_id, academic_year_id, last_number)
  values (v_invoice.school_id, v_invoice.academic_year_id, 1)
  on conflict (school_id, academic_year_id)
  do update set last_number = public.receipt_counters.last_number + 1
  returning last_number into v_receipt_number;

  v_receipt_code :=
    upper(left(regexp_replace(v_school_slug, '[^a-zA-Z0-9]', '', 'g'), 5))
    || '-' || regexp_replace(v_year_label, '[^0-9]', '', 'g')
    || '-' || lpad(
      v_receipt_number::text,
      greatest(6, length(v_receipt_number::text)),
      '0'
    );

  insert into public.receipts (
    school_id,
    payment_id,
    academic_year_id,
    receipt_number,
    school_name,
    academic_year_label,
    student_name,
    admission_number,
    invoice_number,
    amount,
    currency,
    payment_method,
    provider_reference,
    payment_confirmed_at
  )
  values (
    v_invoice.school_id,
    v_payment_id,
    v_invoice.academic_year_id,
    v_receipt_code,
    v_school_name,
    v_year_label,
    v_student_name,
    v_admission_number,
    v_invoice.invoice_number,
    p_amount,
    v_invoice.currency,
    p_method,
    nullif(trim(p_external_reference), ''),
    now()
  );

  if v_paid_amount + p_amount = v_invoice.total_amount then
    update public.invoices set status = 'settled' where id = v_invoice.id;
  end if;

  insert into public.audit_events (
    school_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    details
  )
  values (
    v_invoice.school_id,
    (select auth.uid()),
    'payment.recorded',
    'payment',
    v_payment_id,
    jsonb_build_object('method', p_method, 'amount', p_amount, 'currency', v_invoice.currency)
  );

  return v_payment_id;
end;
$$;

revoke all on function public.record_manual_payment(uuid, bigint, public.payment_method, uuid, text, text) from public, anon;
grant execute on function public.record_manual_payment(uuid, bigint, public.payment_method, uuid, text, text) to authenticated;
