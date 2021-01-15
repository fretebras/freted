import * as sudo from 'sudo-prompt';
import { ServiceDefinition } from '../types';

export default class HostsEditor {
  async addHosts(services: ServiceDefinition[]): Promise<void> {
    const hosts = this.getHostsList(services);
    const content = hosts.map((h) => `127.0.0.1 ${h}`).join('\n');

    return new Promise((resolve, reject) => {
      sudo.exec(`echo '${content}' >> /etc/hosts`, { name: 'freted' }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async removeHosts(services: ServiceDefinition[]): Promise<void> {
    const hosts = this.getHostsList(services);
    const command = hosts.map((h) => `sed -i '' '/${h}/d' /etc/hosts`).join(' && ');

    return new Promise((resolve, reject) => {
      sudo.exec(command, { name: 'freted' }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private getHostsList(services: ServiceDefinition[]): string[] {
    return services.filter((service) => service.config?.routes)
      .map<string[]>((service) => service.config!.routes!.map(route => route.host))
      .reduce((values, nextValue) => {
        values.push(...nextValue);
        return values;
      }, [])
      .map((hostString) => {
        try {
          return new URL(hostString).host;
        } catch (_) {
          return hostString;
        }
      });
  }
}
