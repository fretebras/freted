export type ProviderName = 'GitLab' | 'GitHub';

export type ProviderConfig = {
  providerName: ProviderName;
  name: string;
  token: string;
  url?: string;
};

export type ProviderRepository = {
  id: string;
  name: string;
  url: string;
  cloneUrl: string;
  defaultBranch: string;
};

export type Repository = {
  provider: ProviderConfig;
  repository: ProviderRepository;
};

export type ServiceDefinition = {
  name: string;
  host?: string;
  url: string;
  cloneUrl: string;
  dependencies?: string[];
  credentials?: {
    description: string;
    user: string;
    password: string;
  }[];
};
