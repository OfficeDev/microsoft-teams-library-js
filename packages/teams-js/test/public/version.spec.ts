import { version } from '../../src/public/version';

describe('Testing version constant', () => {
  it('Ensure PACKAGE_VERSION has been properly replaced by webpack (or Jest)', () => {
    expect(version).toMatch(new RegExp('^[0-9]+\\.[0-9]+\\.[0-9]+$'));
  });
});
