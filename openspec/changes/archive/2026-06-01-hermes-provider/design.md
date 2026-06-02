## Context

Claudian is a multi-provider Obsidian plugin. It currently supports Claude, Codex, Pi, and OpenCode as chat providers. Each provider implements a standard set of contracts (`ChatRuntime`, `ProviderCapabilities`, `ProviderConversationHistoryService`, etc.) and registers through `ProviderRegistry` and `ProviderWorkspaceRegistry`.

The OpenCode provider already uses ACP (Agent Client Protocol) via a shared infrastructure layer at `src/providers/acp/` that includes `AcpSubprocess`, `AcpJsonRpcTransport`, `AcpClientConnection`, and `AcpSessionUpdateNormalizer`. This layer handles JSON-RPC 2.0 over stdio, session lifecycle, notification streaming, permission requests, file system delegation, and terminal delegation.

Hermes Agent (Nous Research) supports ACP natively via `hermes acp`. Its ACP implementation speaks the same JSON-RPC 2.0 protocol with identical method names (`initialize`, `session/new`, `session/prompt`, `session/cancel`, etc.). This means we can reuse the entire shared ACP infrastructure.

Full research is documented at `wiki/research/hermes-provider-integration.md`.

## Goals / Non-Goals

**Goals:**
- Register Hermes as a first-class Claudian provider with full send/stream/cancel/tool/permission support
- Reuse shared ACP infrastructure to minimize new code
- Support history hydration from Hermes's SQLite session store
- Provide model selection from Hermes's multi-provider routing
- Deliver settings UI for configuration
- Support auxiliary services (title gen, inline edit, instruction refine)

**Non-Goals:**
- Rewind support (Hermes uses `/undo`, not the rewind pattern Claudian expects)
- MCP server management through Claudian's UI (Hermes manages its own MCP servers)
- Hermes gateway/API server integration (out of scope for v1; ACP is sufficient)
- Self-learning skill display or skill management UI
- Cron scheduling or messaging bridge features
- Subagent lifecycle adapter (deferred to Phase 2)

## Unknowns & Investigation

- **ACP compatibility with Hermes**: Investigated by reading Hermes ACP documentation and comparing method names with Claudian's shared ACP layer. **Conclusion**: All method names match exactly. No overrides needed. The shared infrastructure should work out of the box.
- **Hermes ACP event shapes**: Investigated by reading the ACP spec (agentclientprotocol.com) and Hermes's `acp_adapter/events.py`. **Conclusion**: `session/update` notifications include `agent_message_chunk`, `tool_call`, `tool_call_update`, `plan` — these map cleanly to StreamChunk types.
- **Hermes SQLite schema stability**: Investigated by reading session research findings. **Conclusion**: Schema is at version 11. Tables `sessions` and `messages` have stable column names. We should read defensively and add version detection.
- **Hermes model ID format**: Investigated by reading config documentation. **Conclusion**: Models use `provider/model` format via aggregators (e.g., `anthropic/claude-opus-4.6`) or bare names for direct providers. Config at `~/.hermes/config.yaml` exposes `model.default` and `model.provider`.
- **`hermes acp` installation**: Investigated by reading quickstart docs. **Conclusion**: Requires `pip install -e '.[acp]'` extra. The CLI resolver must verify this is available before enabling the provider.

## Decisions

### 1. ACP over stdio as transport

**Decision**: Use ACP (JSON-RPC 2.0 over stdio) via the shared `src/providers/acp/` infrastructure, spawning `hermes acp` as a subprocess.

**Rationale**: The shared ACP layer already exists and handles all transport concerns (JSON-RPC framing, request correlation, notification dispatch, subprocess lifecycle). The OpenCode provider proves this pattern works. Hermes's ACP method names match exactly. This requires ~60% less code than an HTTP/SSE approach.

**Alternatives considered**:
- API Server (HTTP+SSE): More decoupled but requires writing an HTTP client, auth management, SSE parsing, and cannot reuse shared infrastructure. Estimated 2x more code.
- TUI Gateway JSON-RPC: More features but non-standard; would require a separate transport implementation.
- CLI one-shot (`hermes -z`): Has blocking bug (#30623) — crashes on non-TTY pipe.

### 2. SQLite for history hydration

**Decision**: Read conversation history directly from `~/.hermes/state.db` SQLite database.

**Rationale**: Direct filesystem access is simpler than routing through ACP `session/load` which replays history as notifications (designed for IDE resume, not bulk hydration). The SQLite schema is well-documented and stable.

**Alternatives considered**:
- ACP `session/load`: More robust but requires running Hermes process just to read history. Overkill for hydration.

### 3. Follow OpenCode provider pattern

**Decision**: Mirror the OpenCode provider's file structure, registration pattern, and runtime architecture.

**Rationale**: OpenCode also uses ACP via the shared infrastructure. By following the same pattern, we minimize design decisions and ensure consistency. The OpenCode provider has ~33 files; by reusing ACP more aggressively, we target ~16 files.

### 4. Stub TaskResultInterpreter

**Decision**: Implement `ProviderTaskResultInterpreter` as all no-ops (same as Pi and OpenCode).

**Rationale**: Hermes subagent delegation goes through the tool call mechanism, not through a separate launch marker system. The interpreter can be added in Phase 2 if needed.

## Risks / Trade-offs

- **[Hermes ACP protocol drift]** → Pin to ACP protocol version via `initialize` version negotiation. The shared ACP infrastructure already handles capability negotiation.
- **[SQLite schema changes]** → Read defensively with column detection. Add schema_version check and warn on unsupported versions.
- **[User must install Hermes separately]** → Clear setup instructions in settings tab. `isEnabled` checks CLI availability at startup.
- **[Subprocess lifecycle]** → Reuse `AcpSubprocess` which already handles SIGKILL timeout, stderr buffering, and graceful shutdown.
- **[Hermes model routing complexity]** → Start with reading `config.yaml` for model info. Runtime model discovery via ACP `setConfigOption` deferred to Phase 2.

## Data Model

### HermesProviderState (stored in Conversation.providerState)

```typescript
interface HermesProviderState {
  sessionId?: string;        // ACP session ID (e.g., "sess_abc123")
  sessionFile?: string;      // Session lineage key for fork tracking
  forkSource?: {
    sessionId: string;
    resumeAt: string;        // Message ID to resume from
  };
}
```

### PersistedHermesProviderSettings (stored in providerConfigs.hermes)

```typescript
interface PersistedHermesProviderSettings {
  cliPath: string;
  cliPathsByHost: Record<string, string>;
  enabled: boolean;
  environmentHash: string;
  environmentVariables: string;
  discoveredModels: HermesDiscoveredModel[];
  modelAliases: Record<string, string>;
  preferredThinkingByModel: Record<string, string>;
  visibleModels: string[];
  hermesHome?: string;
}
```

## API Contracts

Not applicable — no API surface changes in this change. The provider communicates with Hermes Agent via ACP (JSON-RPC over stdio), which is an internal transport, not a public API.

## Migration Plan

No migration needed. This is a purely additive change. Existing conversations and providers are unaffected. Hermes is disabled by default and only activates when the user explicitly enables it in settings.
