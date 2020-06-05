import * as fs from 'fs';
import * as path from 'path';
import { ServiceDefinition } from '../types';
import Config from '../config';
import RepositoryService from '../repository/service';

export default class Resolver {
  private repository = new RepositoryService();

  async resolveDependencies(service: ServiceDefinition): Promise<ServiceDefinition[]> {
    const services = await this.repository.getAllServices();
    const [updatedService] = this.updateServicesWithLocalDefinitions([service]);

    const serviceDependencies = services.filter((repository) => (
      updatedService.dependencies.includes(repository.name)
    ));

    const unresolvedDependencies = updatedService.dependencies.filter((dependency) => (
      !services.some((s) => s.name === dependency)
    ));

    const localDependencies = this.resolveLocalDependencies(unresolvedDependencies);

    return this.updateServicesWithLocalDefinitions(
      [updatedService, ...serviceDependencies, ...localDependencies],
    );
  }

  private updateServicesWithLocalDefinitions(
    services: ServiceDefinition[],
  ): ServiceDefinition[] {
    const workspacePath = Config.getWorkspacePath();

    return services.map((service) => {
      const configFilePath = path.resolve(workspacePath, service.name, 'freted.json');

      if (!fs.existsSync(configFilePath)) return service;

      const body = fs.readFileSync(configFilePath);
      const localConfig = JSON.parse(body.toString()) as ServiceDefinition;

      return { ...service, ...localConfig };
    });
  }

  private resolveLocalDependencies(
    dependencies: string[],
  ): ServiceDefinition[] {
    const workspacePath = Config.getWorkspacePath();
    const resolved: ServiceDefinition[] = [];

    for (const dependency of dependencies) {
      const repositoryPath = path.resolve(workspacePath, dependency);
      const configPath = path.resolve(repositoryPath, 'freted.json');

      if (fs.existsSync(configPath)) {
        const body = fs.readFileSync(configPath);
        const config = JSON.parse(body.toString());

        resolved.push({
          name: dependency,
          url: '',
          cloneUrl: '',
          dependencies: config.dependencies,
        });
      }
    }

    return resolved;
  }
}
