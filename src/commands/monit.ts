import { Command } from '@oclif/command';

export default class Monit extends Command {
  static description = 'monitor the services';

  static examples = [
    '$ fretectl monit',
  ];

  async run() {
    //
  }
}
