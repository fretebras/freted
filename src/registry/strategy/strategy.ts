import { ServiceDefinition } from '../../types';

export default interface RegistryStrategy {
  setServices: (services: ServiceDefinition[]) => Promise<void>;
  getService: (name: string) => Promise<ServiceDefinition | undefined>;
}
