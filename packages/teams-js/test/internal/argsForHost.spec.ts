import { ArgsForHost } from '../../src/internal/argsForHost';

describe('ArgsForHost', () => {
  describe('getSerializableArgs', () => {
    test('should return undefined if there are no args', () => {
      const argsForHost = new ArgsForHost(undefined);
      expect(argsForHost.getSerializableArgs()).toBeUndefined();
    });
    test('should return return an empty array if the args are an empty array', () => {
      const argsForHost = new ArgsForHost([]);
      expect(argsForHost.getSerializableArgs()).toEqual([]);
    });
    test('should return the same array if all args are simple types', () => {
      const argsForHost = new ArgsForHost(['a', 1, true, null, undefined]);
      expect(argsForHost.getSerializableArgs()).toEqual(['a', 1, true, null, undefined]);
    });
    test('should return the serializable object for each arg if they are serializable', () => {
      const serializableArg1 = { getSerializableObject: () => 'serializableArg1' };
      const serializableArg2 = { getSerializableObject: () => 'serializableArg2' };
      const argsForHost = new ArgsForHost([serializableArg1, serializableArg2]);
      expect(argsForHost.getSerializableArgs()).toEqual(['serializableArg1', 'serializableArg2']);
    });
    test('should return a mix of serializable objects and simple types', () => {
      const serializableArg = { getSerializableObject: () => 'serializableArg' };
      const argsForHost = new ArgsForHost([serializableArg, 'a', 1, true, null, undefined]);
      expect(argsForHost.getSerializableArgs()).toEqual(['serializableArg', 'a', 1, true, null, undefined]);
    });
  });
});
