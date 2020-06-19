import { ServiceDefinition } from '../../types';

export interface ResolverInterface {
  resolve: (serviceName: string) => Promise<ServiceDefinition | undefined>;
}
