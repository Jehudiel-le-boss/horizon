alter policy "Members can read their school"
  on public.schools
  using (
    private.has_school_role(id, null)
    or private.is_guardian_of_school(id)
  );
