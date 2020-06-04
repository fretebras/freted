import Axios, {AxiosInstance} from 'axios'
import {RepositoryAdapter} from './adapter'
import { ProviderRepository, RepositoryDefinition } from '../../types';

type GitLabRepository = {
  id: string;
  path_with_namespace: string;
  http_url_to_repo: string;
}

type GitLabFile = {
  content: string;
}

export default class GitlabAdapter implements RepositoryAdapter {

  private client: AxiosInstance;

  constructor(url: string) {
    this.client = Axios.create({
      baseURL: url,
    })
  }

  async authenticate(token: string): Promise<boolean> {
    try {
      const {data} = await this.client.get('/api/v4/projects', {
        params: {
          private_token: token,
          per_page: 1,
        },
      })

      return data.length > 0
    } catch (_) {
      return false
    }
  }

  async listRepositories(token: string, page = 1): Promise<ProviderRepository[]> {
    const {data, headers} = await this.client.get<GitLabRepository[]>('/api/v4/projects', {
      params: {
        private_token: token,
        per_page: 100,
        page,
      },
    })

    const repositories = data.map(repository => ({
      id: repository.id,
      name: repository.path_with_namespace,
      url: repository.http_url_to_repo,
    }))

    if (headers['x-next-page']?.length > 0) {
      repositories.push(...await this.listRepositories(token, page + 1))
    }

    return repositories
  }

  async readRepositoryDefinition(
    token: string,
    repository: ProviderRepository,
  ): Promise<RepositoryDefinition | undefined> {
    try {
      const {data} = await this.client.get<GitLabFile>(
        `/api/v4/projects/${repository.id}/repository/files/composer.json`,
        {
          params: {
            private_token: token,
            ref: 'master',
          },
        },
      )

      return JSON.parse(Buffer.from(data.content, 'base64').toString()) as RepositoryDefinition
    } catch (_) {
      return undefined
    }
  }
}
