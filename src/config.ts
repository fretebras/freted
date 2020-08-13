import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { ProviderName, ProviderConfig, ServiceDefinition } from './types';

type ConfigFile = {
  providers: ProviderConfig[];
  services: ServiceDefinition[];
  workspacePath ?: string;
};

const defaultConfig: ConfigFile = {
  providers: [],
  services: [],
  workspacePath: undefined,
};

export default class Config {
  static getWorkspacePath(): string {
    return this.loadConfig().workspacePath || path.resolve(os.homedir(), 'Development');
  }

  static getProviders(): ProviderConfig[] {
    return this.loadConfig().providers;
  }

  static addProvider(providerName: ProviderName, name: string, url: string, token: string): void {
    const config = this.loadConfig();

    config.providers.push({
      providerName,
      name,
      token,
      url,
    });

    this.writeConfig(config);
  }

  static setServices(services: ServiceDefinition[]): void {
    const config = this.loadConfig();
    config.services = services;
    this.writeConfig(config);
  }

  static getServices(): ServiceDefinition[] {
    const config = this.loadConfig();
    return config.services;
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
    return path.join(os.homedir(), '.freterc');
  }
}
