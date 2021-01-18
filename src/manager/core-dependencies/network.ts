import * as execa from 'execa';
import { Dependency } from './dependency';

export default class NetworkDependency implements Dependency {
  static identifier = 'freted-network';

  async isRunning(): Promise<boolean> {
    try {
      await execa('docker', [
        'network',
        'inspect',
        NetworkDependency.identifier,
      ]);

      return true;
    } catch (e) {
      return false;
    }
  }

  async start(): Promise<void> {
    await execa('docker', [
      'network',
      'create',
      NetworkDependency.identifier,
    ]);
  }

  async stop(): Promise<void> {
    if (this.hasConnections()) {
      return;
    }

    await execa('docker', [
      'network',
      'rm',
      NetworkDependency.identifier,
    ]);
  }

  private async hasConnections(): Promise<boolean> {
    const data = await execa('docker', [
      'network',
      'inspect',
      NetworkDependency.identifier,
    ]);

    const [network] = JSON.parse(data.stdout);

    return Object.keys(network.Containers).length > 0;
  }
}
