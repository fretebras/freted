import { ProviderRepository, RepositoryDefinition } from '../../types'

export interface RepositoryAdapter {

  authenticate: (token: string) => Promise<boolean>;

  listRepositories: (token: string) => Promise<ProviderRepository[]>;

  readRepositoryDefinition: (token: string, repository: ProviderRepository)
    => Promise<RepositoryDefinition | undefined>;

}
