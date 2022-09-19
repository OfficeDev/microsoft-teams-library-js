import { version } from '../../src/internal/constants';

describe('Testing constants', () => {
  it('Ensure PACKAGE_VERSION has been properly replaced by webpack', () => {
    expect(version).toMatch(new RegExp('^[0-9]+\\.[0-9]+\\.[0-9]+$'));
  });
});
