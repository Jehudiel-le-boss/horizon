create unique index invoices_enrollment_school_unique
  on public.invoices (enrollment_id, school_id);

create unique index receipt_counters_year_school_unique
  on public.receipt_counters (academic_year_id, school_id);

create unique index receipts_payment_school_unique
  on public.receipts (payment_id, school_id);
