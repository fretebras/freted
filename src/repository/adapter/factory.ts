import {RepositoryAdapter} from './adapter'
import GitlabAdapter from './gitlab'
import { ProviderName } from '../../types'

export default class AdapterFactory {
  static make(providerName: ProviderName, url?: string): RepositoryAdapter {
    switch (providerName) {
    case 'GitLab':
      return new GitlabAdapter(url!)
    default:
      throw new Error(`Unknown provider '${providerName}'.`)
    }
  }
}
