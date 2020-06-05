import { ServiceDefinition } from '../../types';

export default interface RepositoryStrategy {

  setServices: (services: ServiceDefinition[]) => Promise<void>;

  getAllServices: () => Promise<ServiceDefinition[]>;

  getService: (name: string) => Promise<ServiceDefinition | undefined>;

}
