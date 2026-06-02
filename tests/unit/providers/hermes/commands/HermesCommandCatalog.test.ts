import type { SlashCommand } from '@/core/types';
import { HermesCommandCatalog } from '@/providers/hermes/commands/HermesCommandCatalog';

describe('HermesCommandCatalog', () => {
	describe('listDropdownEntries', () => {
		it('returns SDK runtime commands as ProviderCommandEntry', async () => {
			const catalog = new HermesCommandCatalog();

			const sdkCommands: SlashCommand[] = [
				{ id: 'acp:search', name: 'search', description: 'Search files', content: '', source: 'sdk' },
				{ id: 'acp:analyze', name: 'analyze', description: 'Analyze code', content: '', source: 'sdk' },
			];
			catalog.setRuntimeCommands(sdkCommands);

			const entries = await catalog.listDropdownEntries({ includeBuiltIns: false });

			expect(entries).toHaveLength(2);

			const searchEntry = entries.find(e => e.name === 'search');
			expect(searchEntry).toBeDefined();
			expect(searchEntry!.providerId).toBe('hermes');
			expect(searchEntry!.kind).toBe('command');
			expect(searchEntry!.scope).toBe('runtime');
			expect(searchEntry!.source).toBe('sdk');
			expect(searchEntry!.isEditable).toBe(false);
			expect(searchEntry!.isDeletable).toBe(false);
			expect(searchEntry!.displayPrefix).toBe('/');
			expect(searchEntry!.insertPrefix).toBe('/');
		});

		it('returns empty when no runtime commands', async () => {
			const catalog = new HermesCommandCatalog();

			const entries = await catalog.listDropdownEntries({ includeBuiltIns: true });

			expect(entries).toHaveLength(0);
		});

		it('includes all commands without filtering', async () => {
			const catalog = new HermesCommandCatalog();

			const sdkCommands: SlashCommand[] = [
				{ id: 'acp:search', name: 'search', description: 'Search', content: '', source: 'sdk' },
				{ id: 'acp:analyze', name: 'analyze', description: 'Analyze', content: '', source: 'sdk' },
				{ id: 'acp:debug', name: 'debug', description: 'Debug', content: '', source: 'sdk' },
			];
			catalog.setRuntimeCommands(sdkCommands);

			const withBuiltins = await catalog.listDropdownEntries({ includeBuiltIns: true });
			const withoutBuiltins = await catalog.listDropdownEntries({ includeBuiltIns: false });

			expect(withBuiltins).toHaveLength(3);
			expect(withoutBuiltins).toHaveLength(3);
		});

		it('replaces commands on subsequent setRuntimeCommands calls', async () => {
			const catalog = new HermesCommandCatalog();

			catalog.setRuntimeCommands([
				{ id: 'acp:old', name: 'old', description: 'Old', content: '', source: 'sdk' },
			]);
			expect(await catalog.listDropdownEntries({ includeBuiltIns: true })).toHaveLength(1);

			catalog.setRuntimeCommands([
				{ id: 'acp:new1', name: 'new1', description: 'New 1', content: '', source: 'sdk' },
				{ id: 'acp:new2', name: 'new2', description: 'New 2', content: '', source: 'sdk' },
			]);

			const entries = await catalog.listDropdownEntries({ includeBuiltIns: true });
			expect(entries).toHaveLength(2);
			expect(entries.find(e => e.name === 'old')).toBeUndefined();
		});
	});

	describe('getDropdownConfig', () => {
		it('returns correct config for Hermes', () => {
			const catalog = new HermesCommandCatalog();

			const config = catalog.getDropdownConfig();

			expect(config.providerId).toBe('hermes');
			expect(config.triggerChars).toEqual(['/']);
			expect(config.builtInPrefix).toBe('/');
			expect(config.skillPrefix).toBe('/');
			expect(config.commandPrefix).toBe('/');
		});
	});

	describe('vault operations', () => {
		it('listVaultEntries returns empty array', async () => {
			const catalog = new HermesCommandCatalog();

			const entries = await catalog.listVaultEntries();

			expect(entries).toEqual([]);
		});

		it('saveVaultEntry does not throw', async () => {
			const catalog = new HermesCommandCatalog();

			await expect(catalog.saveVaultEntry({
				id: 'test',
				providerId: 'hermes',
				kind: 'command',
				name: 'test',
				content: '',
				scope: 'vault',
				source: 'user',
				isEditable: true,
				isDeletable: true,
				displayPrefix: '/',
				insertPrefix: '/',
			})).resolves.toBeUndefined();
		});

		it('deleteVaultEntry does not throw', async () => {
			const catalog = new HermesCommandCatalog();

			await expect(catalog.deleteVaultEntry({
				id: 'test',
				providerId: 'hermes',
				kind: 'command',
				name: 'test',
				content: '',
				scope: 'vault',
				source: 'user',
				isEditable: true,
				isDeletable: true,
				displayPrefix: '/',
				insertPrefix: '/',
			})).resolves.toBeUndefined();
		});
	});

	describe('refresh', () => {
		it('does not throw', async () => {
			const catalog = new HermesCommandCatalog();

			await expect(catalog.refresh()).resolves.toBeUndefined();
		});
	});
});
