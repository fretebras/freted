import { ServiceDefinition } from '../../types';

const WELCOME_TOKEN = 'welcome';
const DEPENDENCIES_TOKEN = 'dependencies';

export default class ReadmeFileParser {
  parse(readme: string): Partial<ServiceDefinition> {
    const welcomeText = this.parseSection(readme, WELCOME_TOKEN);
    const [dependencies, optionalDependencies] = this.parseDependencies(readme);

    return {
      welcomeText,
      dependencies,
      optionalDependencies,
    };
  }

  private parseSection(readme: string, token: string): string | undefined {
    const startToken = `<!-- ${token} -->`;

    const start = readme.indexOf(startToken);
    if (start < 0) return undefined;

    const end = readme.indexOf(`<!-- ${token}stop -->`);
    if (end < 0) return undefined;

    return readme.substring(start + startToken.length, end).trim();
  }

  private parseDependencies(readme: string): [ string[], string[] ] {
    const section = this.parseSection(readme, DEPENDENCIES_TOKEN);
    if (!section) return [[], []];

    const dependencies: string[] = [];
    const optionalDependencies: string[] = [];

    for (const line of section?.split('\n')) {
      const match = line.match(/\[(.*)\]\(.*\)/);

      if (match) {
        const serviceName = match[1];

        if (serviceName.indexOf('(optional)') >= 0) {
          optionalDependencies.push(serviceName.replace('(optional)', '').trim());
          continue;
        }

        dependencies.push(serviceName.trim());
      }
    }

    return [dependencies, optionalDependencies];
  }
}
