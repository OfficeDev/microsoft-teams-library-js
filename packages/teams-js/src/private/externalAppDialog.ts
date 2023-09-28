/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { sendMessageToParent } from '../internal/communication';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from '../public';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { BaseDialogInfo } from '../public/interfaces';
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

  export enum DialogContentType {
    Card = 'card',
    Url = 'url',
    Text = 'text',
  }

  /**
   * Base of a discriminated union between a URL based, an Adaptive Card and Text based Dialog info
   */
  interface DialogBase<T extends DialogContentType> extends BaseDialogInfo {
    type: T;
  }

  /**
   * URL based Dialog info
   */
  interface DialogWithUrl extends DialogBase<DialogContentType.Url> {
    url: string;
    appId: string;
  }
  interface DialogWithAdaptiveCard extends DialogBase<DialogContentType.Card> {
    card: string;
  }
  interface DialogWithText extends DialogBase<DialogContentType.Text> {
    text: string;
  }
  interface CloseDialog {
    type: 'close';
  }
  export type ExternalAppDialogInfo = DialogWithUrl | DialogWithAdaptiveCard | DialogWithText;
  export type ChainDialogInfo = CloseDialog | ExternalAppDialogInfo;

  export type DialogSubmitHandler = (result: ISdkResponse) => ChainDialogInfo;

  export function open(externalAppDialogInfo: ExternalAppDialogInfo, submitHandler: DialogSubmitHandler): void {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    // event is dispatched from hub when they recieve submit from dialog - with the submit data
    // when event reaches teams-js it calls the submitHandler
    // submitHandler returns url/card/text dialogProps. teams-js take it, and call the chain function.
    // If the user closes the dialog, call submitHandler with the err

    const handlerCalledWhenSubmitDispatched = (sdkResponse: ISdkResponse): void => {
      const chainDialogprops = submitHandler?.(sdkResponse);
      chainDialogprops.type == 'close' ? close() : chain(chainDialogprops);
    };

    registerHandler('submit', handlerCalledWhenSubmitDispatched);

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
