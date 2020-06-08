import { Command, flags } from '@oclif/command';
import * as Listr from 'listr';
import * as execa from 'execa';
import * as fs from 'fs';
import { Observable } from 'rxjs';
import { terminal } from 'terminal-kit';
import { ServiceDefinition } from '../types';
import ManagerService from '../manager/service';
import Resolver from '../manager/resolver';
import { resolveRepositoryPath } from '../helpers/path';
import HostsEditor from '../manager/hosts-editor';

export default class Start extends Command {
  static description = 'start a service';

  static args = [
    {
      name: 'service',
      required: true,
      description: 'name of the service to start',
    },
  ];

  static flags = {
    'no-dependencies': flags.boolean({
      description: 'don\'t start service dependencies',
      required: false,
      default: false,
    }),
    'no-optional-dependencies': flags.boolean({
      description: 'don\'t start service optional dependencies',
      required: false,
      default: false,
    }),
  };

  static examples = [
    '$ freted start web/site',
  ];

  private resolver = new Resolver();

  private manager = new ManagerService();

  private hostsEditor = new HostsEditor();

  async run() {
    const { args: { service: serviceName }, flags: startFlags } = this.parse(Start);

    try {
      const service = await this.resolver.resolveService(serviceName);

      if (!service) {
        this.error(`Service '${serviceName}' not found.`);
      }

      const dependencies = await this.resolveDependencies(service, startFlags);

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
        {
          title: 'Add aliases to hosts file',
          task: async () => {
            await this.hostsEditor.addHosts([service, ...dependencies]);
          },
        },
      ]);

      await tasks.run();

      this.printServicesSummary([service, ...dependencies]);
    } catch (e) {
      this.error(e.message);
    }
  }

  private async resolveDependencies(
    service: ServiceDefinition,
    startFlags: { [ name: string ]: boolean },
  ): Promise<ServiceDefinition[]> {
    if (startFlags['no-dependencies']) return [];

    return this.resolver.resolveDependencies(
      service,
      !startFlags['no-optional-dependencies'],
    );
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
    for (const service of services) {
      terminal.green(`\n => ${service.name}: `);

      if (service.host) {
        terminal.defaultColor(service.host);
      }

      terminal('\n');

      if (service.credentials) {
        terminal.bold('    Credentials\n');

        for (const credential of service.credentials) {
          terminal.gray(`\n                ${credential.description}\n`);
          terminal.bold('          User: ').defaultColor(`${credential.user}\n`);
          terminal.bold('      Password: ').defaultColor(`${credential.password}\n`);
        }
      }
    }

    terminal.bold('\n\nYou\'re good to go!\n\n');
  }
}
