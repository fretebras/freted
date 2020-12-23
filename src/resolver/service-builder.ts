import { ServiceDefinition, Repository, ServiceConfig } from '../types';

export default class ServiceDefinitionBuilder {
  private localPath: string;

  private config?: ServiceConfig;

  private repository?: Repository;

  constructor(localPath: string) {
    this.localPath = localPath;
  }

  public setConfig(config: ServiceConfig) {
    this.config = config;
    return this;
  }

  public setRepository(repository: Repository) {
    this.repository = repository;
    return this;
  }

  public build(): ServiceDefinition {
    return {
      localPath: this.localPath,
      repository: this.repository,
      config: this.config,
    };
  }
}
