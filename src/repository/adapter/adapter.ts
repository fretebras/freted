import { ProviderRepository, ServiceDefinition } from '../../types';

export interface RepositoryAdapter {

  authenticate: (token: string) => Promise<boolean>;

  listRepositories: (token: string) => Promise<ProviderRepository[]>;

  readServiceDefinition: (token: string, repository: ProviderRepository)
  => Promise<ServiceDefinition | undefined>;

}
