## 1. Command Catalog Infrastructure

- [x] 1.1 Create `src/providers/hermes/commands/HermesCommandCatalog.ts` implementing `ProviderCommandCatalog` — lightweight catalog that stores ACP runtime commands in memory, maps `SlashCommand` to `ProviderCommandEntry` with `kind: 'command'`, `scope: 'runtime'`, `displayPrefix: '/'`, `insertPrefix: '/'`. Vault methods are no-ops. `getDropdownConfig()` returns `triggerChars: ['/']`, all prefixes `'/'`.
- [x] 1.2 Register `commandCatalog` in `HermesWorkspaceServices` — instantiate `HermesCommandCatalog` in `createHermesWorkspaceServices()` and include it in the returned services object
- [x] 1.3 Write unit tests for `HermesCommandCatalog` — verify `setRuntimeCommands` → `listDropdownEntries` round-trip, dropdown config format, vault no-ops, and that all ACP commands are included without filtering
- [x] 1.4 Verify command flow end-to-end — run `npm run typecheck && npm run lint && npm run test && npm run build` to confirm no regressions

## 2. Profile Setting & Persistence

- [x] 2.1 Add `profile: string` to `PersistedHermesProviderSettings` in `src/providers/hermes/settings.ts` — include in defaults (empty string), normalization, `getHermesProviderSettings()`, and `updateHermesProviderSettings()`
- [x] 2.2 Write unit tests for profile setting persistence — verify default is empty, normalize handles missing/null, update saves correctly, get retrieves correctly

## 3. Profile Selector UI

- [x] 3.1 Add profile selector to `HermesSettingsTab.ts` — render a text input in the Setup section (after CLI path) for the profile name. On change, persist via `updateHermesProviderSettings({ profile: value })`
- [x] 3.2 Write unit tests for profile setting UI rendering — verify the input appears, reflects current setting, and saves on change

## 4. Runtime Profile Integration

- [x] 4.1 Modify `HermesChatRuntime.startProcess()` to read `profile` from settings and append `['--profile', profile]` to the `args` array when profile is non-empty
- [x] 4.2 Write unit tests for runtime profile arg construction — verify no `--profile` when empty, correct `--profile <name>` when set
- [x] 4.3 Run full validation — `npm run typecheck && npm run lint && npm run test && npm run build`
