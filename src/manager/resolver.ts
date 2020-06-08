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
    dependencies: ServiceDefinition[] = [],
  ): Promise<ServiceDefinition[]> {
    if (!service.dependencies || service.dependencies.length === 0) return [];

    for (const serviceName of service.dependencies) {
      if (dependencies.some((d) => d.name === serviceName)) continue;

      const dependency = await this.resolveService(serviceName);

      if (dependency) {
        dependencies.push(dependency);
        continue;
      }

      throw new Error(`Couldn't resolve dependency '${serviceName}' of ${service.name}. Check if you have the right permissions`);
    }

    for (const dependency of dependencies) {
      if (!dependency.dependencies || dependency.dependencies.length === 0) continue;
      dependencies.push(...await this.resolveDependencies(dependency, dependencies));
    }

    return dependencies;
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
