import { ErrorCode, isSdkError } from '../../src/public/interfaces';

/**
 * isSdkError is a presence-only guard: it returns true for any value whose `errorCode` property is
 * defined, without checking that the code belongs to ErrorCode or that `message` is a string. The
 * assertions below deliberately lock in that current behavior rather than the stricter behavior the
 * SdkError type implies, so they will fail loudly if the guard is ever tightened.
 */
describe('interfaces', () => {
  describe('isSdkError', () => {
    it('should return false for non-object values', () => {
      const nonObjects = ['INTERNAL_ERROR', 42, true, false, undefined, Symbol('INTERNAL_ERROR'), () => {}];

      nonObjects.forEach((value) => {
        expect(isSdkError(value)).toBe(false);
      });
    });

    it('should return false for null', () => {
      expect(isSdkError(null)).toBe(false);
    });

    it('should return true for every ErrorCode value', () => {
      const errorCodes = Object.values(ErrorCode).filter((value): value is ErrorCode => typeof value === 'number');

      expect(errorCodes.length).toBeGreaterThan(0);
      errorCodes.forEach((errorCode) => {
        expect(isSdkError({ errorCode })).toBe(true);
      });
    });

    it('should return true for a valid error code with an explicitly undefined message', () => {
      expect(isSdkError({ errorCode: ErrorCode.INTERNAL_ERROR, message: undefined })).toBe(true);
    });

    it('should return true for a valid error code with a string message', () => {
      expect(isSdkError({ errorCode: ErrorCode.INTERNAL_ERROR, message: 'something went wrong' })).toBe(true);
      expect(isSdkError({ errorCode: ErrorCode.INTERNAL_ERROR, message: '' })).toBe(true);
    });

    it('should return true for a valid error code with a non-string message, since the message is not validated', () => {
      const nonStringMessages = [42, true, null, {}, [], () => {}];

      nonStringMessages.forEach((message) => {
        expect(isSdkError({ errorCode: ErrorCode.INTERNAL_ERROR, message })).toBe(true);
      });
    });

    it('should return false for an object with no errorCode', () => {
      expect(isSdkError({})).toBe(false);
      expect(isSdkError({ message: 'something went wrong' })).toBe(false);
    });

    it('should return false when errorCode is explicitly undefined', () => {
      expect(isSdkError({ errorCode: undefined })).toBe(false);
      expect(isSdkError({ errorCode: undefined, message: 'something went wrong' })).toBe(false);
    });

    it('should return true for an unrecognized errorCode, since only its presence is checked', () => {
      const unrecognizedErrorCodes = ['not a code', -1, 0, null, {}];

      // Guard against picking a value that is actually part of ErrorCode. Object.values on a numeric
      // TypeScript enum yields both the numeric members and their reverse-mapped string names, so a
      // name such as 'INTERNAL_ERROR' would not be unrecognized.
      const errorCodeValues: unknown[] = Object.values(ErrorCode);
      unrecognizedErrorCodes.forEach((errorCode) => {
        expect(errorCodeValues).not.toContain(errorCode);
        expect(isSdkError({ errorCode })).toBe(true);
      });
    });

    it('should return false for an Error instance without an errorCode', () => {
      expect(isSdkError(new Error('something went wrong'))).toBe(false);
    });

    it('should return true for an Error instance augmented with an errorCode', () => {
      const error = Object.assign(new Error('something went wrong'), { errorCode: ErrorCode.INTERNAL_ERROR });

      expect(isSdkError(error)).toBe(true);
    });

    it('should narrow the type when used as a type guard', () => {
      const err: unknown = { errorCode: ErrorCode.INTERNAL_ERROR, message: 'something went wrong' };

      if (isSdkError(err)) {
        expect(err.errorCode).toBe(ErrorCode.INTERNAL_ERROR);
        expect(err.message).toBe('something went wrong');
      } else {
        throw new Error('Expected isSdkError to narrow the error type');
      }
    });
  });
});
