import { Command, flags } from '@oclif/command';
import * as Listr from 'listr';
import * as execa from 'execa';
import { Observable } from 'rxjs';
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
    '$ freted start github.com/myorg/myproject',
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

      const tasks = new Listr();

      const dependencies = await this.resolveDependencies(service, startFlags);
      const servicesToClone = this.getServicesToClone([service, ...dependencies]);

      if (servicesToClone.length > 0) {
        for (const s of servicesToClone) {
          tasks.add({
            title: `Clone service ${s.config?.name}`,
            task: () => new Observable((resolve) => {
              this.cloneRepository(s, (message) => resolve.next(message))
                .then(() => resolve.complete())
                .catch((e) => resolve.error(e));
            }),
          });

          tasks.add({
            title: `Setup service ${s.config?.name}`,
            task: () => new Observable((resolve) => {
              this.manager.setup(s, (message) => resolve.next(message));
            }),
          });
        }
      }

      for (const s of [service, ...dependencies]) {
        tasks.add({
          title: `Start service ${s.config?.name}`,
          task: () => new Observable((resolve) => {
            this.manager.start(s, (message) => resolve.next(message))
              .then(() => resolve.complete())
              .catch((e) => resolve.error(e));
          }),
        });
      }

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

  private getServicesToClone(services: ServiceDefinition[]): ServiceDefinition[] {
    return services.filter((service) => service.repository);
  }

  private async cloneRepository(
    service: ServiceDefinition,
    onUpdate: (message: string) => void,
  ): Promise<void> {
    if (!service.repository) return;

    const subprocess = execa('git', [
      'clone',
      service.repository.cloneUrl,
      service.localPath,
    ]);

    subprocess.stdout.on('data', (data) => onUpdate(data.toString()));

    await subprocess;
    await this.manager.setup(service, onUpdate);
  }
}
