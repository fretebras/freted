import { RepositoryAdapter } from './adapter';
import GitLabAdapter from './gitlab';
import GitHubAdapter from './github';
import { ProviderName } from '../types';

export default class AdapterFactory {
  static make(providerName: ProviderName, url?: string): RepositoryAdapter {
    switch (providerName) {
      case 'GitLab':
        return new GitLabAdapter(url!);
      case 'GitHub':
        return new GitHubAdapter();
      default:
        throw new Error(`Unknown provider '${providerName}'.`);
    }
  }
}
