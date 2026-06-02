import { ProviderWorkspaceRegistry } from '../../../core/providers/ProviderWorkspaceRegistry';
import type {
  ProviderTabWarmupPolicy,
  ProviderWorkspaceRegistration,
  ProviderWorkspaceServices,
} from '../../../core/providers/types';
import type { VaultFileAdapter } from '../../../core/storage/VaultFileAdapter';
import { HermesCommandCatalog } from '../commands/HermesCommandCatalog';
import { HermesCliResolver } from '../runtime/HermesCliResolver';
import { hermesSettingsTabRenderer } from '../ui/HermesSettingsTab';

export interface HermesWorkspaceServices extends ProviderWorkspaceServices {
  cliResolver: HermesCliResolver;
}

const hermesTabWarmupPolicy: ProviderTabWarmupPolicy = {
  resolveMode() {
    return 'none';
  },
};

export async function createHermesWorkspaceServices(
  _vaultAdapter: VaultFileAdapter,
): Promise<HermesWorkspaceServices> {
  return {
    cliResolver: new HermesCliResolver(),
    commandCatalog: new HermesCommandCatalog(),
    settingsTabRenderer: hermesSettingsTabRenderer,
    tabWarmupPolicy: hermesTabWarmupPolicy,
  };
}

export const hermesWorkspaceRegistration: ProviderWorkspaceRegistration<HermesWorkspaceServices> = {
  initialize: async ({ vaultAdapter }) => createHermesWorkspaceServices(vaultAdapter),
};

export function maybeGetHermesWorkspaceServices(): HermesWorkspaceServices | null {
  return ProviderWorkspaceRegistry.getServices('hermes') as HermesWorkspaceServices | null;
}
