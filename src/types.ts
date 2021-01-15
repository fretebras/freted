export type ProviderName = 'GitLab' | 'GitHub';

export type ProviderConfig = {
  providerName: ProviderName;
  username: string;
  token: string;
  url?: string;
};

export type Repository = {
  id: string;
  url: string;
  cloneUrl: string;
  defaultBranch: string;
  provider: ProviderConfig;
};

export type ServiceDefinition = {
  localPath: string;
  repository?: Repository;
  config?: ServiceConfig;
};

export type ServiceConfig = {
  name: string;
  description: string;
  dependencies?: string[];
  optionalDependencies?: string[];
  routes?: {
    container: string;
    host: string;
    port: string;
  }[];
  instructions?: string[];
  credentials?: {
    name: string;
    description: string;
  } & { [ field: string ]: string }[];
  setup?: string[];
  start?: string[];
  stop?: string[];
  test?: string[];
};
