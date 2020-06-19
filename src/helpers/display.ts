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
    lines.push(`## ${service.name}`);
    if (service.welcomeText) lines.push(service.welcomeText);
  }

  console.log('');
  console.log(marked(lines.join('\n')));
};
