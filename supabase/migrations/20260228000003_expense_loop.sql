-- Phase 2: activities, expense_comments, expense_reactions tables; is_direct column on groups

-- Add is_direct flag to groups for virtual 1-on-1 groups (EXPN-09)
ALTER TABLE public.groups ADD COLUMN is_direct BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- activities table: audit log of group events
-- ============================================================
CREATE TABLE public.activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  actor_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'expense_added',
    'expense_edited',
    'expense_deleted',
    'settlement_recorded',
    'comment_added',
    'reaction_added'
  )),
  expense_id  UUID REFERENCES public.expenses(id) ON DELETE SET NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ENABLE ROW LEVEL SECURITY ON public.activities;

-- SELECT: user must be a member of the activity's group
CREATE POLICY "activities_select_group_member"
  ON public.activities
  FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: user must be a member of the activity's group
CREATE POLICY "activities_insert_group_member"
  ON public.activities
  FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_activities_group_id ON public.activities (group_id);
CREATE INDEX idx_activities_created_at ON public.activities (created_at DESC);

-- ============================================================
-- expense_comments table
-- ============================================================
CREATE TABLE public.expense_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id  UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body        TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ENABLE ROW LEVEL SECURITY ON public.expense_comments;

-- SELECT: user must be a member of the expense's group
CREATE POLICY "expense_comments_select_group_member"
  ON public.expense_comments
  FOR SELECT
  USING (
    expense_id IN (
      SELECT e.id FROM public.expenses e
      JOIN public.group_members gm ON gm.group_id = e.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

-- INSERT: author_id must match current user and expense's group must be accessible
CREATE POLICY "expense_comments_insert_own"
  ON public.expense_comments
  FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND expense_id IN (
      SELECT e.id FROM public.expenses e
      JOIN public.group_members gm ON gm.group_id = e.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

CREATE INDEX idx_expense_comments_expense_id ON public.expense_comments (expense_id);

-- ============================================================
-- expense_reactions table
-- ============================================================
CREATE TABLE public.expense_reactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id  UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji       TEXT NOT NULL CHECK (char_length(emoji) <= 8),
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (expense_id, user_id)
);

ENABLE ROW LEVEL SECURITY ON public.expense_reactions;

-- SELECT: user must be a member of the expense's group
CREATE POLICY "expense_reactions_select_group_member"
  ON public.expense_reactions
  FOR SELECT
  USING (
    expense_id IN (
      SELECT e.id FROM public.expenses e
      JOIN public.group_members gm ON gm.group_id = e.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

-- INSERT: user_id must match current user and expense's group must be accessible
CREATE POLICY "expense_reactions_insert_own"
  ON public.expense_reactions
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND expense_id IN (
      SELECT e.id FROM public.expenses e
      JOIN public.group_members gm ON gm.group_id = e.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

-- DELETE: user may only delete their own reactions
CREATE POLICY "expense_reactions_delete_own"
  ON public.expense_reactions
  FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX idx_expense_reactions_expense_id ON public.expense_reactions (expense_id);
