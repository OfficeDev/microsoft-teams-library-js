/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { sendMessageToParent } from '../internal/communication';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from '../public';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { DialogSize } from '../public/interfaces';
import { runtime } from '../public/runtime';

/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 *  capability that allows an app (restricted to bizchat for now) to show a modal dialog.
 *  Unlike traditional URL-based dialogs that limit opening URLs with the same domain,
 *  this capability allows ME that has a different url domain to be opened within the dialog.
 *
 * It also allows chaining
 */
export namespace externalAppDialog {
  export interface ISdkResponse {
    err?: string;
    result?: string | object;
  }

  export enum DialogActionType {
    Card = 'card',
    Url = 'url',
    Text = 'text',
    Close = 'close',
  }

  export interface BaseDialogInfo {
    size?: DialogSize;
    title?: string;
  }

  interface DialogType<T extends DialogActionType> {
    type: T;
  }

  interface DialogWithUrl extends DialogType<DialogActionType.Url>, BaseDialogInfo {
    url: string;
    appId: string;
  }
  interface DialogWithAdaptiveCard extends DialogType<DialogActionType.Card>, BaseDialogInfo {
    card: string;
  }
  interface DialogWithText extends DialogType<DialogActionType.Text> {
    text: string;
  }

  export type ExternalAppDialogInfo = DialogWithUrl | DialogWithAdaptiveCard | DialogWithText;

  type CloseDialogInfo = DialogType<DialogActionType.Close>;

  export type ChainDialogInfo = CloseDialogInfo | ExternalAppDialogInfo;

  export type DialogSubmitHandler = (result: ISdkResponse) => Promise<ChainDialogInfo>;

  export function open(externalAppDialogInfo: ExternalAppDialogInfo, submitHandler: DialogSubmitHandler): void {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    // Hub dispatches an event when it recieve submit from dialog
    // when event reaches teams-js, submitHandler is called
    // submitHandler returns url/card/text dialogProps. teams-js take it, and call the chain function.
    // submitHandler can also return type: close. In that case, 'close' fucntion is called

    const handlerCalledWhenSubmitDispatched = async (sdkResponse: ISdkResponse): Promise<void> => {
      const chainDialogprops = await submitHandler?.(sdkResponse);
      chainDialogprops.type == 'close' ? close() : chain(chainDialogprops);
    };

    registerHandler('externalAppDialog.submit', handlerCalledWhenSubmitDispatched);

    //If user x-out of dialog, teams-js still calls the submitHandler with the err message
    //when the dialog is closed with close API, the submitHandler will not be called
    sendMessageToParent('externalAppDialog.open', [externalAppDialogInfo], (sdkResponse) => {
      if (sdkResponse.err) {
        submitHandler(sdkResponse);
      }
      removeHandler('handlerCalledWhenSubmitDispatched');
    });
  }

  export function chain(externalAppDialogInfo: ExternalAppDialogInfo): void {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent('externalAppDialog.chain', [externalAppDialogInfo]);
  }

  export function close(): void {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    removeHandler('handlerCalledWhenSubmitDispatched');
    sendMessageToParent('externalAppDialog.close');
  }

  export function isSupported(): boolean {
    return ensureInitialized(runtime) && (runtime.supports.dialog && runtime.supports.dialog.url) !== undefined;
  }
}
