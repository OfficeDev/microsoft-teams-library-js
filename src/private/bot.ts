import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';

/**
 * @private
 * Namespace to interact with bots using the SDK.
 */
export namespace bot {
  /**
   * @private
   * Hide from docs until release.
   * ------
   * Sends query to bot in order to retrieve data.
   * @param botRequest query to send to bot.
   * @param onSuccess callback to invoke when data is retrieved from bot
   * @param onError callback to invoke should an error occur
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
   * @private
   * Hide from docs until release.
   * -----
   * Retrieves list of support commands from bot
   * @param onSuccess callback to invoke when data is retrieved from bot
   * @param onError callback to invoke should an error occur
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
   * @private
   * Hide from docs until release.
   * -----
   * Authenticates a user for json tab
   * @param authRequest callback to invoke when data is retrieved from bot
   * @param onSuccess callback to invoke when user is authenticated
   * @param onError callback to invoke should an error occur
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
     * Query to search for
     */
    query: string;
    commandId?: string;
    option?: {
      skip: number;
      count: number;
    };
  }

  export interface QueryResponse {
    data: Results | Auth;
    type: ResponseType;
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

  export enum ResponseType {
    Results = 'Results',
    Auth = 'Auth',
  }
}
