import AdapterFactory from './adapter/factory';
import {
  ProviderConfig, ProviderName, Repository, ServiceDefinition,
} from '../types';
import strategyFactory from './strategy';
import RepositoryStrategy from './strategy/strategy';

export default class RepositoryService {
  private strategy: RepositoryStrategy = strategyFactory();

  async setServices(services: ServiceDefinition[]): Promise<void> {
    this.strategy.setServices(services);
  }

  async getService(name: string): Promise<ServiceDefinition | undefined> {
    return this.strategy.getService(name);
  }

  async validateToken(providerName: ProviderName, token: string): Promise<boolean> {
    const adapter = AdapterFactory.make(providerName);
    return adapter.authenticate(token);
  }

  async loadRepositoriesFromProvider(provider: ProviderConfig): Promise<Repository[]> {
    const adapter = AdapterFactory.make(provider.providerName, provider.url);
    const repositories = await adapter.listRepositories(provider.token);

    return repositories.map((repository) => ({ provider, repository }));
  }

  async loadServiceDefinition(
    repository: Repository,
  ): Promise<ServiceDefinition | undefined> {
    const { provider: { providerName, url, token }, repository: providerRepository } = repository;

    const adapter = AdapterFactory.make(providerName, url);
    return adapter.readServiceDefinition(token, providerRepository);
  }
}
