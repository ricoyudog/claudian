## Context

The Hermes provider was recently integrated into Claudian. It uses the shared ACP (Agent Client Protocol) infrastructure over stdio, spawning `hermes acp` as a subprocess. Two functional gaps need to be closed:

1. **Command catalog missing**: The runtime receives ACP `available_commands_update` notifications and stores them, but no `commandCatalog` is registered in `ProviderWorkspaceRegistry`. The chat UI slash command dropdown shows nothing for Hermes.

2. **Profile selection missing**: Hermes CLI supports `--profile <name>` to select an agent profile, but the runtime always spawns `['acp']` with no profile flag, and the settings UI has no profile selector.

Reference implementations: `ClaudeCommandCatalog` (runtime + vault commands), `CodexSkillCatalog` (discovered skills with `$` prefix).

## Goals / Non-Goals

**Goals:**
- Surface ACP runtime-discovered commands in the Hermes chat slash command dropdown
- Allow users to select a Hermes agent profile from the settings UI
- Pass the selected profile to `hermes acp --profile <name>` when spawning

**Non-Goals:**
- Vault-persisted commands/skills for Hermes (Hermes does not have a vault command system)
- Profile management UI (creating, editing, or deleting profiles — defer to Hermes CLI)
- Per-conversation profile selection (profile is a global provider setting)
- Agent mention provider for Hermes (separate concern, out of scope)

## Unknowns & Investigation

### How does Hermes expose profiles via CLI?

**Unknown**: Does `hermes` have a `profile list` or similar subcommand? What is the exact CLI surface for profile discovery?

**Investigation**: Read `HermesCliResolver` and `HermesChatRuntime`. The runtime only uses `hermes acp` as the subcommand. The user confirmed `--profile` is a supported flag.

**Conclusion**: The profile flag is `--profile <name>` passed alongside `acp`. Profile discovery is uncertain — the settings UI should support both a dropdown (if discoverable) and free-text fallback. Discovery mechanism needs runtime verification (e.g., `hermes profile list` or config file parsing at `~/.hermes/config.yaml`). Given this uncertainty, the initial implementation will use a simple text input with optional dropdown enhancement later.

### Does ACP report commands with skill vs command distinction?

**Unknown**: Are all ACP commands `type: 'command'`, or is there a skill category?

**Investigation**: Read `AcpSessionUpdateNormalizer.mapAcpCommandToSlashCommand()` — all commands are mapped uniformly with `id: 'acp:<name>'`, `source: 'sdk'`. There is no skill/command distinction in ACP.

**Conclusion**: `HermesCommandCatalog` treats all ACP commands as `kind: 'command'` with `displayPrefix: '/'`.

## Decisions

### 1. Light catalog with no vault storage

**Decision**: `HermesCommandCatalog` will be a lightweight catalog that only bridges runtime-discovered ACP commands. It will NOT implement vault command persistence (no `SlashCommandStorage`, no `SkillStorage`). Vault methods (`listVaultEntries`, `saveVaultEntry`, `deleteVaultEntry`) will be no-ops.

**Rationale**: Hermes does not have a vault command/skill filesystem like Claude (`.claude/commands/`, `.claude/skills/`) or Codex (`.codex/skills/`). ACP commands are runtime-only. Adding vault infrastructure would be speculative.

### 2. Profile as a simple text setting

**Decision**: Profile will be stored as a `string` field in `PersistedHermesProviderSettings`. The settings UI will render a text input with a dropdown suggestion list if profiles can be discovered; otherwise it falls back to free-text.

**Rationale**: Keeps the implementation simple. Profile discovery from the CLI is uncertain, so the text input ensures functionality regardless of CLI capabilities.

### 3. Profile passed as CLI argument, not environment variable

**Decision**: The profile is passed as `--profile <name>` in the subprocess args, not as a `HERMES_PROFILE` environment variable.

**Rationale**: The user confirmed the CLI uses `--profile` as a flag. This is consistent with how the runtime already constructs args (`['acp']`).

### 4. No runtime restart trigger on profile change

**Decision**: Changing the profile setting does NOT automatically restart a running Hermes session. The profile takes effect on the next session start.

**Rationale**: Hermes uses a persistent runtime model. Restarting on settings change would disrupt active conversations. Users can manually reload if needed.

## Risks / Trade-offs

- **[Profile discovery may not work]** → Mitigation: Use text input as the primary input method. Dropdown suggestions are a best-effort enhancement.
- **[Command format differences between Hermes versions]** → Mitigation: The ACP normalizer already abstracts command mapping. `HermesCommandCatalog` receives normalized `SlashCommand[]` and does not parse raw ACP data.
- **[No filtering or hiding of commands]** → Unlike Claude which hides built-in commands, Hermes commands are all user-facing. If Hermes later adds internal commands, a filter can be added.

## Data Model

### `PersistedHermesProviderSettings` — new field

```typescript
interface PersistedHermesProviderSettings {
  // ... existing fields ...
  profile: string;  // NEW — Hermes agent profile name, empty = no profile
}
```

Default: `''` (empty string).

### `HermesCommandCatalog` — runtime state

```typescript
class HermesCommandCatalog implements ProviderCommandCatalog {
  private sdkCommands: SlashCommand[] = [];
  // No persistent storage — commands come from ACP runtime only
}
```

### No new entities

No new config files, database tables, or storage adapters are introduced.

## API Contracts

Not applicable — no API surface changes in this change. All changes are internal to the Hermes provider and its workspace services.
