import Axios, { AxiosInstance } from 'axios';
import { RepositoryAdapter } from './adapter';
import { Repository, ProviderConfig } from '../types';

type GitLabRepository = {
  id: string;
  ssh_url_to_repo: string;
  web_url: string;
  default_branch: string;
};

type GitLabFile = {
  content: string;
};

export default class GitlabAdapter implements RepositoryAdapter {
  private client: AxiosInstance;

  constructor(url: string) {
    this.client = Axios.create({
      baseURL: url,
    });
  }

  async authenticate(token: string): Promise<boolean> {
    try {
      const { data } = await this.client.get('/api/v4/projects', {
        params: {
          private_token: token,
          per_page: 1,
        },
      });

      return data.length > 0;
    } catch (_) {
      return false;
    }
  }

  async readRepositoryFile(
    repository: Repository,
    fileName: string,
  ): Promise<string | undefined> {
    try {
      const { data } = await this.client.get<GitLabFile>(
        `/api/v4/projects/${repository.id}/repository/files/${fileName}`,
        {
          params: {
            private_token: repository.provider.token,
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
    try {
      const { data } = await this.client.get<GitLabRepository>(
        `/api/v4/projects/${encodeURIComponent(serviceName)}`,
        {
          params: {
            private_token: providerConfig.token,
          },
        },
      );

      return {
        provider: providerConfig,
        id: data.id,
        url: data.web_url,
        cloneUrl: data.ssh_url_to_repo,
        defaultBranch: data.default_branch,
      };
    } catch (_) {
      return undefined;
    }
  }
}
