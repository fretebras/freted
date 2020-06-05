import { Command } from '@oclif/command';
import Stop from './stop';
import Start from './start';

export default class Restart extends Command {
  static description = 'restart a service';

  static args = [
    {
      name: 'service',
      required: true,
      description: 'name of the service to restart',
    },
  ];

  static examples = [
    '$ fretectl restart web/site',
  ];

  async run() {
    const { args: { service } } = this.parse(Restart);

    await Stop.run([service]);
    await Start.run([service]);
  }
}
