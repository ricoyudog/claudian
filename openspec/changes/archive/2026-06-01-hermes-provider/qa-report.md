# QA Report

## Session Metadata

| Field | Value |
|-------|-------|
| Session ID | QA-hermes-provider-20260601-001 |
| Tester | Human (manual) + Agent (automated) |
| Date | 2026-06-01 |
| Build / Commit | d717339 (pre-merge) |
| Change | hermes-provider |
| Risk Level | MEDIUM |

## Charter

Verify that Hermes Agent (Nous Research) integrates correctly as a Claudian chat provider via ACP protocol, including settings UI, chat runtime, tool display, permissions, cancellation, and history hydration.

## Human Test Case Results

| # | Scenario | Expected | Actual | Status | Evidence |
|---|----------|----------|--------|--------|----------|
| 1 | Plugin loads without crash | Plugin loads, no console errors | Plugin loaded cleanly | PASS | Manual test in Obsidian |
| 2 | Hermes tab in settings | "Hermes" tab visible in provider tabs | Tab visible | PASS | Manual test in Obsidian |
| 3 | Hermes disabled by default | Enable toggle is OFF | Toggle OFF | PASS | Manual test in Obsidian |
| 4 | Enable Hermes | Setting saves successfully | Saved and persisted | PASS | Manual test in Obsidian |
| 5 | Hermes in provider selector | Hermes/models listed in dropdown | Hermes appeared in selector | PASS | Manual test in Obsidian |
| 6 | Send message and get reply | Streaming reply from Hermes | Successfully received streaming reply via ACP | PASS | Manual test in Obsidian |
| 7 | Tool call display | Tool use/result displayed correctly | Tool calls rendered correctly | PASS | Manual test: "列出當前目錄的檔案" |
| 8 | Permission approval | Approval UI shown for dangerous ops | Approval flow worked correctly | PASS | Manual test: "rm -rf /tmp/test_hermes_qa" |
| 9 | Cancel turn | Reply stops, UI recovers | Cancel worked, UI returned to input state | PASS | Manual test: mid-stream cancel |
| 10 | History reload | Message history displays after reopen | All messages preserved correctly | PASS | Manual test: close + reopen tab |

## Smoke Test Results

| Check | Status | Notes |
|-------|--------|-------|
| Typecheck passes | PASS | `npx tsc --noEmit` — 0 errors |
| Lint passes | PASS | 0 errors (6 sentence-case warnings for proper nouns) |
| Tests pass | PASS | 240 suites, 5675 tests — all green |
| Build succeeds | PASS | main.js + styles.css built |

## Bug Reports

### BUG-001: `--cwd` flag not supported by Hermes ACP

- **Severity**: blocker (fixed during QA)
- **Steps to reproduce**: Launch Hermes provider, send message → "Error: JSON-RPC input closed"
- **Root cause**: `HermesChatRuntime.ts` passed `--cwd=<path>` as CLI arg to `hermes acp`, but Hermes ACP does not accept this flag (it's an OpenCode-specific flag). The `cwd` is correctly passed via ACP `session/new` params instead.
- **Fix**: Removed `--cwd=${params.cwd}` from subprocess args in `startProcess()`. Rebuilt and verified working.
- **Evidence**: `hermes acp --help` shows no `--cwd` option; `hermes acp --cwd=...` returns exit code 2.

## QA Conclusion

| Field | Value |
|-------|-------|
| Status | PASSED |
| Blocking Bugs | 0 (1 found and fixed during QA) |
| Archive Recommendation | PROCEED |
| Notes | All 10 manual test cases passed. 1 blocker bug (incorrect CLI arg) found and fixed during QA session. Automated smoke gate (typecheck + lint + 5675 tests + build) all pass. |

## Evidence Inventory

| # | Type | Path / URL | Referenced In |
|---|------|-----------|---------------|
| 1 | Build output | main.js, styles.css, manifest.json | Smoke Test |
| 2 | Bug fix diff | HermesChatRuntime.ts line 471 | BUG-001 |
| 3 | Manual test | 10 cases executed by user in Obsidian | Human Test Cases |
