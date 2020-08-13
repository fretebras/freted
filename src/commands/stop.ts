import { Command, flags } from '@oclif/command';
import * as Listr from 'listr';
import ManagerService from '../manager';
import Resolver from '../resolver';
import HostsEditor from '../manager/hosts-editor';

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
    'no-edit-hosts': flags.boolean({
      description: 'don\'t edit /etc/hosts file to remove dns links',
      required: false,
      default: false,
    }),
  };

  static examples = [
    '$ freted stop web/site',
  ];

  private resolver = new Resolver();

  private manager = new ManagerService();

  private hostsEditor = new HostsEditor();

  async run() {
    const { args: { service: serviceName }, flags: stopFlags } = this.parse(Stop);

    try {
      const service = await this.resolver.resolveService(serviceName);

      if (!service) {
        this.error(`Service '${serviceName}' not found.`);
      }

      const dependencies = await this.resolver.resolveDependencies(service, true);

      const tasks = new Listr([
        {
          title: 'Stop services',
          task: async () => {
            await this.manager.stop([service, ...dependencies]);
          },
        },
      ]);

      if (!stopFlags['no-edit-hosts']) {
        tasks.add({
          title: 'Remove aliases from hosts file',
          task: async () => {
            await this.hostsEditor.removeHosts([service, ...dependencies]);
          },
        });
      }

      await tasks.run();
    } catch (e) {
      this.error(e.message);
    }
  }
}
