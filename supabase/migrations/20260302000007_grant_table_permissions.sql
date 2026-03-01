-- Grant table-level permissions to authenticated and anon roles.
-- RLS policies alone are not sufficient — PostgreSQL requires an explicit GRANT
-- at the table level before row-level policies are even evaluated.
-- Without these grants every query returns: 42501 permission denied for table X

-- Schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- profiles
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- groups
GRANT SELECT, INSERT, UPDATE, DELETE ON public.groups TO authenticated;

-- group_members
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_members TO authenticated;

-- group_invites
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_invites TO authenticated;

-- expenses
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;

-- expense_splits
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_splits TO authenticated;

-- settlements
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settlements TO authenticated;

-- activities
GRANT SELECT, INSERT ON public.activities TO authenticated;

-- expense_comments
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_comments TO authenticated;

-- expense_reactions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_reactions TO authenticated;

-- fx_rates (read-only for clients; written by Edge Function via service_role)
GRANT SELECT ON public.fx_rates TO authenticated, anon;

-- reminder_config
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_config TO authenticated;

-- Sequences (needed for any serial/bigserial columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
