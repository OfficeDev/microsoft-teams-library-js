import { MessageRequest } from './utils';

export enum MatcherType {
  ToBe,
  ToStrictEqual,
}

export interface MatcherAndArguments {
  matcher: MatcherType;
  arguments: unknown[];
}

export function validateRequestWithoutArguments(request: MessageRequest | null): void {
  validateExpectedArgumentsInRequest(request, MatcherType.ToBe);
}

/* The following two lint rules are disabled for only this function since this function is specifically testing
 * for null and undefined as part of validation and then using those values after testing them. */
/* eslint-disable strict-null-checks/all */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function validateExpectedArgumentsInRequest(
  request: MessageRequest | null,
  matcher: MatcherType,
  ...expectedArgs: unknown[]
): void {
  expect(request).not.toBeNull();
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
