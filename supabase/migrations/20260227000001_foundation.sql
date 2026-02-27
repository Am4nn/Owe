-- =============================================================
-- NEXUS — FOUNDATION SCHEMA
-- Migration: 20260227000001_foundation.sql
-- Phase 1: All tables, RLS policies, and triggers
--
-- RULES (enforced here, cannot be changed retroactively):
-- 1. Monetary amounts stored as INTEGER cents (never FLOAT)
-- 2. RLS enabled on every table immediately after CREATE TABLE
-- 3. version column on all mutable records
-- 4. fx_rate_at_creation on expenses (historical snapshot)
-- 5. idempotency_key on expenses and settlements
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- PROFILES (extends auth.users — one row per registered user)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  avatar_url    TEXT,
  push_token    TEXT,         -- Expo push token; updated on each app launch (Phase 3)
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "users_can_read_own_profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_can_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Group members can read each other's profiles (needed to display names in group views)
CREATE POLICY "group_members_can_read_profiles"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT gm.user_id
      FROM public.group_members gm
      WHERE gm.group_id IN (
        SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
      )
      AND gm.user_id IS NOT NULL
    )
  );

-- Auto-create profile on auth.users INSERT
-- SECURITY DEFINER required to write to public.profiles from auth schema trigger
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'display_name'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- GROUPS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  base_currency TEXT NOT NULL DEFAULT 'USD',
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  version       INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Members can read groups they belong to
CREATE POLICY "members_can_read_groups"
  ON public.groups FOR SELECT
  USING (
    id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Members can update groups they belong to (admin check enforced in app layer for now)
CREATE POLICY "members_can_update_groups"
  ON public.groups FOR UPDATE
  USING (
    id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Any authenticated user can create a group (they auto-join as admin in the same operation)
CREATE POLICY "authenticated_can_create_groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────
-- GROUP MEMBERS
-- NULL user_id = named-only (non-app) member (GRUP-03)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.group_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,  -- NULL = named-only member
  display_name  TEXT NOT NULL,   -- For named-only: the name given; for real users: mirrors profile.display_name
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_user_per_group UNIQUE (group_id, user_id)
);
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Members can see all members of groups they belong to
CREATE POLICY "members_can_read_group_members"
  ON public.group_members FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Group admins can add new members; users can add themselves (on invite acceptance)
CREATE POLICY "admins_can_insert_members"
  ON public.group_members FOR INSERT
  WITH CHECK (
    -- Group admin adding someone
    group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    -- OR the user is adding themselves (accepting an invite)
    OR user_id = auth.uid()
  );

-- Users can remove themselves (leave group — GRUP-05)
CREATE POLICY "members_can_delete_own_membership"
  ON public.group_members FOR DELETE
  USING (user_id = auth.uid());

-- Admins can remove other members
CREATE POLICY "admins_can_delete_members"
  ON public.group_members FOR DELETE
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────
-- GROUP INVITES (GRUP-02: invite by email)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.group_invites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  invited_email   TEXT NOT NULL,
  invited_by      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  accepted_at     TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days') NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_pending_invite UNIQUE (group_id, invited_email)
);
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;

-- Group members can see invites for their groups; invited users can see their own invites
CREATE POLICY "members_and_invitees_can_read_invites"
  ON public.group_invites FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
    OR invited_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Group members can create invites for their groups
CREATE POLICY "members_can_create_invites"
  ON public.group_invites FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
    AND invited_by = auth.uid()
  );

-- ─────────────────────────────────────────────────────────────
-- EXPENSES
-- Schema defined here in Phase 1; feature work in Phase 2.
-- Columns that CANNOT be added retroactively without data migration:
--   amount_cents (integer cents — never float)
--   fx_rate_at_creation (historical rate snapshot)
--   idempotency_key (prevents duplicate on retry)
--   version (optimistic concurrency for offline sync)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.expenses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id            UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  created_by          UUID NOT NULL REFERENCES public.profiles(id),
  description         TEXT NOT NULL CHECK (char_length(description) >= 1),
  amount_cents        INTEGER NOT NULL CHECK (amount_cents > 0),   -- INTEGER cents only. NEVER float. $47.99 = 4799
  currency            TEXT NOT NULL DEFAULT 'USD',
  base_currency       TEXT NOT NULL,                              -- Group's base currency at time of creation
  fx_rate_at_creation NUMERIC(12, 6) NOT NULL DEFAULT 1.000000,  -- Historical rate snapshot. NEVER updated after insert.
  amount_base_cents   INTEGER NOT NULL,                           -- amount_cents * fx_rate_at_creation, computed at insert
  split_type          TEXT NOT NULL DEFAULT 'equal'
                        CHECK (split_type IN ('equal', 'exact', 'percentage', 'shares')),
  payer_id            UUID REFERENCES public.group_members(id),
  expense_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  category            TEXT,                                       -- Optional category tag
  idempotency_key     UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,  -- Prevents duplicate expense on network retry
  version             INTEGER NOT NULL DEFAULT 1,
  deleted_at          TIMESTAMPTZ,                               -- Soft delete (audit trail)
  created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_can_read_expenses"
  ON public.expenses FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "members_can_insert_expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Only the creator can update their own expenses
CREATE POLICY "creators_can_update_expenses"
  ON public.expenses FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- EXPENSE SPLITS (schema-only in Phase 1)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.expense_splits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id    UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES public.group_members(id),
  amount_cents  INTEGER NOT NULL CHECK (amount_cents >= 0),  -- Integer cents only
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_can_read_splits"
  ON public.expense_splits FOR SELECT
  USING (
    expense_id IN (
      SELECT e.id FROM public.expenses e
      WHERE e.group_id IN (
        SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "members_can_insert_splits"
  ON public.expense_splits FOR INSERT
  WITH CHECK (
    expense_id IN (
      SELECT e.id FROM public.expenses e
      WHERE e.group_id IN (
        SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
      )
    )
  );

-- ─────────────────────────────────────────────────────────────
-- SETTLEMENTS (schema-only in Phase 1)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.settlements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  payer_id        UUID NOT NULL REFERENCES public.group_members(id),
  payee_id        UUID NOT NULL REFERENCES public.group_members(id),
  amount_cents    INTEGER NOT NULL CHECK (amount_cents > 0),  -- Integer cents only
  currency        TEXT NOT NULL,
  idempotency_key UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  version         INTEGER NOT NULL DEFAULT 1,
  settled_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT different_payer_payee CHECK (payer_id <> payee_id)
);
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_can_read_settlements"
  ON public.settlements FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "members_can_insert_settlements"
  ON public.settlements FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- INDEXES (performance — added here to avoid ALTER TABLE later)
-- ─────────────────────────────────────────────────────────────
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_expenses_group_id ON public.expenses(group_id);
CREATE INDEX idx_expenses_created_by ON public.expenses(created_by);
CREATE INDEX idx_expenses_expense_date ON public.expenses(expense_date DESC);
CREATE INDEX idx_expense_splits_expense_id ON public.expense_splits(expense_id);
CREATE INDEX idx_settlements_group_id ON public.settlements(group_id);
CREATE INDEX idx_group_invites_invited_email ON public.group_invites(invited_email);
