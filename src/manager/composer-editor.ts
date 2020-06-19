import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parse, stringify } from 'yaml';
import { ServiceDefinition, ComposeFile } from '../types';

export default class ComposerEditor {
  modify(composePath: string, service: ServiceDefinition): string {
    if (!service.routes) return composePath;

    const composeData = fs.readFileSync(composePath);
    const compose = parse(composeData.toString()) as ComposeFile;

    for (const serviceName of Object.keys(compose.services)) {
      const hosts = service.routes[serviceName] || [];

      compose.services[serviceName].networks = {
        ...(compose.services[serviceName].networks || {}),
        'freted-network': {
          aliases: hosts,
        },
      };

      if (hosts.length > 0) {
        const routerName = `${service.name.replace('/', '_')}_${serviceName}`;

        compose.services[serviceName].labels = [
          ...(compose.services[serviceName].labels || []),
          ...hosts.map((host) => `traefik.http.routers.${routerName}.rule=Host(\`${host}\`)`),
        ];
      } else {
        compose.services[serviceName].labels = [
          ...(compose.services[serviceName].labels || []),
          'traefik.enabled=false',
        ];
      }
    }

    compose.networks = {
      ...(compose.networks || {}),
      'freted-network': { external: true },
    };

    const tempComposePath = path.resolve(
      os.tmpdir(),
      `freted-${service.name.replace('/', '_')}-compose.yml`,
    );

    fs.writeFileSync(tempComposePath, stringify(compose));

    return tempComposePath;
  }
}
