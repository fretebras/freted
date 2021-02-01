import * as fs from 'fs';
import * as path from 'path';
import { ServiceDefinition } from '../../types';
import { ResolverInterface } from './resolver';
import Config from '../../config';
import ServiceDefinitionBuilder from '../service-builder';
import ConfigParser from '../config-parser';

export default class LocalResolver implements ResolverInterface {
  private parser = new ConfigParser();

  private maxDepth = 4;

  async resolve(serviceName: string): Promise<ServiceDefinition | undefined> {
    const workspacePath = Config.getWorkspacePath();
    this.ensureDirectoryExists(workspacePath);
    return this.findServiceAt(serviceName, workspacePath);
  }

  private async findServiceAt(
    serviceName: string,
    currentPath: string,
    depth: number = 0,
  ): Promise<ServiceDefinition | undefined> {
    if (depth >= this.maxDepth) {
      return undefined;
    }

    const files = fs.readdirSync(currentPath);

    if (files.includes('freted.yml')) {
      return this.loadServiceAt(serviceName, currentPath);
    }

    for (const file of files) {
      const filePath = path.resolve(currentPath, file);

      if (fs.lstatSync(filePath).isDirectory()) {
        const service = await this.findServiceAt(serviceName, filePath, depth + 1);

        if (service) {
          return service;
        }
      }
    }

    return undefined;
  }

  private async loadServiceAt(
    serviceName: string,
    servicePath: string,
  ): Promise<ServiceDefinition | undefined> {
    const configPath = path.resolve(servicePath, 'freted.yml');
    const configContent = fs.readFileSync(configPath);

    try {
      const config = this.parser.parse(configContent.toString());
  
      if (config.name !== serviceName) {
        return undefined;
      }
  
      return new ServiceDefinitionBuilder(servicePath)
        .setConfig(config)
        .build();
    } catch (e) {
      throw new Error(`Failed loading config at ${configPath}: ${e.message}`);
    }
  }

  private ensureDirectoryExists(directory_path: string) {
    fs.mkdirSync(directory_path, {
      recursive: true,
    });
  }
}
