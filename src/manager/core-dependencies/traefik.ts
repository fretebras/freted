import * as execa from 'execa';
import { Dependency } from './dependency';
import NetworkDependency from './network';

export default class TraefikDependency implements Dependency {
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
    await execa('docker', [
      'run',
      '--detach',
      '--rm',
      '--name', TraefikDependency.identifier,
      '--publish', '80:80',
      '--publish', '8080:8080',
      '--network', NetworkDependency.identifier,
      '--volume', '/var/run/docker.sock:/var/run/docker.sock',
      'traefik:v2.2',
      '--api.insecure=true',
      '--providers.docker',
      `--providers.docker.network=${NetworkDependency.identifier}`,
    ]);
  }

  async stop(): Promise<void> {
    await execa('docker', [
      'stop',
      TraefikDependency.identifier,
    ]);
  }
}
