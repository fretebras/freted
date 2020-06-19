import { Command } from '@oclif/command';
import Resolver from '../resolver';
import { printServices } from '../helpers/display';

export default class Inspect extends Command {
  static description = 'inspect a service';

  static args = [
    {
      name: 'service',
      required: true,
      description: 'name of the service',
    },
  ];

  static examples = [
    '$ freted inspect web/site',
  ];

  private resolver = new Resolver();

  async run() {
    const { args: { service: serviceName } } = this.parse(Inspect);
    const service = await this.resolver.resolveService(serviceName);

    if (!service) {
      this.error(`Service '${serviceName}' not found.`);
    }

    const dependencies = await this.resolver.resolveDependencies(service, true);

    printServices([service, ...dependencies]);
  }
}
