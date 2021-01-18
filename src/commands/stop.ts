import { Command, flags } from '@oclif/command';
import * as Listr from 'listr';
import ManagerService from '../manager';
import Router from '../manager/router';
import Resolver from '../resolver';
import { ServiceDefinition } from '../types';

export default class Stop extends Command {
  static description = 'stop a service';

  static args = [
    {
      name: 'service',
      required: true,
      description: 'name of the service to stop',
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
    '$ freted stop github.com/myorg/myproject',
  ];

  private resolver = new Resolver();

  private manager = new ManagerService();

  private router = new Router();

  async run() {
    const { args: { service: serviceName }, flags: stopFlags } = this.parse(Stop);

    this.log(`Stopping service ${serviceName}.`);

    try {
      const service = await this.resolver.resolveService(serviceName);

      if (!service) {
        this.error(`Service '${serviceName}' not found.`);
      }

      const tasks = new Listr();
      const dependencies = await this.resolveDependencies(service, stopFlags);

      for (const s of [service, ...dependencies]) {
        const { name, routes } = s.config!;

        tasks.add({
          title: `Stop service ${name}`,
          task: () => this.manager.stop(s),
        });

        if (routes?.length) {
          for (const route of routes) {
            const { host, destination } = route;

            tasks.add({
              title: `Remove route ${host} to container ${destination}`,
              task: () => this.router.removeRoute(route),
            });
          }
        }
      }

      await tasks.run();
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
}
