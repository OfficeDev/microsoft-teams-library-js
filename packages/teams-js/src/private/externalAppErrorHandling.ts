import { ExternalAppErrorCode } from './constants';

/**
 * @hidden
 * Error object that can be thrown from externalAppCommands, externalAppCardCommands and other external app APIs
 * @internal
 * Limited to Microsoft-internal use
 */
export interface ExternalAppError {
  errorCode: ExternalAppErrorCode;
  message?: string;
}

/**
 * @hidden
 * Determines if the provided error object is an instance of ExternalAppError
 * @internal
 * Limited to Microsoft-internal use
 * @param err The error object to check whether it is of ExternalAppError type
 */
export function isExternalAppError(err: unknown): err is ExternalAppError {
  if (typeof err !== 'object' || err === null) {
    return false;
  }

  const error = err as ExternalAppError;

  return (
    Object.values(ExternalAppErrorCode).includes(error.errorCode) &&
    (error.message === undefined || typeof error.message === 'string')
  );
}
