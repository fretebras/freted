import * as fs from 'fs';
import * as path from 'path';
import { ServiceDefinition } from '../types';
import { resolveRepositoryPath } from '../helpers/path';
import resolvers from './resolvers';

export default class Resolver {
  async resolveService(serviceName: string): Promise<ServiceDefinition | undefined> {
    for (const resolver of resolvers) {
      const service = await resolver.resolve(serviceName);
      if (service) return this.updateServiceWithLocalDefinitions(service);
    }

    return undefined;
  }

  async resolveDependencies(
    service: ServiceDefinition,
    includeOptionals: boolean,
    dependencies: ServiceDefinition[] = [],
  ): Promise<ServiceDefinition[]> {
    const serviceDependencies = this.getServiceDependencyList(service, includeOptionals);

    if (serviceDependencies.length === 0) return [];

    for (const serviceName of serviceDependencies) {
      if (dependencies.some((d) => d.name === serviceName)) continue;

      const dependency = await this.resolveService(serviceName);

      if (dependency) {
        dependencies.push(dependency);
        continue;
      }

      throw new Error(`Couldn't resolve dependency '${serviceName}' of ${service.name}. Check if you have the right permissions`);
    }

    for (const dependency of dependencies) {
      const dependencyDependencies = this.getServiceDependencyList(service, includeOptionals);
      if (dependencyDependencies.length === 0) continue;
      if (dependencies.every((d) => dependencyDependencies.includes(d.name))) continue;

      dependencies.push(
        ...await this.resolveDependencies(dependency, includeOptionals, dependencies),
      );
    }

    return dependencies;
  }

  private getServiceDependencyList(
    service: ServiceDefinition,
    includeOptionals: boolean,
  ): string[] {
    if (!includeOptionals) {
      return service.dependencies || [];
    }

    return [...(service.dependencies || []), ...(service.optionalDependencies || [])];
  }

  private updateServiceWithLocalDefinitions(
    service: ServiceDefinition,
  ): ServiceDefinition {
    const projectPath = resolveRepositoryPath(service);
    const configFilePath = path.resolve(projectPath, 'freted.json');

    if (!fs.existsSync(configFilePath)) return service;

    const body = fs.readFileSync(configFilePath);
    const localConfig = JSON.parse(body.toString()) as ServiceDefinition;

    return { ...service, ...localConfig };
  }
}
