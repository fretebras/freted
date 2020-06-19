import * as path from 'path';
import { parse } from 'yaml';
import { ServiceDefinition } from '../../types';
import { ResolverInterface } from './resolver';
import Config from '../../config';
import AdapterFactory from '../../adapter/factory';
import ServiceDefinitionBuilder from '../service-builder';

export default class RemoteResolver implements ResolverInterface {
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

        const composeData = await adapter.readRepositoryFile(repository, 'docker-compose.yml');
        const readmeFile = await adapter.readRepositoryFile(repository, 'readme.yml');

        if (composeData) {
          return ServiceDefinitionBuilder.new(serviceName, localPath)
            .setRepository(repository)
            .setComposeFile(parse(composeData))
            .setReadmeFile(readmeFile)
            .build();
        }
      }
    }

    return undefined;
  }
}
