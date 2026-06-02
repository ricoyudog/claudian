import type {
	ProviderCommandCatalog,
	ProviderCommandDropdownConfig,
} from '../../../core/providers/commands/ProviderCommandCatalog';
import type { ProviderCommandEntry } from '../../../core/providers/commands/ProviderCommandEntry';
import type { SlashCommand } from '../../../core/types';

function slashCommandToEntry(cmd: SlashCommand): ProviderCommandEntry {
	return {
		id: cmd.id,
		providerId: 'hermes',
		kind: 'command',
		name: cmd.name,
		description: cmd.description,
		content: cmd.content,
		argumentHint: cmd.argumentHint,
		allowedTools: cmd.allowedTools,
		model: cmd.model,
		disableModelInvocation: cmd.disableModelInvocation,
		userInvocable: cmd.userInvocable,
		context: cmd.context,
		agent: cmd.agent,
		hooks: cmd.hooks,
		scope: cmd.source === 'sdk' ? 'runtime' : 'vault',
		source: cmd.source ?? 'user',
		isEditable: cmd.source !== 'sdk',
		isDeletable: cmd.source !== 'sdk',
		displayPrefix: '/',
		insertPrefix: '/',
	};
}

export class HermesCommandCatalog implements ProviderCommandCatalog {
	private sdkCommands: SlashCommand[] = [];

	setRuntimeCommands(commands: SlashCommand[]): void {
		this.sdkCommands = commands;
	}

	async listDropdownEntries(_context: { includeBuiltIns: boolean }): Promise<ProviderCommandEntry[]> {
		return this.sdkCommands.map(slashCommandToEntry);
	}

	async listVaultEntries(): Promise<ProviderCommandEntry[]> {
		return [];
	}

	async saveVaultEntry(_entry: ProviderCommandEntry): Promise<void> {
		// Hermes has no vault command persistence
	}

	async deleteVaultEntry(_entry: ProviderCommandEntry): Promise<void> {
		// Hermes has no vault command persistence
	}

	getDropdownConfig(): ProviderCommandDropdownConfig {
		return {
			providerId: 'hermes',
			triggerChars: ['/'],
			builtInPrefix: '/',
			skillPrefix: '/',
			commandPrefix: '/',
		};
	}

	async refresh(): Promise<void> {
		// Commands refresh via setRuntimeCommands from ACP notifications
	}
}
