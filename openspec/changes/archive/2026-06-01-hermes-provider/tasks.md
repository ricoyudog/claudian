## 1. Foundation

- [ ] 1.1 Create `src/providers/hermes/` directory structure: `runtime/`, `auxiliary/`, `history/`, `env/`, `ui/`, `app/`
- [ ] 1.2 Create `src/providers/hermes/types.ts` — define `HermesProviderState` interface with `sessionId`, `sessionFile`, `forkSource` fields, plus helper functions `getHermesProviderState()` and `setHermesProviderState()`
- [ ] 1.3 Create `src/providers/hermes/settings.ts` — define `PersistedHermesProviderSettings` interface, `DEFAULT_HERMES_PROVIDER_SETTINGS` (enabled: false), `getHermesProviderSettings()`, `updateHermesProviderSettings()`
- [ ] 1.4 Create `src/providers/hermes/capabilities.ts` — export `HERMES_PROVIDER_CAPABILITIES` constant with all capability flags
- [ ] 1.5 Create `src/providers/hermes/models.ts` — model ID helpers, `HERMES_MODEL_PREFIX` constant, model format parsing for `provider/model` slash notation

## 2. Runtime Core

- [ ] 2.1 Create `src/providers/hermes/runtime/HermesCliResolver.ts` — resolve `hermes` binary path from settings, `PATH`, and common install locations (`~/.local/bin/hermes`, `~/.hermes/hermes-agent/.venv/bin/hermes`)
- [ ] 2.2 Create `src/providers/hermes/runtime/HermesAuxQueryRunner.ts` — extends shared AuxQueryRunner pattern; spawns lightweight `hermes acp` subprocess for single-turn queries (title gen, inline edit, instruction refine)
- [ ] 2.3 Create `src/providers/hermes/runtime/HermesChatRuntime.ts` — implements `ChatRuntime` by wrapping `AcpClientConnection` from shared ACP infrastructure; delegates `query()` to ACP `session/prompt`, maps `session/update` notifications to `StreamChunk` via `AcpSessionUpdateNormalizer`, handles `session/cancel`, `session/new`, `session/load`, permission requests, and file system delegation

## 3. Auxiliary Services

- [ ] 3.1 Create `src/providers/hermes/auxiliary/HermesTitleGenerationService.ts` — extends `QueryBackedTitleGenerationService` with `HermesAuxQueryRunner`
- [ ] 3.2 Create `src/providers/hermes/auxiliary/HermesInlineEditService.ts` — extends `QueryBackedInlineEditService` with `HermesAuxQueryRunner`
- [ ] 3.3 Create `src/providers/hermes/auxiliary/HermesInstructionRefineService.ts` — extends `QueryBackedInstructionRefineService` with `HermesAuxQueryRunner`
- [ ] 3.4 Create `src/providers/hermes/auxiliary/HermesTaskResultInterpreter.ts` — stub implementation (all methods return null/false/fallback)

## 4. History & Environment

- [ ] 4.1 Create `src/providers/hermes/history/HermesHistoryStore.ts` — SQLite query layer for `~/.hermes/state.db`; query sessions and messages tables, normalize Hermes message format to Claudian `ChatMessage[]`
- [ ] 4.2 Create `src/providers/hermes/history/HermesConversationHistoryService.ts` — implements `ProviderConversationHistoryService`; delegates to `HermesHistoryStore` for hydration, stubs `deleteConversationSession`, `isPendingForkConversation`, `buildForkProviderState`
- [ ] 4.3 Create `src/providers/hermes/env/HermesSettingsReconciler.ts` — implements `ProviderSettingsReconciler`; handles CLI path changes, environment hash tracking, model reconciliation

## 5. UI & Registration

- [ ] 5.1 Create `src/providers/hermes/ui/HermesChatUIConfig.ts` — implements `ProviderChatUIConfig`; provides model options from discovered models, `ownsModel()` checking, context window sizes, reasoning options
- [ ] 5.2 Create `src/providers/hermes/ui/HermesSettingsTab.ts` — implements `ProviderSettingsTabRenderer`; renders enable toggle, CLI path input, model selection, install instructions
- [ ] 5.3 Create `src/providers/hermes/app/HermesWorkspaceServices.ts` — implements `ProviderWorkspaceRegistration`; provides `cliResolver`, `settingsTabRenderer`, minimal workspace services
- [ ] 5.4 Create `src/providers/hermes/registration.ts` — exports `hermesProviderRegistration: ProviderRegistration` wiring all components together
- [ ] 5.5 Wire into `src/providers/index.ts` — import and register Hermes provider and workspace services
- [ ] 5.6 Wire into `src/providers/defaultProviderConfigs.ts` — add `hermes: { ...DEFAULT_HERMES_PROVIDER_SETTINGS }`

## 6. Validation

- [ ] 6.1 Create `tests/unit/providers/hermes/HermesChatRuntime.test.ts` — test ACP session lifecycle, message normalization, cancel behavior
- [ ] 6.2 Create `tests/unit/providers/hermes/HermesHistoryStore.test.ts` — test SQLite query normalization with mock data
- [ ] 6.3 Create `tests/unit/providers/hermes/HermesSettingsReconciler.test.ts` — test environment change detection
- [ ] 6.4 Run `npm run typecheck && npm run lint && npm run test && npm run build` — verify no regressions
