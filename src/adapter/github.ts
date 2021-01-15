import Axios, { AxiosInstance } from 'axios';
import { RepositoryAdapter } from './adapter';
import { Repository, ProviderConfig } from '../types';

type GitHubRepository = {
  id: string;
  url: string;
  ssh_url: string;
  default_branch: string;
};

type GitHubFile = {
  content: string;
};

export default class GitHubAdapter implements RepositoryAdapter {
  private client: AxiosInstance;

  constructor() {
    this.client = Axios.create({
      baseURL: 'https://api.github.com',
    });
  }

  async authenticate(password: string, username?: string): Promise<boolean> {
    try {
      const { data } = await this.client.get('/user', {
        auth: {
          username: username!,
          password,
        },
      });

      return true;
    } catch (_) {
      return false;
    }
  }

  async readRepositoryFile(
    serviceName: string,
    repository: Repository,
    fileName: string,
  ): Promise<string | undefined> {
    const servicePath = serviceName.split('/').splice(1).join('/');

    try {
      const { data } = await this.client.get<GitHubFile>(
        `/repos/${servicePath}/contents/${fileName}`,
        {
          auth: {
            username: repository.provider.username,
            password: repository.provider.token,
          },
          params: {
            ref: repository.defaultBranch,
          },
        },
      );

      return Buffer.from(data.content, 'base64').toString();
    } catch (_) {
      return undefined;
    }
  }

  async readRepository(
    providerConfig: ProviderConfig,
    serviceName: string,
  ): Promise<Repository | undefined> {
    const servicePath = serviceName.split('/').splice(1).join('/');

    try {
      const { data } = await this.client.get<GitHubRepository>(
        `/repos/${servicePath}`,
        {
          auth: {
            username: providerConfig.username,
            password: providerConfig.token,
          },
        },
      );

      return {
        id: data.id,
        provider: providerConfig,
        url: data.url,
        cloneUrl: data.ssh_url,
        defaultBranch: data.default_branch,
      };
    } catch (_) {
      return undefined;
    }
  }
}
