## ADDED Requirements

### Requirement: Profile setting is persisted

A `profile` field SHALL be added to `PersistedHermesProviderSettings` to store the selected Hermes agent profile name. When empty, no profile flag is passed to the CLI.

#### Scenario: Default profile is empty
- **WHEN** no profile has been configured
- **THEN** `getHermesProviderSettings(settings).profile` returns an empty string

#### Scenario: Profile is saved and loaded
- **WHEN** a user selects profile `my-agent` in settings
- **THEN** the profile is persisted via `updateHermesProviderSettings(settings, { profile: 'my-agent' })`
- **AND** subsequent calls to `getHermesProviderSettings(settings).profile` return `'my-agent'`

### Requirement: Profile is passed to Hermes subprocess

When a profile is configured, the `HermesChatRuntime` SHALL pass `--profile <name>` as an additional argument when spawning `hermes acp`.

#### Scenario: No profile configured
- **WHEN** `profile` is empty in settings
- **THEN** the subprocess is spawned with `args: ['acp']` (no `--profile` flag)

#### Scenario: Profile configured
- **WHEN** `profile` is set to `'my-agent'` in settings
- **THEN** the subprocess is spawned with `args: ['acp', '--profile', 'my-agent']`

### Requirement: Profile selector appears in settings UI

The Hermes settings tab SHALL render a profile selector in the Setup section, below the CLI path setting. The selector SHALL allow the user to choose from available profiles or enter a custom profile name.

#### Scenario: Profile selector renders
- **WHEN** the Hermes settings tab is opened
- **THEN** a profile selector appears in the Setup section showing the current profile (or empty if none selected)

#### Scenario: Profile can be changed
- **WHEN** the user selects a different profile
- **THEN** the setting is saved immediately and the current profile display updates

### Requirement: Available profiles are discoverable

The Hermes settings tab SHALL attempt to discover available profiles from the Hermes CLI. If profile discovery fails or the CLI is unavailable, the user SHALL be able to manually enter a profile name.

#### Scenario: CLI reports available profiles
- **WHEN** the Hermes CLI is installed and `hermes profile list` (or equivalent) returns profiles
- **THEN** the selector shows the discovered profiles as selectable options

#### Scenario: CLI unavailable or reports no profiles
- **WHEN** the Hermes CLI cannot be found or returns no profiles
- **THEN** the selector still allows free-text input of a profile name
