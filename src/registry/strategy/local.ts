import RegistryStrategy from './strategy';
import { ServiceDefinition } from '../../types';
import Config from '../../config';

export default class LocalStrategy implements RegistryStrategy {
  async setServices(services: ServiceDefinition[]): Promise<void> {
    Config.setServices(services);
  }

  async getService(name: string): Promise<ServiceDefinition | undefined> {
    const services = Config.getServices();
    return services.find((service) => service.name === name);
  }
}
