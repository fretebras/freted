import {Command} from '@oclif/command'
import RepositoryService from '../repository/service'
import inquirer = require('inquirer')
import Config from '../config'

export default class Update extends Command {
  static description = 'authenticate to supported providers'

  static examples = [
    '$ fretectl login',
  ]

  private repositoryService = new RepositoryService();

  async run() {
    const {provider, name, url, token} = await inquirer.prompt([
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
        when: ({provider}) => {
          return provider === 'GitLab'
        },
      },
      {
        name: 'token',
        message: 'Type your Personal Token',
        type: 'password',
        validate: async (token, answers) => {
          if (!answers) return false
          const {provider} = answers

          const valid = await this.repositoryService.validateToken(
            provider,
            token
          )

          return valid || 'Invalid token. Check the token and if you granted the right roles to the token.'
        },
      },
    ])

    Config.addProvider(provider, name, url, token)

    this.log(`Successfully authenticated to ${provider}`)
  }
}
