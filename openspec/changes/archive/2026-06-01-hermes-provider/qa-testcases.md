# QA Test Cases — hermes-provider

## Risk Assessment

- Overall: MEDIUM
- Factors: New (first Hermes provider), Complex (ACP subprocess, JSON-RPC), Changed (shared registration)
- Recommended depth: STANDARD

## Change Classification

- Type: Mixed (UI + Backend)
- Atom sequence: qa-smoke → qa-ui → qa-exploratory
- Risk-adjusted exploratory time: 15 minutes

## Test Cases

| # | Scenario | Input / Action | Expected Output | Assigned Atom | Priority |
|---|----------|----------------|-----------------|---------------|----------|
| 1 | Plugin loads without crash | Build and reload plugin in Obsidian | Plugin loads, no console errors | qa-smoke | P1 |
| 2 | Hermes tab in settings | Open Claudian Settings | "Hermes" tab visible | qa-ui | P1 |
| 3 | Hermes disabled by default | View Hermes settings tab | Enable toggle is OFF | qa-ui | P1 |
| 4 | Enable Hermes | Toggle Enable ON | Setting saves successfully | qa-ui | P1 |
| 5 | Hermes in provider selector | New chat tab, open provider/model selector | Hermes and its models listed | qa-ui | P1 |
| 6 | Send message and get reply | Select Hermes, send "Hello" | Streaming reply received | qa-exploratory | P1 |
| 7 | Tool call display | Ask Hermes to perform a tool-using task | Tool use/result displayed correctly | qa-exploratory | P2 |
| 8 | Permission approval | Trigger operation requiring approval | Approval UI shown with options | qa-exploratory | P2 |
| 9 | Cancel turn | Send message, then press cancel | Reply stops, UI recovers | qa-exploratory | P2 |
| 10 | History reload | Close and reopen Hermes conversation | Message history displays correctly | qa-exploratory | P2 |
