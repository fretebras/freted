import { Command } from '@oclif/command';
import * as execa from 'execa';
import { terminal } from 'terminal-kit';

export default class Logs extends Command {
  static description = 'show services logs';

  static examples = [
    '$ freted logs',
  ];

  async run() {
    const { stdout } = await execa('docker', ['ps', '--format', '{{.Names}}']);

    const printLog = (container: string, data: Buffer) => {
      terminal.green(`=== [stdout] ${container} ===\n`).defaultColor(`${data.toString()}\n`);
    };

    const printError = (container: string, data: Buffer) => {
      terminal.red(`=== [stderr] ${container} ===\n`).defaultColor(`${data.toString()}\n`);
    };

    const listeners = [];

    for (const container of stdout.split('\n')) {
      const listener = execa('docker', ['logs', '-f', container]);

      listener.stdout.on('data', (data) => {
        printLog(container, data);
      });

      listener.stderr.on('data', (data) => {
        printError(container, data);
      });

      listeners.push(listener);
    }

    await Promise.all(listeners);
  }
}
