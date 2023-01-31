import { version } from '../../src/public/version';

// This is a regular expression that matches any valid semVer version number. It was sourced from here:
// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const semVerRegularExpressionAsString =
  '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$';

describe('Testing version constant', () => {
  it('Ensure PACKAGE_VERSION has been properly replaced by webpack (or Jest)', () => {
    expect(version).toMatch(new RegExp(semVerRegularExpressionAsString));
  });
});
