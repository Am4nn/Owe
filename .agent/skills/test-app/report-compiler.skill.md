---
name: report-compiler
description: Generates final structured QA report.
---

# Report Compiler

Generate:

TEST_EXECUTION_SUMMARY_<timestamp>.md

Include:

## Environment
## Test Plan Overview
## Specification Compliance Report
## Regression Analysis
## Performance Metrics
## Functional Results
## Architectural Observations
## Performance Bottlenecks
## Security Concerns
## UX Observations
## Refactor Recommendations
## Final Summary

After generating:

STOP and ask:

"Would you like me to implement:
1. All fixes
2. Only critical fixes
3. Only regressions
4. Specific issue IDs
5. None"