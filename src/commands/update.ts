import { Command } from '@oclif/command';
import * as Listr from 'listr';
import { Observable } from 'rxjs';
import Config from '../config';
import RegistryService from '../registry/service';
import { Repository, ServiceDefinition } from '../types';

export default class Update extends Command {
  static description = 'update repositories definitions';

  static examples = [
    '$ freted update',
  ];

  private registry = new RegistryService();

  async run() {
    const providers = Config.getProviders();
    const repositories: Repository[] = [];
    const definitions: ServiceDefinition[] = [];

    const providersTasks: Listr.ListrTask[] = providers.map((provider) => ({
      title: `${provider.providerName} (${provider.name}) - Discover repositories`,
      concurrent: true,
      task: async () => {
        const providerRepositories = await this.registry.loadRepositoriesFromProvider(provider);
        repositories.push(...providerRepositories);
      },
    }));

    const processingTasks: Listr.ListrTask[] = [
      {
        title: 'Sync repositories',
        task: () => new Observable((observer) => {
          let done = 0;

          this.syncRepositories(repositories, ({ repository: { name } }, definition) => {
            done += 1;
            observer.next(`(${done}/${repositories.length}) ${name}`);

            if (definition) definitions.push(definition);
          })
            .then(() => {
              observer.complete();
            })
            .catch(() => {
              observer.error();
            });
        }),
      },
    ];

    const tasks = new Listr(providersTasks.concat(processingTasks));

    await tasks.run();
    await this.registry.setServices(definitions);
  }

  private async syncRepositories(
    repositories: Repository[],
    onSync: (repository: Repository, definition?: ServiceDefinition) => void,
  ): Promise<void> {
    for (const repository of repositories) {
      const definition = await this.registry.loadServiceDefinition(repository);
      onSync(repository, definition);
    }
  }
}
