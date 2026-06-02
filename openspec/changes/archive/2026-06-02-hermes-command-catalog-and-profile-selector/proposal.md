## Why

Hermes provider is integrated and functional, but two gaps make it feel incomplete compared to Claude and Codex providers:

1. **Slash commands don't appear in the chat dropdown.** Hermes runtime receives ACP `available_commands_update` notifications and stores them in memory, but the provider has no `commandCatalog` registered in `ProviderWorkspaceRegistry`. Without a catalog, `TabManager.getSdkCommands()` can retrieve commands from the runtime but cannot push them into the dropdown infrastructure. The UI calls `resetSdkSkillsCache()` instead of populating commands.

2. **No way to select a Hermes agent profile.** Hermes CLI supports a `--profile` parameter for `hermes acp`, but the runtime always spawns with `args: ['acp']` and no profile flag. Users who have configured multiple Hermes agent profiles have no way to select between them from the Claudian UI.

## What Changes

- Add a `HermesCommandCatalog` implementing `ProviderCommandCatalog` that bridges ACP runtime-discovered commands to the chat UI slash command dropdown (mirrors `ClaudeCommandCatalog` pattern)
- Register `commandCatalog` in `HermesWorkspaceServices` so `TabManager` and `Tab` can discover and render Hermes commands
- Add `profile` to `PersistedHermesProviderSettings` with discovery, selection, and persistence in the Hermes settings tab
- Pass selected profile to `hermes acp --profile <name>` when spawning the Hermes subprocess

## Capabilities

### New Capabilities
- `hermes-command-catalog`: Bridges ACP runtime-discovered commands to the Claudian slash command dropdown, enabling Hermes users to see and invoke provider commands
- `hermes-profile-selector`: Discovers available Hermes agent profiles and allows selection from the settings UI, passing the selected profile to `hermes acp --profile`

### Modified Capabilities
_(none — these are new capabilities on a new provider)_

## Impact

- `src/providers/hermes/` — new `commands/HermesCommandCatalog.ts`, modified `app/HermesWorkspaceServices.ts`, modified `settings.ts`, modified `ui/HermesSettingsTab.ts`, modified `runtime/HermesChatRuntime.ts`
- `src/providers/hermes/types.ts` — `HermesProviderState` unchanged (profile is a setting, not per-conversation state)
- No cross-provider impact — changes are contained within the Hermes provider boundary

## GitHub Issue

https://github.com/ricoyudog/claudian/issues/1
