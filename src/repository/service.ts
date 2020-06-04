import AdapterFactory from './adapter/factory';
import {
  ProviderConfig, ProviderName, Repository, RepositoryDefinition,
} from '../types';

export default class RepositoryService {
  async validateToken(providerName: ProviderName, token: string): Promise<boolean> {
    const adapter = AdapterFactory.make(providerName);
    return adapter.authenticate(token);
  }

  async loadRepositories(provider: ProviderConfig): Promise<Repository[]> {
    const adapter = AdapterFactory.make(provider.providerName, provider.url);
    const repositories = await adapter.listRepositories(provider.token);

    return repositories.map((repository) => ({ provider, repository }));
  }

  async loadRepositoryDefinition(
    repository: Repository,
  ): Promise<RepositoryDefinition | undefined> {
    const { provider: { providerName, url, token }, repository: providerRepository } = repository;

    const adapter = AdapterFactory.make(providerName, url);
    return adapter.readRepositoryDefinition(token, providerRepository);
  }
}
