---
name: spec-analyser
description: Converts TEST_SPEC.md into structured testable requirements.
---

# Spec Analyser

.planning/TEST_SPEC.md is authoritative.

If conflict exists:
TEST_SPEC.md overrides planning docs.

Responsibilities:

- Parse TEST_SPEC.md
- Extract:
  - Requirements
  - Preconditions
  - Expected behaviors
  - Validation rules
  - Error cases
  - Edge cases

Generate:

SPEC_COVERAGE_MAP

Mark each requirement:

- IMPLEMENTED
- PARTIAL
- NOT IMPLEMENTED
- INCORRECT

Output:
SPEC_ANALYSIS_REPORT