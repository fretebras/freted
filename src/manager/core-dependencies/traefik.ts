import * as execa from 'execa';
import Config from '../../config';
import Router from '../router';
import { Dependency } from './dependency';
import NetworkDependency from './network';

export default class TraefikDependency implements Dependency {
  private router = new Router();

  static identifier = 'freted-traefik';

  async isRunning(): Promise<boolean> {
    try {
      await execa('docker', [
        'inspect',
        TraefikDependency.identifier,
      ]);

      return true;
    } catch (e) {
      return false;
    }
  }

  async start(): Promise<void> {
    this.router.createConfigDir();

    await execa('docker', [
      'run',
      '--detach',
      '--rm',
      '--name', TraefikDependency.identifier,
      '--publish', `${Config.get('traefikPort', 80)}:80`,
      '--publish', `${Config.get('traefikDashboardPort', 8080)}:8080`,
      '--network', NetworkDependency.identifier,
      '--volume', '/var/run/docker.sock:/var/run/docker.sock',
      '--volume', `${Config.getConfigDir()}/traefik:/etc/traefik/dynamic`,
      'traefik:v2.3',
      '--api.insecure=true',
      '--providers.file.directory=/etc/traefik/dynamic',
      '--providers.file.watch=true',
    ]);
  }

  async stop(): Promise<void> {
    await execa('docker', [
      'stop',
      TraefikDependency.identifier,
    ]);
  }
}
