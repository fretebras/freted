import * as os from 'os';
import * as path from 'path';
import Conf from 'conf';
import { ProviderName, ProviderConfig } from './types';

const config = new Conf({
  cwd: path.resolve(os.homedir(), '.freted'),
  configName: 'config',
  fileExtension: 'json',
});

export default class Config {
  static get<T>(key: string, defaultValue: T): T {
    return config.get(key, defaultValue) as T;
  }

  static set<T>(key: string, value: T) {
    config.set(key, value);
  }

  static getWorkspacePath(): string {
    return this.get<string>('workspacePath', path.resolve(os.homedir(), 'Development'));
  }

  static getProviders(): ProviderConfig[] {
    return this.get<ProviderConfig[]>('providers', []);
  }

  static addProvider(
    providerName: ProviderName,
    url: string,
    username: string,
    token: string,
  ): void {
    const providers = this.getProviders();

    providers.push({
      providerName,
      username,
      token,
      url,
    });

    config.set('providers', providers);
  }

  static updateProvider(
    providerName: ProviderName,
    url: string,
    username: string,
    token: string,
  ): void {
    const providers = this.getProviders();
    const providerIndex = this.findProvider(providers, providerName, url);

    if (providerIndex < 0) return;

    providers[providerIndex].username = username;
    providers[providerIndex].token = token;

    config.set('providers', providers);
  }

  static providerExists(providerName: ProviderName, url?: string) {
    const providers = this.getProviders();
    return this.findProvider(providers, providerName, url) >= 0;
  }

  private static findProvider(
    providers: ProviderConfig[],
    providerName: ProviderName,
    url?: string,
  ) {
    return providers.findIndex((provider) => (
      provider.providerName === providerName && provider.url === url
    ));
  }

  static getConfigDir(): string {
    return path.join(os.homedir(), '.freted');
  }
}
