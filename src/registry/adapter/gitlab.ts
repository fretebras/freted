import Axios, { AxiosInstance } from 'axios';
import { RepositoryAdapter } from './adapter';
import { ProviderRepository, ServiceDefinition } from '../../types';

type GitLabRepository = {
  id: string;
  path_with_namespace: string;
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

  async listRepositories(token: string, page = 1): Promise<ProviderRepository[]> {
    const { data, headers } = await this.client.get<GitLabRepository[]>('/api/v4/projects', {
      params: {
        private_token: token,
        per_page: 100,
        page,
      },
    });

    const repositories = data.map((repository) => ({
      id: repository.id,
      name: repository.path_with_namespace,
      url: repository.web_url,
      cloneUrl: repository.ssh_url_to_repo,
      defaultBranch: repository.default_branch,
    }));

    if (headers['x-next-page']?.length > 0) {
      repositories.push(...await this.listRepositories(token, page + 1));
    }

    return repositories;
  }

  async readServiceDefinition(
    token: string,
    repository: ProviderRepository,
  ): Promise<ServiceDefinition | undefined> {
    try {
      const { data } = await this.client.get<GitLabFile>(
        `/api/v4/projects/${repository.id}/repository/files/freted.json`,
        {
          params: {
            private_token: token,
            ref: repository.defaultBranch,
          },
        },
      );

      const config = JSON.parse(Buffer.from(data.content, 'base64').toString());

      return {
        name: repository.name,
        url: repository.url,
        cloneUrl: repository.cloneUrl,
        ...config,
      };
    } catch (_) {
      return undefined;
    }
  }
}
