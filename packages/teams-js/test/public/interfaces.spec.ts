import { ErrorCode, isSdkError } from '../../src/public/interfaces';

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
      const unrecognizedErrorCodes = ['INTERNAL_ERROR', 'not a code', -1, 0, null, {}];

      unrecognizedErrorCodes.forEach((errorCode) => {
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

    it('should return true when errorCode is inherited from the prototype chain', () => {
      const error = Object.create({ errorCode: ErrorCode.INTERNAL_ERROR });

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
