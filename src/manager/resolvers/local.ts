import * as fs from 'fs';
import * as path from 'path';
import { ServiceDefinition } from '../../types';
import { ResolverInterface } from './resolver';
import Config from '../../config';

export default class LocalResolver implements ResolverInterface {
  async resolve(serviceName: string): Promise<ServiceDefinition | undefined> {
    const workspacePath = Config.getWorkspacePath();

    for (const providerPath of fs.readdirSync(workspacePath)) {
      const repositoryPath = path.resolve(workspacePath, providerPath, serviceName);
      const configPath = path.resolve(repositoryPath, 'freted.json');

      if (fs.existsSync(configPath)) {
        const body = fs.readFileSync(configPath);
        const config = JSON.parse(body.toString());

        return {
          name: serviceName,
          url: `https://${providerPath}/${serviceName}`,
          cloneUrl: '',
          ...config,
        };
      }
    }

    return undefined;
  }
}
