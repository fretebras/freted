import * as execa from 'execa';
import NetworkDependency from './core-dependencies/network';

export default class Network {
  async connectContainer(name: string) {
    if (this.isContainerConnected(name)) {
      return;
    }

    await execa('docker', [
      'network',
      'connect',
      NetworkDependency.identifier,
      name,
    ]);
  }

  private async isContainerConnected(name: string): Promise<boolean> {
    const data = await execa('docker', [
      'inspect',
      name,
    ]);

    const [container] = JSON.parse(data.stdout);

    return Object.keys(container.NetworkSettings.Networks)
      .includes(NetworkDependency.identifier);
  }
}
