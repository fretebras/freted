import * as execa from 'execa';
import { ServiceDefinition } from '../types';
import dependencies from './core-dependencies';

export default class ManagerService {
  async setup(
    service: ServiceDefinition,
    onUpdate: (message: string) => void,
  ): Promise<void> {
    if (service.config?.setup) {
      await this.runCommands(service.localPath, service.config.setup, onUpdate);
    }
  }

  async start(
    service: ServiceDefinition,
    onUpdate: (message: string) => void,
  ): Promise<void> {
    await this.startDependencies();

    if (service.config?.start) {
      await this.runCommands(service.localPath, service.config.start, onUpdate);
    }
  }

  async stop(service: ServiceDefinition): Promise<void> {
    if (service.config?.stop) {
      await this.runCommands(service.localPath, service.config.stop);
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

  private async runCommands(cwd: string, commands: string[], onUpdate?: (message: string) => void) {
    for (const command of commands) {
      const subprocess = execa.command(command, { cwd });

      if (onUpdate) {
        subprocess.stdout.on('data', (data) => onUpdate(data.toString()));
      }

      await subprocess;
    }
  }
}
