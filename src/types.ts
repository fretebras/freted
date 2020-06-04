export type ProviderName = 'GitLab' | 'GitHub'

export type ProviderConfig = {
  providerName: ProviderName;
  name: string;
  token: string;
  url?: string;
}

export type ProviderRepository = {
  id: string;
  name: string;
  url: string;
}

export type RepositoryDefinition = {

}

export type Repository = {
  provider: ProviderConfig;
  repository: ProviderRepository;
}
