export type ProviderName = 'GitLab' | 'GitHub';

export type ProviderConfig = {
  providerName: ProviderName;
  name: string;
  token: string;
  url?: string;
};

export type Repository = {
  provider: ProviderConfig;
  id: string;
  url: string;
  cloneUrl: string;
  defaultBranch: string;
};

export type ServiceDefinition = {
  name: string;
  localPath: string;
  repository?: Repository;
  welcomeText?: string;
  dependencies?: string[];
  optionalDependencies?: string[];
  routes?: { [ serviceName: string ]: string[] };
};

export type ComposeFile = {
  version: string;
  services: {
    [ name: string ]: {
      networks?: { [ name: string ]: object },
      labels?: string[];
    };
  };
  networks?: { [ name: string ]: {
    external?: boolean;
  }};
};
