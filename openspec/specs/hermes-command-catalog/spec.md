## ADDED Requirements

### Requirement: Hermes command catalog registers with workspace services

The Hermes provider SHALL register a `HermesCommandCatalog` implementing `ProviderCommandCatalog` in its `HermesWorkspaceServices`, so that `ProviderWorkspaceRegistry.getCommandCatalog('hermes')` returns a valid catalog.

#### Scenario: Catalog available after workspace initialization
- **WHEN** the Hermes workspace services are initialized
- **THEN** `ProviderWorkspaceRegistry.getCommandCatalog('hermes')` returns a non-null `ProviderCommandCatalog` instance

### Requirement: Runtime ACP commands are surfaced in the dropdown

The `HermesCommandCatalog` SHALL receive ACP runtime-discovered commands via `setRuntimeCommands()` and convert them to `ProviderCommandEntry` values that appear in the slash command dropdown.

#### Scenario: ACP commands appear in dropdown after session start
- **WHEN** a Hermes runtime receives an ACP `available_commands_update` notification with commands
- **AND** `TabManager.getSdkCommands()` retrieves those commands and calls `catalog.setRuntimeCommands()`
- **THEN** the commands appear in the chat slash command dropdown with name, description, and `/` prefix

#### Scenario: Dropdown is empty before session starts
- **WHEN** no Hermes runtime has sent commands yet
- **THEN** `listDropdownEntries()` returns an empty array (no stale or placeholder commands)

### Requirement: Command entries use correct format

Each command entry from ACP SHALL be mapped to a `ProviderCommandEntry` with `kind: 'command'`, `scope: 'runtime'`, `displayPrefix: '/'`, `insertPrefix: '/'`, and the command name stripped of any leading `/`.

#### Scenario: Command entry format matches dropdown expectations
- **WHEN** an ACP command with `name: 'search'` and `description: 'Search files'` is processed
- **THEN** the resulting `ProviderCommandEntry` has `name: 'search'`, `kind: 'command'`, `scope: 'runtime'`, `displayPrefix: '/'`, `insertPrefix: '/'`

### Requirement: Dropdown config provides trigger characters

The `HermesCommandCatalog` SHALL return a `ProviderCommandDropdownConfig` with `triggerChars: ['/']` and appropriate prefix values.

#### Scenario: Dropdown config enables slash trigger
- **WHEN** `getDropdownConfig()` is called on `HermesCommandCatalog`
- **THEN** it returns a config with `providerId: 'hermes'`, `triggerChars: ['/']`, `builtInPrefix: '/'`, `skillPrefix: '/'`, `commandPrefix: '/'`

### Requirement: Vault command persistence is supported

The `HermesCommandCatalog` SHALL support `listVaultEntries()`, `saveVaultEntry()`, and `deleteVaultEntry()` as no-ops (returning empty arrays and performing no writes), since Hermes does not have vault-persisted commands. The `refresh()` method SHALL be a no-op.

#### Scenario: Vault operations do not error
- **WHEN** `listVaultEntries()`, `saveVaultEntry(entry)`, or `deleteVaultEntry(entry)` is called
- **THEN** no error is thrown; list operations return empty arrays

### Requirement: Command catalog does not duplicate or hide commands

The catalog SHALL NOT filter or hide ACP-discovered commands. All commands reported by the runtime SHALL be included in `listDropdownEntries()`. Unlike Claude, Hermes has no built-in hidden commands.

#### Scenario: All ACP commands are visible
- **WHEN** the runtime reports three commands: `search`, `analyze`, `debug`
- **THEN** `listDropdownEntries({ includeBuiltIns: true })` returns all three entries
- **AND** `listDropdownEntries({ includeBuiltIns: false })` also returns all three entries
