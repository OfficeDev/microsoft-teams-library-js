import { flushMessageQueue, getMessageIdsAsLogString } from '../../src/internal/communicationUtils';
import { UUID } from '../../src/public';

describe('communicationUtils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMessageIdsAsLogString', () => {
    it('if uuidAsString field is set, it should return it in log', () => {
      const message = { uuidAsString: 'uuidAsString', id: 3 };
      const result = getMessageIdsAsLogString(message);
      expect(result).toBe('uuidAsString (legacy id: 3)');
    });

    it('if uuid field is set, is should return it as a string in the log', () => {
      const mockUUID = { toString: jest.fn(() => 'uuid') } as unknown as UUID;
      const message = { uuid: mockUUID, id: 3 };
      const result = getMessageIdsAsLogString(message);
      expect(mockUUID.toString).toHaveBeenCalled();
      expect(result).toBe('uuid (legacy id: 3)');
    });

    it('if only id is present it should return it in log', () => {
      const message = { id: 3 };
      const result = getMessageIdsAsLogString(message);
      expect(result).toBe('legacy id: 3 (no uuid)');
    });
  });

  describe('flushMessageQueue', () => {
    it('if target window is null it should not change target queue', () => {
      const targetWindow = null;
      const targetOrigin = 'origin';
      const targetMessageQueue = [{ id: 1, func: 'func' }];
      const target = 'top';
      flushMessageQueue(targetWindow, targetOrigin, targetMessageQueue, target);
      expect(targetMessageQueue).toEqual([{ id: 1, func: 'func' }]);
    });

    it('if target origin is null it should not change target queue', () => {
      const targetWindow = { postMessage: jest.fn() } as unknown as Window;
      const targetOrigin = null;
      const targetMessageQueue = [{ id: 1, func: 'func' }];
      const target = 'top';
      flushMessageQueue(targetWindow, targetOrigin, targetMessageQueue, target);
      expect(targetMessageQueue).toEqual([{ id: 1, func: 'func' }]);
    });

    it('if target window and origin are not null it should empty the target queue in-place', () => {
      const targetWindow = { postMessage: jest.fn() } as unknown as Window;
      const targetOrigin = 'origin';
      const targetMessageQueue = [{ id: 1, func: 'func' }];
      const target = 'top';
      flushMessageQueue(targetWindow, targetOrigin, targetMessageQueue, target);
      expect(targetMessageQueue).toEqual([]);
    });
  });
});
