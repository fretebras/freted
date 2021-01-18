/* eslint-disable import/prefer-default-export */
import * as marked from 'marked';
import * as TerminalRenderer from 'marked-terminal';
import { ServiceDefinition } from '../types';

marked.setOptions({
  renderer: new TerminalRenderer(),
});

export const printServices = (services: ServiceDefinition[]) => {
  const lines: string[] = ['# Services summary'];

  for (const service of services) {
    if (!service.config) continue;

    lines.push(`## ${service.config.name}`);

    if (service.config.instructions) {
      lines.push(...service.config.instructions);
    }

    if (service.config.credentials) {
      lines.push('### Credentials');

      for (const item of service.config.credentials) {
        const { name, description, ...fields } = item;

        lines.push(`**${name}** - *${description}*`);

        for (const fieldName in fields) {
          lines.push(`**${fieldName}**: \`${fields[fieldName]}\``);
        }

        lines.push('');
      }
    }
  }

  if (services.some((s) => s.config?.routes?.length)) {
    lines.push('# Hosts');
    lines.push('Add the following hosts to your hosts file.');
    lines.push('\n');

    for (const service of services) {
      if (!service.config?.routes) continue;

      for (const route of service.config.routes) {
        lines.push(`**${route.host}**`);
      }
    }
  }

  process.stdout.write('\n\n');
  process.stdout.write(marked(lines.join('\n')));
};
