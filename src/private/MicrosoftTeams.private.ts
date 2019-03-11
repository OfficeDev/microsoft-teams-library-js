import { ensureInitialized, sendMessageRequest } from "../internal/MicrosoftTeams.internal";
import { GlobalVars } from "../internal/GlobalVars";
import { frameContexts } from "../internal/constants";
import { ChatMembersInformation, ShowNotificationParameters, FilePreviewParameters, TeamInstanceParameters, UserJoinedTeamsInformation } from "./MicrosoftTeams.private.interface";

// ::::::::::::::::::::::: MicrosoftTeams SDK private API ::::::::::::::::::::

/**
 * Namespace to interact with the menu-specific part of the SDK.
 * This object is used to show View Configuration, Action Menu and Navigation Bar Menu.
 *
 * @private
 * Hide from docs until feature is complete
 */
export namespace menus {
  /**
   * Represents information about item in View Configuration.
   */
  export interface ViewConfiguration {
    /**
     * Unique identifier of view.
     */
    id: string;

    /**
     * Display title of the view.
     */
    title: string;

    /**
     * Additional information for accessibility.
     */
    contentDescription?: string;
  }

  /**
   * Represents information about menu item for Action Menu and Navigation Bar Menu.
   */
  export class MenuItem {
    /**
     * Unique identifier for the menu item.
     */
    public id: string;

    /**
     * Display title of the menu item.
     */
    public title: string;

    /**
     * Display icon of the menu item. The icon value must be a string having SVG icon content.
     */
    public icon?: string;

    /**
     * Selected state display icon of the menu item. The icon value must be a string having SVG icon content.
     */
    public iconSelected?: string;

    /**
     * Additional information for accessibility.
     */
    public contentDescription?: string;

    /**
     * State of the menu item
     */
    public enabled: boolean = true;

    /**
     * Interface to show list of items on selection of menu item.
     */
    public viewData: ViewData;
  }

  /**
   * Represents information about view to show on Navigation Bar Menu item selection
   */
  export interface ViewData {
    /**
     * Display header title of the item list.
     */
    listTitle?: string;

    /**
     * Type of the menu item.
     */
    listType: MenuListType;

    /**
     * Array of MenuItem. Icon value will be required for all items in the list.
     */
    listItems: MenuItem[];
  }

  /**
   * Represents information about type of list to display in Navigation Bar Menu.
   */
  export enum MenuListType {
    dropDown = "dropDown",
    popOver = "popOver"
  }

  let navBarMenuItemPressHandler: (id: string) => boolean;
  GlobalVars.handlers["navBarMenuItemPress"] = handleNavBarMenuItemPress;

  let actionMenuItemPressHandler: (id: string) => boolean;
  GlobalVars.handlers["actionMenuItemPress"] = handleActionMenuItemPress;

  let viewConfigItemPressHandler: (id: string) => boolean;
  GlobalVars.handlers["setModuleView"] = handleViewConfigItemPress;

  /**
   * Registers list of view configurations and it's handler.
   * Handler is responsible for listening selection of View Configuration.
   * @param viewConfig List of view configurations. Minimum 1 value is required.
   * @param handler The handler to invoke when the user selects view configuration.
   */
  export function setUpViews(
    viewConfig: ViewConfiguration[],
    handler: (id: string) => boolean
  ): void {
    ensureInitialized();
    viewConfigItemPressHandler = handler;
    sendMessageRequest(GlobalVars.parentWindow, "setUpViews", [viewConfig]);
  }

  function handleViewConfigItemPress(id: string): void {
    if (!viewConfigItemPressHandler || !viewConfigItemPressHandler(id)) {
      ensureInitialized();
      sendMessageRequest(GlobalVars.parentWindow, "viewConfigItemPress", [id]);
    }
  }

  /**
   * Used to set menu items on the Navigation Bar. If icon is available, icon will be shown, otherwise title will be shown.
   * @param items List of MenuItems for Navigation Bar Menu.
   * @param handler The handler to invoke when the user selects menu item.
   */
  export function setNavBarMenu(
    items: MenuItem[],
    handler: (id: string) => boolean
  ): void {
    ensureInitialized();

    navBarMenuItemPressHandler = handler;
    sendMessageRequest(GlobalVars.parentWindow, "setNavBarMenu", [items]);
  }

  function handleNavBarMenuItemPress(id: string): void {
    if (!navBarMenuItemPressHandler || !navBarMenuItemPressHandler(id)) {
      ensureInitialized();
      sendMessageRequest(GlobalVars.parentWindow, "handleNavBarMenuItemPress", [id]);
    }
  }

  export interface ActionMenuParameters {
    /**
     * Display title for Action Menu
     */
    title: string;

