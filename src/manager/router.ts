import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import Config from '../config';
import { ServiceRoute, TraefikRoutesConfig } from '../types';

export default class Router {
  async createRoute(route: ServiceRoute) {
    const name = this.getRouteName(route);

    if (this.configExists(name)) {
      return;
    }

    const config = this.createDefaultConfig();

    config.http.routers[name] = {
      rule: `Host(\`${route.host}\`)`,
      service: name,
    };

    config.http.services[name] = {
      loadBalancer: {
        servers: [
          { url: `http://${route.destination}:${route.port}` },
        ],
      },
    };

    this.writeConfig(name, config);
  }

  async removeRoute(route: ServiceRoute) {
    const name = this.getRouteName(route);

    if (!this.configExists(name)) return;

    this.deleteConfig(name);
  }

  private getRouteName({ host, port, destination }: ServiceRoute): string {
    return `${host}-${destination}-${port}`;
  }

  private createDefaultConfig(): TraefikRoutesConfig {
    return {
      http: {
        routers: {},
        services: {},
      },
    };
  }

  private configExists(name: string): boolean {
    return fs.existsSync(this.getConfigPath(name));
  }

  private writeConfig(name: string, config: TraefikRoutesConfig) {
    const body = YAML.stringify(config);
    this.createConfigDir();
    fs.writeFileSync(this.getConfigPath(name), body);
  }

  private deleteConfig(name: string) {
    fs.unlinkSync(this.getConfigPath(name));
  }

  private getConfigPath(name: string): string {
    return path.join(this.getConfigDir(), `${name}.yml`);
  }

  private getConfigDir(): string {
    return path.join(Config.getConfigDir(), 'traefik');
  }

  createConfigDir() {
    const configDirPath = this.getConfigDir();

    if (!fs.existsSync(configDirPath)) {
      fs.mkdirSync(configDirPath, { recursive: true });
    }
  }
}
