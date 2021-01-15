import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { ProviderName, ProviderConfig } from './types';

type ConfigFile = {
  providers: ProviderConfig[];
  workspacePath ?: string;
};

const defaultConfig: ConfigFile = {
  providers: [],
  workspacePath: undefined,
};

export default class Config {
  static getWorkspacePath(): string {
    return this.loadConfig().workspacePath || path.resolve(os.homedir(), 'Development');
  }

  static setWorkspacePath(workspacePath: string): void {
    const config = this.loadConfig();
    config.workspacePath = workspacePath;
    this.writeConfig(config);
  }

  static getProviders(): ProviderConfig[] {
    return this.loadConfig().providers;
  }

  static addProvider(providerName: ProviderName, url: string, username: string, token: string): void {
    const config = this.loadConfig();

    config.providers.push({
      providerName,
      username,
      token,
      url,
    });

    this.writeConfig(config);
  }

  static updateProvider(providerName: ProviderName, url: string, username: string, token: string): void {
    const config = this.loadConfig();
    const providerIndex = this.findProvider(providerName, url);

    if (providerIndex < 0) return;

    config.providers[providerIndex].username = username;
    config.providers[providerIndex].token = token;

    this.writeConfig(config);
  }

  static providerExists(providerName: ProviderName, url?: string) {
    return this.findProvider(providerName, url) >= 0;
  }

  private static findProvider(providerName: ProviderName, url?: string) {
    return this.loadConfig().providers.findIndex(provider => (
      provider.providerName === providerName && provider.url === url
    ));
  }

  private static loadConfig(): ConfigFile {
    const configPath = this.getConfigPath();

    if (!fs.existsSync(configPath)) {
      return this.createDefaultConfig();
    }

    const body = fs.readFileSync(this.getConfigPath());

    return JSON.parse(body.toString()) as ConfigFile;
  }

  private static writeConfig(config: ConfigFile): void {
    const body = JSON.stringify(config);
    fs.writeFileSync(this.getConfigPath(), body);
  }

  private static createDefaultConfig(): ConfigFile {
    this.writeConfig(defaultConfig);
    return defaultConfig;
  }

  private static getConfigPath(): string {
    return path.join(os.homedir(), '.freted');
  }
}
