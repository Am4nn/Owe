---
name: context-analyser
description: Builds architectural and business context model.
---

# Context Analyser

Responsibilities:

- Read entire `.planning` folder
- Read:
  - .planning/TEST_SPEC.md
  - package.json
  - App entry point
  - Navigation structure
  - Auth hooks
  - Core feature modules
  - Supabase client config

Build structured CONTEXT_MAP including:

- Architecture overview
- Data models
- Navigation graph
- Supabase interaction patterns
- Async boundaries
- Business logic mapping

No human interaction allowed.

Output:
CONTEXT_MAP