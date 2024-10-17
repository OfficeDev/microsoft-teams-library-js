// Since there are plenty of tests validating the individual validation functionality, these tests are intentionally not as

import { isSerializable } from '../../src/public/serializable.interface';

// comprehensive as those. It executes a few basic tests and also validates that the error messages thrown are as expected.
describe('isSerialiazable', () => {
  test('should return false if arg is undefined', () => {
    expect(isSerializable(undefined)).toBe(false);
  });
  test('should return false if arg is null', () => {
    expect(isSerializable(null)).toBe(false);
  });
  test('should return false if arg does not contain a member named serialize', () => {
    expect(isSerializable({ name: 'test' })).toBe(false);
  });
  test('should return false if arg does not contain a function named serialize', () => {
    expect(isSerializable({ serialize: 'test' })).toBe(false);
  });
  test('should return true if arg contains a function named serialize', () => {
    expect(isSerializable({ serialize: () => {} })).toBe(true);
  });
});
