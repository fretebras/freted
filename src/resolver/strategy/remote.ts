import * as path from 'path';
import * as Errors from '@oclif/errors';
import { ServiceDefinition } from '../../types';
import { ResolverInterface } from './resolver';
import Config from '../../config';
import AdapterFactory from '../../adapter/factory';
import ServiceDefinitionBuilder from '../service-builder';
import ConfigParser from '../config-parser';

export default class RemoteResolver implements ResolverInterface {
  private parser = new ConfigParser();

  async resolve(serviceName: string): Promise<ServiceDefinition | undefined> {
    const providers = Config.getProviders();

    if (providers.length === 0) {
      Errors.warn(`No providers are configured. The service ${serviceName} will not be resolved remotely. Run 'freted login' to fix it.`);
      return;
    }

    for (const provider of providers) {
      const adapter = AdapterFactory.make(provider.providerName, provider.url);
      const repository = await adapter.readRepository(provider, serviceName);

      if (repository) {
        const localPath = path.resolve(
          Config.getWorkspacePath(),
          serviceName,
        );

        const configContent = await adapter.readRepositoryFile(repository, 'freted.yml');
        if (!configContent) {
          Errors.warn(`A repository for the service ${serviceName} has been found but it doesn't have a freted.yml file.`);
          continue;
        }

        const config = this.parser.parse(configContent);
        if (!config) continue;

        if (config.name !== serviceName) continue;

        return new ServiceDefinitionBuilder(localPath)
          .setRepository(repository)
          .setConfig(config)
          .build();
      }
    }

    return undefined;
  }
}
