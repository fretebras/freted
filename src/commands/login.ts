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
        name: 'url',
        message: 'Server URL',
        type: 'input',
        default: 'https://gitlab.com/',
        when: ({ provider }) => provider === 'GitLab',
      },
      {
        name: 'username',
        message: 'Username',
        type: 'input',
        when: ({ provider }) => provider === 'GitHub',
      },
      {
        name: 'token',
        message: 'Personal access token',
        type: 'password',
        validate: async (token, partialAnswers) => {
          if (!partialAnswers) return false;
          const { provider, url, username } = partialAnswers;
          const adapter = AdapterFactory.make(provider, url);
          const valid = await adapter.authenticate(token, username);

          return valid || 'Invalid token. Check the token and if you granted the right roles to the token.';
        },
      },
    ]);

    const {
      provider, username, url, token,
    } = answers;

    if (Config.providerExists(provider, url)) {
      Config.updateProvider(provider, url, username, token);
    } else {
      Config.addProvider(provider, url, username, token);
    }

    this.log(`Successfully authenticated to ${provider}`);
  }
}