    /**
     * List of MenuItems for Action Menu
     */
    items: MenuItem[];
  }

  /**
   * Used to show Action Menu.
   * @param params Parameters for Menu Parameters
   * @param handler The handler to invoke when the user selects menu item.
   */
  export function showActionMenu(
    params: ActionMenuParameters,
    handler: (id: string) => boolean
  ): void {
    ensureInitialized();

    actionMenuItemPressHandler = handler;
    sendMessageRequest(GlobalVars.parentWindow, "showActionMenu", [params]);
  }

  function handleActionMenuItemPress(id: string): void {
    if (!actionMenuItemPressHandler || !actionMenuItemPressHandler(id)) {
      ensureInitialized();
      sendMessageRequest(GlobalVars.parentWindow, "handleActionMenuItemPress", [id]);
    }
  }
}

/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to retrieve information of all user joined teams
 * @param callback The callback to invoke when the {@link TeamInstanceParameters} object is retrieved.
 * @param teamInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams
 */
export function getUserJoinedTeams(
  callback: (userJoinedTeamsInformation: UserJoinedTeamsInformation) => void,
  teamInstanceParameters?: TeamInstanceParameters
): void {
  ensureInitialized();

  const messageId = sendMessageRequest(GlobalVars.parentWindow, "getUserJoinedTeams", [
    teamInstanceParameters
  ]);
  GlobalVars.callbacks[messageId] = callback;
}

/**
 * @private
 * Hide from docs.
 * ------
 * Opens a client-friendly preview of the specified file.
 * @param file The file to preview.
 */
export function openFilePreview(
  filePreviewParameters: FilePreviewParameters
): void {
  ensureInitialized(frameContexts.content);

  const params = [
    filePreviewParameters.entityId,
    filePreviewParameters.title,
    filePreviewParameters.description,
    filePreviewParameters.type,
    filePreviewParameters.objectUrl,
    filePreviewParameters.downloadUrl,
    filePreviewParameters.webPreviewUrl,
    filePreviewParameters.webEditUrl,
    filePreviewParameters.baseUrl,
    filePreviewParameters.editFile,
    filePreviewParameters.subEntityId
  ];

  sendMessageRequest(GlobalVars.parentWindow, "openFilePreview", params);
}


/**
 * @private
 * Hide from docs.
 * ------
 * display notification API.
 * @param message Notification message.
 * @param notificationType Notification type
 */
export function showNotification(
  showNotificationParameters: ShowNotificationParameters
): void {
  ensureInitialized(frameContexts.content);
  const params = [
    showNotificationParameters.message,
    showNotificationParameters.notificationType
  ];
  sendMessageRequest(GlobalVars.parentWindow, "showNotification", params);
}

/**
 * @private
 * Hide from docs.
 * ------
 * execute deep link API.
 * @param deepLink deep link.
 */
export function executeDeepLink(deepLink: string): void {
  ensureInitialized(frameContexts.content);
  const messageId = sendMessageRequest(GlobalVars.parentWindow, "executeDeepLink", [
    deepLink
  ]);
  GlobalVars.callbacks[messageId] = (success: boolean, result: string) => {
    if (!success) {
      throw new Error(result);
    }
  };
}

/**
 * @private
 * Hide from docs.
 * ------
 * Upload a custom App manifest directly to both team and personal scopes.
 * This method works just for the first party Apps.
 */
export function uploadCustomApp(manifestBlob: Blob): void {
  ensureInitialized();

  const messageId = sendMessageRequest(GlobalVars.parentWindow, "uploadCustomApp", [
    manifestBlob
  ]);
  GlobalVars.callbacks[messageId] = (success: boolean, result: string) => {
    if (!success) {
      throw new Error(result);
    }
  };
}

/**
 * @private
 * Internal use only
 * Sends a custom action message to Teams.
 * @param actionName Specifies name of the custom action to be sent
 * @param args Specifies additional arguments passed to the action
 * @returns id of sent message
 */
export function sendCustomMessage(
  actionName: string,
  // tslint:disable-next-line:no-any
  args?: any[]
): number {
  ensureInitialized();
  return sendMessageRequest(GlobalVars.parentWindow, actionName, args);
}

/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to retrieve information of all chat members
 * Because a malicious party run your content in a browser, this value should
 * be used only as a hint as to who the members are and never as proof of membership.
 * @param callback The callback to invoke when the {@link ChatMembersInformation} object is retrieved.
 */
export function getChatMembers(
  callback: (chatMembersInformation: ChatMembersInformation) => void
): void {
  ensureInitialized();

  const messageId = sendMessageRequest(GlobalVars.parentWindow, "getChatMembers");
  GlobalVars.callbacks[messageId] = callback;
}