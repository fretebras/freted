import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'yaml';
import { ServiceDefinition } from '../../types';
import { ResolverInterface } from './resolver';
import Config from '../../config';
import ServiceDefinitionBuilder from '../service-builder';

export default class LocalResolver implements ResolverInterface {
  async resolve(serviceName: string): Promise<ServiceDefinition | undefined> {
    const workspacePath = Config.getWorkspacePath();

    for (const providerPath of fs.readdirSync(workspacePath)) {
      const repositoryPath = path.resolve(workspacePath, providerPath, serviceName);
      const composePath = path.resolve(repositoryPath, 'docker-compose.yml');
      const readmePath = path.resolve(repositoryPath, 'README.md');

      if (fs.existsSync(composePath)) {
        const composeData = fs.readFileSync(composePath);
        const readmeData = fs.readFileSync(readmePath);
        const composeFile = parse(composeData.toString());
        const readmeFile = readmeData.toString();

        return ServiceDefinitionBuilder.new(serviceName, repositoryPath)
          .setComposeFile(composeFile)
          .setReadmeFile(readmeFile)
          .build();
      }
    }

    return undefined;
  }
}
