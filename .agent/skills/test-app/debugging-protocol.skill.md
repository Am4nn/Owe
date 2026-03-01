---
name: debugging-protocol
description: Performs root cause analysis and fix planning.
---

# Debugging Protocol

For each issue:

Identify:

- Failure type
- Feature
- Severity (Low/Medium/High/Critical)

Trace:

- Hooks
- State logic
- Supabase interactions
- Navigation stack

Cross-reference:

- .planning docs
- TEST_SPEC.md
- Architecture

Provide:

- Root cause
- Exact files
- Exact logic flaw
- Patch plan
- Risk analysis

Do NOT implement unless AUTO_IMPLEMENT_FIXES = true.

Output:

DEBUG_REPORT