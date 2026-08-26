import { isNullOrUndefined } from '../../src/internal/typeCheckUtilities';

describe('isNullOrUndefined', () => {
  it('should return true for null', () => {
    expect(isNullOrUndefined(null)).toBe(true);
  });

  it('should return true for undefined', () => {
    expect(isNullOrUndefined(undefined)).toBe(true);
  });

  it('should return true when no argument is passed', () => {
    expect(isNullOrUndefined()).toBe(true);
  });

  // The callers of this function (for example handlers.ts and appHelpers.ts) rely on it being a
  // nullish check rather than a falsy check, so that falsy-but-defined values are still treated as
  // real values. Simplifying the implementation to `!value` would silently break those callers.
  it.each([
    ['zero', 0],
    ['negative zero', -0],
    ['empty string', ''],
    ['false', false],
    ['NaN', NaN],
    ['zero bigint', BigInt(0)],
  ])('should return false for the falsy value %s', (_name, value) => {
    expect(isNullOrUndefined(value)).toBe(false);
  });

  it.each([
    ['a non-empty string', 'value'],
    ['a non-zero number', 42],
    ['true', true],
    ['an empty object', {}],
    ['an empty array', []],
    ['a function', (): void => {}],
    ['a symbol', Symbol('symbol')],
  ])('should return false for the truthy value %s', (_name, value) => {
    expect(isNullOrUndefined(value)).toBe(false);
  });

  it('should return false for a handler function, so that handler registration is not skipped', () => {
    const handler = (): void => {};
    expect(isNullOrUndefined(handler)).toBe(false);
  });
});
