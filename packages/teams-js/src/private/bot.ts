/* eslint-disable @typescript-eslint/no-explicit-any */

import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { runtime } from '../public/runtime';

/**
 * @hidden
 * Namespace to interact with bots using the SDK.
 *
 * @alpha
 */
export namespace bot {
  /**
   * @hidden
   * Hide from docs until release.
   * ------
   * Sends query to bot in order to retrieve data.
   *
   * @param botRequest - query to send to bot.
   * @param onSuccess - callback to invoke when data is retrieved from bot
   * @param onError - callback to invoke should an error occur
   */
  export function sendQuery(
    botRequest: QueryRequest,
    onSuccess?: (data: QueryResponse) => void,
    onError?: (error: string) => void,
  ): void {
    ensureInitialized();

    sendMessageToParent('bot.executeQuery', [botRequest], (success: boolean, response: string | QueryResponse) => {
      if (success) {
        onSuccess(response as QueryResponse);
      } else {
        onError(response as string);
      }
    });
  }

  /**
   * @hidden
   * Hide from docs until release.
   * -----
   * Retrieves list of support commands from bot
   *
   * @param onSuccess - callback to invoke when data is retrieved from bot
   * @param onError - callback to invoke should an error occur
   */
  export function getSupportedCommands(
    onSuccess?: (response: Command[]) => void,
    onError?: (error: string) => void,
  ): void {
    ensureInitialized();

    sendMessageToParent('bot.getSupportedCommands', (success: boolean, response: string | Command[]) => {
      if (success) {
        onSuccess(response as Command[]);
      } else {
        onError(response as string);
      }
    });
  }

  /**
   * @hidden
   * Hide from docs until release.
   * -----
   * Authenticates a user for json tab
   *
   * @param authRequest - callback to invoke when data is retrieved from bot
   * @param onSuccess - callback to invoke when user is authenticated
   * @param onError - callback to invoke should an error occur
   */
  export function authenticate(
    authRequest: AuthQueryRequest,
    onSuccess?: (results: Results) => void,
    onError?: (error: string) => void,
  ): void {
    ensureInitialized();

    sendMessageToParent('bot.authenticate', [authRequest], (success: boolean, response: string | Results) => {
      if (success) {
        onSuccess(response as Results);
      } else {
        onError(response as string);
      }
    });
  }

  export interface QueryRequest {
    /**
     * @hidden
     * Query to search for
     */
    query: string;
    commandId?: string;
    option?: {
      skip: number;
      count: number;
    };
  }

  export interface Results {
    attachments: Attachment[];
    layout: any;
    botId: string;
  }

  export interface Auth {
    url: string;
    title: string;
  }

  export type ResponseType = 'Results' | 'Auth';
  interface Response<T extends ResponseType> {
    type: T;
  }
  export interface ResultResponse extends Response<'Results'> {
    data: Results;
  }
  export interface AuthResponse extends Response<'Auth'> {
    data: Auth;
  }
  export type QueryResponse = ResultResponse | AuthResponse;

  export interface AuthQueryRequest extends QueryRequest {
    url: string;
  }

  export interface Attachment {
    card: any;
    previewCard: any;
    previewRawPayload: any;
    rawPayload: any;
  }

  export interface Command {
    title: string;
    id: string;
    initialRun: boolean;
  }

  export function isSupported(): boolean {
    return runtime.supports.bot ? true : false;
  }
}
