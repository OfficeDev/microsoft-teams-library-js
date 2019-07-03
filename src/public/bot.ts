import { GlobalVars } from '../internal/globalVars';
import { ensureInitialized, sendMessageRequest } from '../internal/internalAPIs';

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
   * @param onBotQueryResponse callback to invoke when data is retrieved from bot
   * @param onError callback to invoke should an error occur
   */
  export function sendQuery(
    botRequest: QueryRequest,
    onBotQueryResponse?: (data: QueryResponse) => void,
    onError?: (error: string) => void,
  ): void {
    ensureInitialized();

    const messageId = sendMessageRequest(GlobalVars.parentWindow, 'bot.executeQuery', [botRequest]);

    GlobalVars.callbacks[messageId] = (success: boolean, response: string | QueryResponse) => {
      if (success) {
        onBotQueryResponse(response as QueryResponse);
      } else {
        onError(response as string);
      }
    };
  }
  /**
   * @private
   * Hide from docs until release.
   * -----
   * Retrieves list of support commands from bot
   * @param onBotQueryResponse callback to invoke when data is retrieved from bot
   * @param onError callback to invoke should an error occur
   */
  export function getSupportedCommands(
    onBotGetCommandsResponse?: (response: Command[]) => void,
    onError?: (error: string) => void,
  ): void {
    ensureInitialized();

    const messageId = sendMessageRequest(GlobalVars.parentWindow, 'bot.getSupportedCommands');

    GlobalVars.callbacks[messageId] = (success: boolean, response: string | Command[]) => {
      if (success) {
        onBotGetCommandsResponse(response as Command[]);
      } else {
        onError(response as string);
      }
    };
  }

  export interface QueryRequest {
    /**
     * Query to search for
     */
    query: string;
    commandId?: string;
  }

  export interface QueryResponse {
    attachments: Attachment[];
    layout: any;
    botId: string;
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
    isInitialRun: boolean;
  }
}
