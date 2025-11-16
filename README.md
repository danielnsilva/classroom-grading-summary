# Classroom Grading Summary

[![GitHub release](https://img.shields.io/github/release/danielnsilva/classroom-grading-summary?style=for-the-badge)](https://github.com/danielnsilva/classroom-grading-summary/releases/latest)
[![GitHub marketplace](https://img.shields.io/badge/marketplace-classroom--grading--summary-green?style=for-the-badge)](https://github.com/marketplace/actions/classroom-grading-summary)
[![Codacy grade](https://img.shields.io/codacy/grade/1e83c760b1c242c3a3eaff9b1ee0cace?style=for-the-badge)](https://app.codacy.com/gh/danielnsilva/classroom-grading-summary/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy coverage](https://img.shields.io/codacy/coverage/1e83c760b1c242c3a3eaff9b1ee0cace?style=for-the-badge)](https://app.codacy.com/gh/danielnsilva/classroom-grading-summary/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)

Enhance your GitHub Classroom workflow by displaying test results and scores directly in feedback pull requests.

## Usage

```yaml
- name: Classroom Grading Summary
  uses: danielnsilva/classroom-grading-summary@v1
  env:
    TEST1_RESULTS: "${{steps.test1.outputs.result}}"
    TEST2_RESULTS: "${{steps.test2.outputs.result}}"
    TEST3_RESULTS: "${{steps.test3.outputs.result}}"
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    runners: test1,test2,test3
    update-comment: true
```

## Inputs

- `token`: GitHub token (default: `${{ github.token }}`)
- `runners`: Comma-separated list of step IDs (required)
- `update-comment`: Update existing comment (true) or create new comment (false) (default: `true`)

## Environment Variables

For each runner specified in the `runners` input, you must provide an environment variable with the pattern `{RUNNER_NAME}_RESULTS` containing the base64-encoded test results from the corresponding step output.

This follows the same pattern as the `autograding-grading-reporter` action.

Example: if `runners: test1,test2`, you need:

- `TEST1_RESULTS: "${{steps.test1.outputs.result}}"`
- `TEST2_RESULTS: "${{steps.test2.outputs.result}}"`

## Required Permissions

This action requires `pull-requests: write` permission to create/update comments in PRs.

## How it works

1. Captures test runner results
2. Generates markdown formatted report
3. Searches for open feedback PR
4. Updates or creates comment with report
5. If no feedback PR exists, skips silently

## Complete workflow example

```yaml
name: Autograding Tests
on:
  push:
  workflow_dispatch:

permissions:
  pull-requests: write
  contents: read

jobs:
  run-autograding-tests:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v5
      
    - name: Run tests
      id: test1
      uses: classroom-resources/autograding-command-grader@v1
      with:
        test-name: "Test 1"
        setup-command: ""
        command: "python test1.py"
        timeout: 10
        max-score: 10
        
    - name: Autograding Reporter
      uses: classroom-resources/autograding-grading-reporter@v1
      env:
        TEST1_RESULTS: "${{steps.test1.outputs.result}}"
      with:
        runners: test1
        
    - name: Classroom Grading Summary
      uses: danielnsilva/classroom-grading-summary@v1
      env:
        TEST1_RESULTS: "${{steps.test1.outputs.result}}"
      with:
        runners: test1
```
