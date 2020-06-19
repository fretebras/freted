import { Repository, ProviderConfig } from '../types';

export interface RepositoryAdapter {
  authenticate: (token: string) => Promise<boolean>;
  readRepositoryFile: (repository: Repository, fileName: string) => Promise<string | undefined>;
  readRepository: (providerConfig: ProviderConfig, serviceName: string)
  => Promise<Repository | undefined>;
}
