import { Command } from '@oclif/command';
import * as Listr from 'listr';
import * as execa from 'execa';
import * as fs from 'fs';
import { Observable } from 'rxjs';
import { ServiceDefinition } from '../types';
import ManagerService from '../manager/service';
import Resolver from '../manager/resolver';
import { resolveRepositoryPath } from '../helpers/path';

export default class Start extends Command {
  static description = 'start a service';

  static args = [
    {
      name: 'service',
      required: true,
      description: 'name of the service to start',
    },
  ];

  static examples = [
    '$ freted start web/site',
  ];

  private resolver = new Resolver();

  private manager = new ManagerService();

  async run() {
    const { args: { service: serviceName } } = this.parse(Start);
    const service = await this.resolver.resolveService(serviceName);

    if (!service) {
      this.error(`Service '${serviceName}' not found.`);
    }

    try {
      const dependencies = await this.resolver.resolveDependencies(service);

      const tasks = new Listr([
        {
          title: 'Clone repositories',
          task: (_, task) => new Observable((resolve) => {
            const repositoriesToClone = this.getRepositoriesToClone(dependencies);

            if (repositoriesToClone.length === 0) {
              task.skip('All repositories are already cloned.');
              resolve.complete();
              return;
            }

            let done = 0;
            this.cloneRepositories(repositoriesToClone, (repository) => {
              done += 1;
              resolve.next(`(${done}/${repositoriesToClone.length}) ${repository.name}`);
            })
              .then(() => resolve.complete())
              .catch((e) => resolve.error(e));
          }),
        },
        {
          title: 'Start services',
          task: () => new Observable((resolve) => {
            this.manager.start([service, ...dependencies], (message) => resolve.next(message))
              .then(() => resolve.complete())
              .catch((e) => resolve.error(e));
          }),
        },
      ]);

      await tasks.run();

      this.printServicesSummary([service, ...dependencies]);
    } catch (e) {
      this.error(e.message);
    }
  }

  private getRepositoriesToClone(repositories: ServiceDefinition[]): ServiceDefinition[] {
    return repositories.filter((repository) => {
      if (!repository.name) return false;
      return !fs.existsSync(resolveRepositoryPath(repository));
    });
  }

  private async cloneRepositories(
    services: ServiceDefinition[],
    onClone: (repository: ServiceDefinition) => void,
  ): Promise<void> {
    for (const repository of services) {
      onClone(repository);

      await execa('git', [
        'clone',
        repository.cloneUrl,
        resolveRepositoryPath(repository),
      ]);
    }
  }

  private printServicesSummary(services: ServiceDefinition[]): void {
    console.log(services);
  }
}
