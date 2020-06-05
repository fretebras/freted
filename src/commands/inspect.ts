import { Command } from '@oclif/command';
import RepositoryService from '../repository/service';

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

  private repository = new RepositoryService();

  async run() {
    const { args: { service: serviceName } } = this.parse(Inspect);
    const service = await this.repository.getService(serviceName);

    if (!service) {
      this.error(`Service '${serviceName}' not found.`);
    }

    console.log(service);
  }
}
