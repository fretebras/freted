import * as path from 'path';
import * as execa from 'execa';
import { ServiceDefinition } from '../types';
import dependencies from './dependencies';
import { resolveRepositoryPath } from '../helpers/path';

export default class ManagerService {
  async start(services: ServiceDefinition[], onUpdate: (message: string) => void): Promise<void> {
    await this.startDependencies();

    for (const service of services) {
      const subprocess = execa('docker-compose', [
        ...this.getComposeArgsForService(service),
        'up',
        '--detach',
        '--no-color',
        '--remove-orphans',
        '--build',
      ]);

      subprocess.stdout.on('data', (data) => onUpdate(data.toString()));

      await subprocess;
    }
  }

  async stop(services: ServiceDefinition[]): Promise<void> {
    for (const service of services) {
      await execa('docker-compose', [
        ...this.getComposeArgsForService(service),
        'down',
        '--remove-orphans',
      ]);
    }

    await this.stopDependencies();
  }

  private async startDependencies(): Promise<void> {
    for (const dependency of dependencies) {
      if (await dependency.isRunning()) continue;
      await dependency.start();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  private async stopDependencies(): Promise<void> {
    for (const dependency of [...dependencies].reverse()) {
      if (!await dependency.isRunning()) continue;
      await dependency.stop();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  private getComposeArgsForService(service: ServiceDefinition): string[] {
    const projectPath = resolveRepositoryPath(service);
    const composePath = path.resolve(projectPath, 'docker-compose.yml');

    return [
      '--no-ansi',
      '--project-name', service.name.replace(/\//g, '-'),
      '--project-directory', projectPath,
      '-f', composePath,
    ];
  }
}
