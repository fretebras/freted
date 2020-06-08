import { Command } from '@oclif/command';
import RegistryService from '../registry/service';

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

  private registry = new RegistryService();

  async run() {
    const { args: { service: serviceName } } = this.parse(Inspect);
    const service = await this.registry.getService(serviceName);

    if (!service) {
      this.error(`Service '${serviceName}' not found.`);
    }

    console.log(service);
  }
}
