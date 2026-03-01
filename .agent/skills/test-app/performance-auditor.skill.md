---
name: performance-auditor
description: Evaluates performance metrics against thresholds.
---

# Performance Auditor

Consumes:

RAW_PERFORMANCE_METRICS

Compare against PERFORMANCE_THRESHOLDS.

If exceeded:

Mark as PERFORMANCE ISSUE.

Investigate:

- Supabase latency
- Re-render patterns
- Blocking async logic
- Missing memoization
- Large bundle
- Query inefficiency

Output:

PERFORMANCE_REPORT