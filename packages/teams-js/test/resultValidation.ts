import { MessageRequest } from './utils';

export enum MatcherType {
  ToBe,
  ToStrictEqual,
}

// This function will return the number of assertions used to validate a request object using
// validateRequestWithoutArguments or validateExpectedArgumentsInRequest.
// The number of assertions used changes depending on how many arguments are being validated, so
// you have to pass in the number of arguments being validated.
// The value returned from this function can be used in calls to expect.assertions() if you have them.
export function getCountOfAssertionsUsedToValidateRequest(numberOfArgumentsBeingValidated: number): number {
  return (
    countOfTestAssertionsRegardlessOfNumberOfArgumentsBeingValidated +
    (numberOfArgumentsBeingValidated === 0
      ? 0
      : countOfTestAssertionsUsedWhenThereAreArgumentsToValidateRegardlessOfHowMany +
        countOfTestAssertionsUsedToValidateEachArgument * numberOfArgumentsBeingValidated)
  );
}

// Used to validate a request object you are expecting to contain no arguments.
export function validateRequestWithoutArguments(request: MessageRequest | null, expectedFunctionName: string): void {
  validateExpectedArgumentsInRequest(request, expectedFunctionName, MatcherType.ToBe);
}

/* The following two lint rules are disabled for only this function since this function is specifically testing
 * for null and undefined as part of validation and then using those values after testing them. */
/* eslint-disable strict-null-checks/all */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

const countOfTestAssertionsRegardlessOfNumberOfArgumentsBeingValidated = 2;
const countOfTestAssertionsUsedWhenThereAreArgumentsToValidateRegardlessOfHowMany = 2;
const countOfTestAssertionsUsedToValidateEachArgument = 1;

// Used to validate a request object you are expecting to contain arguments.
export function validateExpectedArgumentsInRequest(
  request: MessageRequest | null,
  expectedFunctionName: string,
  matcher: MatcherType,
  ...expectedArgs: unknown[]
): void {
  expect(request).not.toBeNull();
  expect(request?.func).toEqual(expectedFunctionName);
  if (expectedArgs.length > 0) {
    expect(request!.args).toBeDefined();
    expect(request!.args!.length).toBe(expectedArgs.length);

    for (let i = 0; i < expectedArgs.length; ++i) {
      if (matcher === MatcherType.ToBe) {
        expect(request!.args![i]).toBe(expectedArgs[i]);
      } else if (matcher === MatcherType.ToStrictEqual) {
        expect(request!.args![i]).toStrictEqual(expectedArgs[i]);
      } else {
        throw new Error(`Unknown matcher type ${matcher}`);
      }
    }
  }
}
/* eslint-enable @typescript-eslint/no-non-null-assertion */
/* eslint-enable strict-null-checks/all */
