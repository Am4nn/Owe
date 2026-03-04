# Future Scaling Recommendations

**Created:** 2026-03-04
**Applies to:** Owe app (Expo + Supabase + React Query)

---

## 1. Balance Summary: Supabase RPC Approach

### Current Implementation (Phase 8)
Client-side batch: 3 Supabase queries (memberships + all splits + all settlements), then compute nets in JavaScript.

**Works well for:** <10K rows per user, <50 groups.

### When to Upgrade
Switch to an RPC when:
- Users have **100+ groups** or **100K+ expense rows**
- Dashboard load time exceeds **500ms** on 3G mobile
- Supabase plan usage shows high egress from large batch fetches

### RPC Implementation

```sql
-- Migration: create_get_balance_summary_rpc.sql
CREATE OR REPLACE FUNCTION get_balance_summary(p_user_id uuid)
RETURNS TABLE(total_owed_cents bigint, total_owing_cents bigint)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_owed bigint := 0;
  v_owing bigint := 0;
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT gm.id AS member_id, gm.group_id
    FROM group_members gm
    WHERE gm.user_id = p_user_id
  LOOP
    -- Compute net for this group
    DECLARE
      v_net bigint := 0;
      v_paid bigint;
      v_split bigint;
      v_settlements_paid bigint;
      v_settlements_received bigint;
    BEGIN
      -- Amount paid by user (they're the payer on expenses)
      SELECT COALESCE(SUM(es.amount_cents), 0) INTO v_paid
      FROM expense_splits es
      JOIN expenses e ON e.id = es.expense_id
      WHERE e.payer_id = rec.member_id
        AND e.group_id = rec.group_id
        AND e.deleted_at IS NULL;

      -- Amount owed by user (their split share)
      SELECT COALESCE(SUM(es.amount_cents), 0) INTO v_split
      FROM expense_splits es
      JOIN expenses e ON e.id = es.expense_id
      WHERE es.member_id = rec.member_id
        AND e.group_id = rec.group_id
        AND e.deleted_at IS NULL;

      -- Settlements paid by user
      SELECT COALESCE(SUM(amount_cents), 0) INTO v_settlements_paid
      FROM settlements
      WHERE payer_id = rec.member_id AND group_id = rec.group_id;

      -- Settlements received by user
      SELECT COALESCE(SUM(amount_cents), 0) INTO v_settlements_received
      FROM settlements
      WHERE payee_id = rec.member_id AND group_id = rec.group_id;

      v_net := (v_paid - v_split) + (v_settlements_paid - v_settlements_received);

      IF v_net > 0 THEN v_owed := v_owed + v_net;
      ELSIF v_net < 0 THEN v_owing := v_owing + ABS(v_net);
      END IF;
    END;
  END LOOP;

  RETURN QUERY SELECT v_owed, v_owing;
END;
$$;
```

### Client-side usage
```ts
// Replace useBalanceSummary queryFn with:
const { data } = await supabase.rpc('get_balance_summary', { p_user_id: userId })
// Returns: { total_owed_cents, total_owing_cents }
```

### Tradeoffs
| | Client-side Batch (current) | Supabase RPC |
|---|---|---|
| Queries | 3 | 1 |
| Data transfer | All splits + settlements | 2 integers |
| Computation | Client (JS) | Server (Postgres) |
| Debugging | Easy (TypeScript) | Harder (SQL) |
| Caching | React Query reuses data | Dedicated cache only |
| Scale ceiling | ~10K rows | Millions |

---

## 2. Other Scaling Considerations (Future)

### Query Pagination
Currently `useExpenses` and `useActivityFeed` fetch all rows. At scale:
- Add `.range(0, 49)` to Supabase queries
- Use `useInfiniteQuery` instead of `useQuery`
- Already available in React Query — pattern exists in community

### Realtime Channel Limits
`useRealtimeExpenseSync` subscribes to one channel per group detail screen. At scale:
- Supabase has a 100 concurrent channel limit on free tier
- Consider multiplexing: single channel per user with server-side filtering

### Offline Queue Growth
The mutation queue persists to MMKV/localStorage. At scale with poor connectivity:
- Add queue size limits (drop oldest mutations after 100)
- Add queue age limits (discard mutations older than 7 days)
- Show user a "pending changes" indicator

---

*Last updated: 2026-03-04*
