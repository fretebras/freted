import { ServiceDefinition } from '../../types';

export default interface RepositoryStrategy {

  setServices: (services: ServiceDefinition[]) => Promise<void>;

  getService: (name: string) => Promise<ServiceDefinition | undefined>;

}
