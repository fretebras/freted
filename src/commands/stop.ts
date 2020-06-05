import { Command } from '@oclif/command';
import * as Listr from 'listr';
import ManagerService from '../manager/service';
import RepositoryService from '../repository/service';
import Resolver from '../manager/resolver';

export default class Stop extends Command {
  static description = 'stop a service';

  static args = [
    {
      name: 'service',
      required: true,
      description: 'name of the service to stop',
    },
  ];

  static examples = [
    '$ freted stop web/site',
  ];

  private repository = new RepositoryService();

  private resolver = new Resolver();

  private manager = new ManagerService();

  async run() {
    const { args: { service: serviceName } } = this.parse(Stop);
    const service = await this.repository.getService(serviceName);

    if (!service) {
      this.error(`Service '${serviceName}' not found.`);
    }

    const serviceAndDependenciesList = await this.resolver.resolveDependencies(service);

    const tasks = new Listr([
      {
        title: 'Stop services',
        task: async () => {
          await this.manager.stop(serviceAndDependenciesList);
        },
      },
    ]);

    await tasks.run();
  }
}
