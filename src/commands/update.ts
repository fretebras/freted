import {Command} from '@oclif/command'
import * as Listr from 'listr'
import Config from '../config'
import { Observable } from 'rxjs'
import RepositoryService from '../repository/service'
import { Repository, RepositoryDefinition } from '../types'

export default class Update extends Command {
  static description = 'update repositories definitions'

  static examples = [
    '$ fretectl update',
  ]

  private repositoryService = new RepositoryService()

  async run() {
    const providers = Config.getProviders()
    const repositories: Repository[] = []
    const definitions: RepositoryDefinition[] = []

    const providersTasks: Listr.ListrTask[] = providers.map(provider => ({
      title: `${provider.providerName} (${provider.name}) - Discover repositories`,
      concurrent: true,
      task: async () => {
        const providerRepositories = await this.repositoryService.loadRepositories(provider)
        repositories.push(...providerRepositories)
      },
    }))

    const processingTasks: Listr.ListrTask[] = [
      {
        title: 'Sync repositories',
        task: () => new Observable(observer => {
          let done = 0

          this.syncRepositories(repositories, ({repository: {name}}, definition) => {
            done++
            observer.next(`(${done}/${repositories.length}) ${name} - ${definition}`)

            if (definition) definitions.push(definition)
          })
          .then(() => {
            observer.complete()
          })
          .catch(() => {
            observer.error()
          })
        }),
      },
    ]

    const tasks = new Listr(providersTasks.concat(processingTasks))

    tasks.run().then(() => {
      Config.setRepositories(definitions)
    })
  }

  private async syncRepositories(
    repositories: Repository[],
    onSync: (repository: Repository, definition?: RepositoryDefinition) => void,
  ): Promise<void> {
    for (const repository of repositories) {
      // eslint-disable-next-line no-await-in-loop
      const definition = await this.repositoryService.loadRepositoryDefinition(repository)
      onSync(repository, definition)
    }
  }
}
