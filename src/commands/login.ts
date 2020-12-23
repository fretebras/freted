import { Command } from '@oclif/command';
import * as inquirer from 'inquirer';
import Config from '../config';
import AdapterFactory from '../adapter/factory';

export default class Login extends Command {
  static description = 'authenticate to supported providers';

  static examples = [
    '$ freted login',
  ];

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
        default: 'GitLab',
      },
      {
        name: 'url',
        message: 'Server URL',
        type: 'input',
        default: 'https://gitlab.com/',
        when: ({ provider }) => provider === 'GitLab',
      },
      {
        name: 'token',
        message: 'Type your Personal Token',
        type: 'password',
        validate: async (token, partialAnswers) => {
          if (!partialAnswers) return false;
          const { provider, url } = partialAnswers;
          const adapter = AdapterFactory.make(provider, url);
          const valid = await adapter.authenticate(token);

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
