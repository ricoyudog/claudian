## Why

Claudian supports Claude and Codex as chat providers, with Pi and OpenCode as additional options. Hermes Agent (Nous Research, ~106K GitHub stars) is a rapidly growing open-source AI agent with unique self-learning capabilities — it creates skills from experience, persists knowledge across sessions, and supports 30+ model backends. Adding Hermes as a provider gives Claudian users access to another powerful agent runtime, with the distinctive advantage of Hermes's built-in learning loop and multi-provider model routing.

## What Changes

- **New provider: `hermes`** — Registers Hermes Agent as a first-class Claudian provider alongside claude, codex, pi, and opencode
- **ACP transport** — Uses Hermes's native ACP (Agent Client Protocol) support via `hermes acp`, reusing Claudian's existing shared ACP infrastructure (`src/providers/acp/`). This follows the same pattern as the OpenCode provider
- **Session management** — Reads Hermes session history from its SQLite database (`~/.hermes/state.db`) for conversation hydration
- **Model routing** — Exposes Hermes's 30+ model backends (Anthropic, OpenRouter, Nous Portal, custom endpoints) through Claudian's model selector
- **Settings tab** — Provider-specific settings UI for enabling Hermes, configuring CLI path, and selecting models
- **Auxiliary services** — Title generation, inline edit, and instruction refine backed by Hermes via AuxQueryRunner

## Capabilities

### New Capabilities
- `hermes-provider`: A new Claudian chat provider that integrates Hermes Agent via ACP protocol over stdio. Covers runtime (send/stream/cancel), tool display, permission handling, history hydration from SQLite, model selection from Hermes's multi-provider routing, settings tab, and auxiliary services (title/inline-edit/instruction-refine).

### Modified Capabilities
- (none — this is a purely additive change)

## Impact

- **New code**: `src/providers/hermes/` (~16 files)
- **Registration**: `src/providers/index.ts` and `src/providers/defaultProviderConfigs.ts` receive new entries
- **No existing code modified**: Provider registration is additive; no changes to core, features, or other providers
- **Dependency**: Users must install Hermes Agent separately (`pip install hermes-agent` with `[acp]` extra)
- **Storage**: Reads from `~/.hermes/state.db` (SQLite) and `~/.hermes/config.yaml`; does not modify Hermes native data

## GitHub Issue

Parent issue: https://github.com/YishenTu/claudian/issues/718
