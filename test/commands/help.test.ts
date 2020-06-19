import { expect, test } from '@oclif/test';

describe('help', () => {
  test
    .stdout()
    .command(['help'])
    .it('runs help', (ctx) => {
      expect(ctx.stdout).to.contain('display help for freted');
    });
});
