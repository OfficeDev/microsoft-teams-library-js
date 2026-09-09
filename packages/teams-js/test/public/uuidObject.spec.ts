import { UUID, validateUuidInstance } from '../../src/public/uuidObject';

describe('validateUuidInstance', () => {
  test('should throw error when id is an object but not an instance of UUID', () => {
    expect(() => validateUuidInstance({ Object: 'object' } as unknown as UUID)).toThrowError(
      'Potential id ({"Object":"object"}) is invalid; it is not an instance of UUID class.',
    );
  });

  test('should throw error when id is an instance of a class other than UUID', () => {
    class NotUuid {}
    const notUuidInstance = new NotUuid();
    expect(() => validateUuidInstance(notUuidInstance as unknown as UUID)).toThrowError(
      'Potential id ({}) is invalid; it is not an instance of UUID class.',
    );
  });

  test('should not throw error when id is an instance of UUID', () => {
    const uuidInstance = new UUID('8e6523aa-97f9-49ad-8614-75cae22f6597');
    expect(() => validateUuidInstance(uuidInstance)).not.toThrow();
  });
});
