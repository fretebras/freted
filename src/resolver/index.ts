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
    const dependencies: ServiceDefinition[] = [];

    const serviceDependencies = this.getServiceDependencyList(service, includeOptionals)
      .filter((dependency) => !dependencies.some((d) => d.name === dependency));

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
      const childDeps = await this.resolveDependencies(dependency, includeOptionals);

      for (const dep of childDeps) {
        if (dependencies.some((d) => d.name === dep.name)) continue;
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
      ...(service.dependencies || []),
      ...(includeOptionals ? service.optionalDependencies || [] : []),
    ];
  }
}
