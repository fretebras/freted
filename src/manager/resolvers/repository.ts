import { ServiceDefinition } from '../../types';
import { ResolverInterface } from './resolver';
import RepositoryService from '../../repository/service';

export default class RepositoryResolver implements ResolverInterface {
  private repository = new RepositoryService();

  async resolve(serviceName: string): Promise<ServiceDefinition | undefined> {
    return this.repository.getService(serviceName);
  }
}
