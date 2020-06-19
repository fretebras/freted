import { ServiceDefinition, ComposeFile } from '../../types';

export default class ComposeFileParser {
  parse(composeFile: ComposeFile): Partial<ServiceDefinition> {
    const routes: { [ serviceName: string ]: string[] } = {};

    for (const serviceName of Object.keys(composeFile.services)) {
      const { labels } = composeFile.services[serviceName];
      if (!labels || labels.length === 0) continue;

      routes[serviceName] = [];

      for (const label of labels) {
        const [key, value] = label.split('=', 2);

        if (key === 'freted.host') {
          routes[serviceName].push(value);
        }
      }
    }

    return { routes };
  }
}
