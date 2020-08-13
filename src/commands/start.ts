import { Command, flags } from '@oclif/command';
import * as Listr from 'listr';
import * as execa from 'execa';
import * as path from 'path';
import { Observable } from 'rxjs';
import * as fs from 'fs';
import { ServiceDefinition } from '../types';
import ManagerService from '../manager';
import Resolver from '../resolver';
import HostsEditor from '../manager/hosts-editor';
import { printServices } from '../helpers/display';

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
    build: flags.boolean({
      description: 'rebuild containers before start',
      required: false,
      default: false,
    }),
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
    'no-edit-hosts': flags.boolean({
      description: 'don\'t edit /etc/hosts file to create dns links',
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
            const repositoriesToClone = this.getRepositoriesToClone([service, ...dependencies]);

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
          title: 'Copy environment file (.env, if exists)',
          task: () => new Observable((resolve) => {
            const allServices = [service, ...dependencies];
            let done = 0;
            this.copyEnvFile(allServices, (currentService) => {
              done += 1;
              resolve.next(`(${done}/${allServices.length}) ${currentService.name}`);
            })
              .then(() => resolve.complete())
              .catch((e) => resolve.error(e));
          }),
        },
        {
          title: 'Start services',
          task: () => new Observable((resolve) => {
            this.manager.start(
              [service, ...dependencies],
              startFlags.build,
              (message) => resolve.next(message),
            )
              .then(() => resolve.complete())
              .catch((e) => resolve.error(e));
          }),
        },
      ]);

      if (!startFlags['no-edit-hosts']) {
        tasks.add({
          title: 'Add aliases to hosts file',
          task: async () => {
            await this.hostsEditor.addHosts([service, ...dependencies]);
          },
        });
      }

      await tasks.run();

      printServices([service, ...dependencies]);
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

  private getRepositoriesToClone(services: ServiceDefinition[]): ServiceDefinition[] {
    return services.filter((service) => service.repository);
  }

  private async cloneRepositories(
    services: ServiceDefinition[],
    onClone: (repository: ServiceDefinition) => void,
  ): Promise<void> {
    for (const service of services) {
      if (!service.repository) continue;

      onClone(service);

      await execa('git', [
        'clone',
        service.repository.cloneUrl,
        service.localPath,
      ]);
    }
  }

  private async copyEnvFile(
    services: ServiceDefinition[],
    onCopy: (repository: ServiceDefinition) => void,
  ): Promise<void> {
    for (const service of services) {
      const envExPath = path.resolve(service.localPath, '.env.example');
      const envPath = envExPath.replace('.example', '');
      if (!fs.existsSync(envExPath)) continue;
      if (fs.existsSync(envPath)) continue;

      onCopy(service);

      await execa('cp', [envExPath, envPath]);
    }
  }
}
