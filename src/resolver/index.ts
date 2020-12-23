import { ServiceDefinition } from '../types';
import resolvers from './strategy';

export default class Resolver {
  async resolveService(serviceName: string): Promise<ServiceDefinition | undefined> {
    for (const resolver of resolvers) {
      const service = await resolver.resolve(serviceName);
      if (service) return service;
    }

    return undefined;
  }

  async resolveDependencies(
    service: ServiceDefinition,
    includeOptionals: boolean,
  ): Promise<ServiceDefinition[]> {
    if (!service.config) return [];

    const dependencies: ServiceDefinition[] = [];

    const serviceDependencies = this.getServiceDependencyList(service, includeOptionals);
    if (serviceDependencies.length === 0) return [];

    for (const serviceName of serviceDependencies) {
      if (dependencies.some((d) => d.config?.name === serviceName)) continue;

      const dependency = await this.resolveService(serviceName);

      if (dependency) {
        dependencies.push(dependency);
        continue;
      }

      throw new Error(`Couldn't resolve dependency '${serviceName}' of ${service.config?.name}. Check if you have the right permissions`);
    }

    for (const dependency of dependencies) {
      const childDeps = await this.resolveDependencies(dependency, includeOptionals);

      for (const dep of childDeps) {
        if (dependencies.some((d) => d.config?.name === dep.config?.name)) continue;
        dependencies.push(dep);
      }
    }

    return dependencies;
  }

  private getServiceDependencyList(
    service: ServiceDefinition,
    includeOptionals: boolean,
  ): string[] {
    return [
      ...(service.config?.dependencies || []),
      ...(includeOptionals ? service.config?.optionalDependencies || [] : []),
    ];
  }
}
