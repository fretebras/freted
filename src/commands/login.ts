import { Command } from '@oclif/command';
import * as inquirer from 'inquirer';
import RegistryService from '../registry/service';
import Config from '../config';

export default class Update extends Command {
  static description = 'authenticate to supported providers';

  static examples = [
    '$ freted login',
  ];

  private registry = new RegistryService();

  async run() {
    const answers = await inquirer.prompt([
      {
        name: 'provider',
        message: 'Provider',
        type: 'list',
        choices: ['GitLab', 'GitHub'],
      },
      {
        name: 'name',
        message: 'Name',
        type: 'input',
        default: 'FreteBras',
      },
      {
        name: 'url',
        message: 'Server URL',
        type: 'input',
        default: 'https://gitlab.fretebras.com.br/',
        when: ({ provider }) => provider === 'GitLab',
      },
      {
        name: 'token',
        message: 'Type your Personal Token',
        type: 'password',
        validate: async (token, partialAnswers) => {
          if (!partialAnswers) return false;
          const { provider } = partialAnswers;

          const valid = await this.registry.validateToken(
            provider,
            token,
          );

          return valid || 'Invalid token. Check the token and if you granted the right roles to the token.';
        },
      },
    ]);

    const {
      provider, name, url, token,
    } = answers;

    Config.addProvider(provider, name, url, token);

    this.log(`Successfully authenticated to ${provider}`);
  }
}
