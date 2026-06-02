# QA Test Cases — hermes-command-catalog-and-profile-selector

| # | Scenario | Input / Action | Expected Output | Assigned Atom | Priority |
|---|----------|----------------|-----------------|---------------|----------|
| 1 | Build passes | `npm run typecheck && npm run lint && npm run test && npm run build` | All 4 commands exit 0 | qa-smoke | P1 |
| 2 | Hermes settings tab renders profile input | Render HermesSettingsTab with `profile: 'my-profile'` | Text input visible showing 'my-profile' | qa-ui | P1 |
| 3 | Profile input persists on change | Change input to 'new-profile' | `updateHermesProviderSettings({ profile: 'new-profile' })` called | qa-ui | P1 |
| 4 | Command catalog round-trips ACP commands | `setRuntimeCommands([cmd1, cmd2])` then `listDropdownEntries()` | Returns 2 entries with correct mapping | qa-backend | P1 |
| 5 | Command catalog vault methods are no-ops | Call `listVaultEntries()`, `saveVaultEntry()`, `deleteVaultEntry()` | All return empty/null without error | qa-backend | P2 |
| 6 | Runtime appends `--profile` when non-empty | Set `profile: 'agent-x'`, call `startProcess()` | Args include `['--profile', 'agent-x']` | qa-backend | P1 |
| 7 | Runtime omits `--profile` when empty | Set `profile: ''`, call `startProcess()` | Args are `['acp']` with no `--profile` | qa-backend | P1 |
| 8 | Settings defaults profile to empty string | New settings object | `profile === ''` | qa-backend | P2 |
| 9 | Exploratory: no regressions in existing Hermes flow | Start Hermes session, send message | Session starts, streams response normally | qa-exploratory | P2 |
