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
    ]);

    const { workspacePath } = answers;

    Config.setWorkspacePath(workspacePath);

    this.log('Configuration has been saved.');
  }
}
