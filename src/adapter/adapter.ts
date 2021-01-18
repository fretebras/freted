import { Repository, ProviderConfig } from '../types';

export interface RepositoryAdapter {
  authenticate: (token: string, username?: string) => Promise<boolean>;
  readRepositoryFile: (
    serviceName: string,
    repository: Repository,
    fileName: string,
  ) => Promise<string | undefined>;
  readRepository: (providerConfig: ProviderConfig, serviceName: string)
  => Promise<Repository | undefined>;
}
