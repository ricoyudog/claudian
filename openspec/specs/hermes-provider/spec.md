## ADDED Requirements

### Requirement: Hermes provider registration
The system SHALL register `hermes` as a valid provider ID in `ProviderRegistry` and `ProviderWorkspaceRegistry`. The provider SHALL appear in Claudian's provider list when enabled in settings.

#### Scenario: Hermes appears as selectable provider
- **WHEN** user opens the model/provider selector in a new chat tab
- **AND** Hermes is enabled in provider settings
- **THEN** "Hermes" SHALL appear as an available provider with its configured models

#### Scenario: Hermes disabled by default
- **WHEN** Claudian is first installed or upgraded
- **THEN** Hermes provider SHALL be disabled (`enabled: false`) and SHALL NOT appear in provider selectors until the user explicitly enables it

### Requirement: Hermes chat runtime via ACP
The system SHALL implement `ChatRuntime` for Hermes using ACP protocol over stdio. The runtime SHALL spawn `hermes acp` as a subprocess and communicate via JSON-RPC 2.0, reusing the shared `src/providers/acp/` infrastructure (`AcpSubprocess`, `AcpJsonRpcTransport`, `AcpClientConnection`).

#### Scenario: Successful chat turn
- **WHEN** user sends a message in a Hermes-backed chat tab
- **THEN** the runtime SHALL send the message via ACP `session/prompt`
- **AND** SHALL yield normalized `StreamChunk` values as `agent_message_chunk` notifications arrive

#### Scenario: Streaming response with tool calls
- **WHEN** Hermes processes a prompt that requires tool use
- **THEN** the runtime SHALL emit `tool_use` StreamChunks when `tool_call` notifications arrive
- **AND** SHALL emit `tool_result` StreamChunks when `tool_call_update` (completed) notifications arrive
- **AND** SHALL emit `text` StreamChunks for `agent_message_chunk` notifications
- **AND** SHALL emit `done` StreamChunk when the prompt turn completes

#### Scenario: Cancel active turn
- **WHEN** user cancels an in-progress Hermes turn
- **THEN** the runtime SHALL send ACP `session/cancel` notification
- **AND** SHALL stop yielding StreamChunks

### Requirement: Hermes permission handling
The system SHALL handle `session/request_permission` ACP server requests by surfacing approval UI in the chat interface, matching Claudian's existing permission flow patterns.

#### Scenario: Dangerous command approval
- **WHEN** Hermes sends a `session/request_permission` request for a terminal command
- **THEN** Claudian SHALL display the approval UI with the tool title and permission options (allow once, allow always, deny)
- **AND** SHALL send the user's choice back via ACP `requestPermission` response

### Requirement: Hermes session management
The system SHALL create, load, and resume ACP sessions using `session/new`, `session/load`, and `session/resume` methods. Each Claudian conversation backed by Hermes SHALL have a corresponding ACP session.

#### Scenario: New conversation creates ACP session
- **WHEN** user starts a new Hermes conversation
- **THEN** the runtime SHALL call ACP `session/new` with the vault's working directory
- **AND** SHALL store the returned session ID in `Conversation.providerState`

#### Scenario: Resume existing conversation
- **WHEN** user opens an existing Hermes conversation
- **THEN** the runtime SHALL call ACP `session/load` with the stored session ID
- **AND** SHALL restore the conversation state

### Requirement: Hermes history hydration from SQLite
The system SHALL implement `ProviderConversationHistoryService` that reads conversation history from Hermes's SQLite database at `~/.hermes/state.db`. The service SHALL query the `sessions` and `messages` tables and map them to Claudian's `ChatMessage[]` format.

#### Scenario: Hydrate conversation from Hermes history
- **WHEN** Claudian loads a Hermes conversation that has no local messages
- **THEN** the history service SHALL query `state.db` for the session's messages
- **AND** SHALL normalize Hermes message format to `ChatMessage[]`
- **AND** SHALL populate `conversation.messages`

#### Scenario: Session not found
- **WHEN** the stored session ID does not exist in `state.db`
- **THEN** the history service SHALL return an empty messages array without error

### Requirement: Hermes model selection
The system SHALL implement `ProviderChatUIConfig` that provides model options derived from Hermes's configuration (`~/.hermes/config.yaml`) and runtime discovery. The UI config SHALL support Hermes's `provider/model` ID format.

#### Scenario: Display available models
- **WHEN** user opens the model selector in a Hermes tab
- **THEN** the selector SHALL show models from Hermes's configured provider (e.g., `anthropic/claude-opus-4.6`, `openrouter/anthropic/claude-sonnet-4`)

#### Scenario: Model ownership
- **WHEN** Claudian needs to route a model string to a provider
- **THEN** `ownsModel` SHALL return `true` for models matching Hermes's discovered model list

### Requirement: Hermes settings tab
The system SHALL provide a provider settings tab with controls for: enabling/disabling Hermes, configuring the `hermes` CLI path, and model selection preferences.

#### Scenario: Configure Hermes CLI path
- **WHEN** user sets a custom CLI path in the Hermes settings tab
- **THEN** the path SHALL be persisted in provider settings
- **AND** SHALL be used to resolve the `hermes` binary for subprocess spawning

### Requirement: Hermes auxiliary services
The system SHALL implement title generation, inline edit, and instruction refine services using `QueryBackedTitleGenerationService`, `QueryBackedInlineEditService`, and `QueryBackedInstructionRefineService` base classes, backed by a `HermesAuxQueryRunner` that spawns lightweight Hermes ACP subprocesses.

#### Scenario: Generate conversation title
- **WHEN** a Hermes conversation needs a title
- **THEN** the title service SHALL send a summarization prompt via `HermesAuxQueryRunner`
- **AND** SHALL return the generated title text

### Requirement: Hermes provider capabilities declaration
The system SHALL declare `ProviderCapabilities` for Hermes with: `supportsPersistentRuntime: true`, `supportsNativeHistory: true`, `supportsPlanMode: true`, `supportsFork: true`, `supportsProviderCommands: true`, `supportsImageAttachments: true`, `supportsInstructionMode: true`, `supportsMcpTools: true`, `supportsRewind: false`, `reasoningControl: 'effort'`.

#### Scenario: Capability-driven feature gates
- **WHEN** Claudian checks whether Hermes supports a feature (e.g., plan mode, fork)
- **THEN** the capabilities object SHALL accurately reflect Hermes's ACP-supported features
