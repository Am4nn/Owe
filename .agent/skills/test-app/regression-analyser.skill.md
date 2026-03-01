---
name: regression-analyser
description: Detects regressions and recurring issues across test runs.
---

# Regression Analyser

ALWAYS ENABLED.

Search root for:

TEST_EXECUTION_SUMMARY_*.md

Parse:

- Previous failures
- Issue IDs
- Root causes
- Past performance metrics

Classify current issues:

- NEW
- REGRESSION
- RECURRING
- RESOLVED

Compare:

- Failure count trends
- Severity trends
- Performance trends

Output:

REGRESSION_REPORT