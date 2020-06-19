import * as path from 'path';
import * as execa from 'execa';
import { ServiceDefinition } from '../types';
import dependencies from './core-dependencies';
import ComposerEditor from './composer-editor';

export default class ManagerService {
  private composerEditor = new ComposerEditor();

  async start(
    services: ServiceDefinition[],
    rebuild: boolean,
    onUpdate: (message: string) => void,
  ): Promise<void> {
    await this.startDependencies();

    for (const service of services) {
      const args = [
        ...this.getComposeArgsForService(service),
        'up',
        '--detach',
        '--no-color',
        '--remove-orphans',
      ];

      if (rebuild) args.push('--build');

      const subprocess = execa('docker-compose', args);
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
    const composePath = path.resolve(service.localPath, 'docker-compose.yml');

    return [
      '--no-ansi',
      '--project-name', service.name.replace(/\//g, '-'),
      '--project-directory', service.localPath,
      '-f', this.composerEditor.modify(composePath, service),
    ];
  }
}
