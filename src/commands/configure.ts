import { Command } from '@oclif/command';
import * as inquirer from 'inquirer';
import Config from '../config';

export default class Configure extends Command {
  static description = 'configure freted';

  static examples = [
    '$ freted configure',
  ];

  async run() {
    const answers = await inquirer.prompt([
      {
        name: 'workspacePath',
        message: 'Workspace',
        type: 'input',
        default: Config.getWorkspacePath(),
      },
      {
        name: 'traefikPort',
        message: 'Traefik port',
        type: 'input',
        default: Config.get('traefikPort', 80),
      },
      {
        name: 'traefikDashboardPort',
        message: 'Traefik dashboard port',
        type: 'input',
        default: Config.get('traefikDashboardPort', 8080),
      },
    ]);

    for (const configKey in answers) {
      Config.set(configKey, (answers as any)[configKey]);
    }

    this.log('Configuration has been saved.');
  }
}
