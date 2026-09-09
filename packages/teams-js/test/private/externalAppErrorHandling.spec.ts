import { ExternalAppErrorCode } from '../../src/private/constants';
import { isExternalAppError } from '../../src/private/externalAppErrorHandling';

describe('externalAppErrorHandling', () => {
  describe('isExternalAppError', () => {
    it('should return false for non-object values', () => {
      const nonObjects = ['INTERNAL_ERROR', 42, true, false, undefined, Symbol('INTERNAL_ERROR'), () => {}];

      nonObjects.forEach((value) => {
        expect(isExternalAppError(value)).toBe(false);
      });
    });

    it('should return false for null', () => {
      expect(isExternalAppError(null)).toBe(false);
    });

    it('should return true for a valid error code with no message', () => {
      expect(isExternalAppError({ errorCode: ExternalAppErrorCode.INTERNAL_ERROR })).toBe(true);
    });

    it('should return true for a valid error code with an explicitly undefined message', () => {
      expect(isExternalAppError({ errorCode: ExternalAppErrorCode.INTERNAL_ERROR, message: undefined })).toBe(true);
    });

    it('should return true for a valid error code with a string message', () => {
      expect(
        isExternalAppError({ errorCode: ExternalAppErrorCode.INTERNAL_ERROR, message: 'something went wrong' }),
      ).toBe(true);
      expect(isExternalAppError({ errorCode: ExternalAppErrorCode.INTERNAL_ERROR, message: '' })).toBe(true);
    });

    it('should return false for a valid error code with a non-string message', () => {
      const nonStringMessages = [42, true, null, {}, [], () => {}];

      nonStringMessages.forEach((message) => {
        expect(isExternalAppError({ errorCode: ExternalAppErrorCode.INTERNAL_ERROR, message })).toBe(false);
      });
    });

    it('should return false for an unknown error code', () => {
      const unknownErrorCodes = ['UNKNOWN_ERROR', 'internal_error', 0, undefined, null];

      unknownErrorCodes.forEach((errorCode) => {
        expect(isExternalAppError({ errorCode })).toBe(false);
      });
    });

    it('should return false for an object with no errorCode', () => {
      expect(isExternalAppError({})).toBe(false);
      expect(isExternalAppError({ message: 'something went wrong' })).toBe(false);
    });

    it('should return false for an Error instance without a valid errorCode', () => {
      expect(isExternalAppError(new Error('something went wrong'))).toBe(false);
    });

    it('should return true for an Error instance augmented with a valid errorCode', () => {
      const error = Object.assign(new Error('something went wrong'), {
        errorCode: ExternalAppErrorCode.INTERNAL_ERROR,
      });

      expect(isExternalAppError(error)).toBe(true);
    });

    it('should narrow the type when used as a type guard', () => {
      const err: unknown = { errorCode: ExternalAppErrorCode.INTERNAL_ERROR, message: 'something went wrong' };

      if (isExternalAppError(err)) {
        expect(err.errorCode).toBe(ExternalAppErrorCode.INTERNAL_ERROR);
        expect(err.message).toBe('something went wrong');
      } else {
        throw new Error('Expected isExternalAppError to narrow the error type');
      }
    });
  });
});
