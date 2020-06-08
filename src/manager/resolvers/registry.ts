import { ServiceDefinition } from '../../types';
import { ResolverInterface } from './resolver';
import RegistryService from '../../registry/service';

export default class RegistryResolver implements ResolverInterface {
  private registry = new RegistryService();

  async resolve(serviceName: string): Promise<ServiceDefinition | undefined> {
    return this.registry.getService(serviceName);
  }
}
