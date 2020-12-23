import * as path from 'path';
import { ServiceDefinition } from '../../types';
import { ResolverInterface } from './resolver';
import Config from '../../config';
import AdapterFactory from '../../adapter/factory';
import ServiceDefinitionBuilder from '../service-builder';
import ConfigParser from '../config-parser';

export default class RemoteResolver implements ResolverInterface {
  private parser = new ConfigParser();

  async resolve(serviceName: string): Promise<ServiceDefinition | undefined> {
    for (const provider of Config.getProviders()) {
      const adapter = AdapterFactory.make(provider.providerName, provider.url);
      const repository = await adapter.readRepository(provider, serviceName);

      if (repository) {
        const localPath = path.resolve(
          Config.getWorkspacePath(),
          new URL(repository.url).host,
          serviceName,
        );

        const configContent = await adapter.readRepositoryFile(repository, 'freted.yml');
        if (!configContent) continue;

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
