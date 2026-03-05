---
name: spec-analyser
description: Converts TEST_SPEC.md into structured testable requirements.
---

# Spec Analyser

The dynamically provided TEST_SPEC.md (passed via prompt or context) is authoritative.

If conflict exists:
The provided TEST_SPEC.md overrides planning docs.

Responsibilities:

- Parse the provided TEST_SPEC.md
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
