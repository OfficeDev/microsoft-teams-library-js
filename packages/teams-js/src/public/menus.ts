import { sendMessageToParent } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { runtime } from '../public/runtime';
import { errorNotSupportedOnPlatform } from './constants';

/**
 * Namespace to interact with the menu-specific part of the SDK.
 * This object is used to show View Configuration, Action Menu and Navigation Bar Menu.
 */
export namespace menus {
  /**
   * @hidden
   * Represents information about item in View Configuration.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface ViewConfiguration {
    /**
     * @hidden
     * Unique identifier of view.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    id: string;
    /**
     * @hidden
     * Display title of the view.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    title: string;
    /**
     * @hidden
     * Additional information for accessibility.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    contentDescription?: string;
  }

  /**
   * Defines how a menu item should appear in the NavBar.
   */
  export enum DisplayMode {
    /**
     * Only place this item in the NavBar if there's room for it.
     * If there's no room, item is shown in the overflow menu.
     */
    ifRoom = 0,
    /**
     * Never place this item in the NavBar.
     * The item would always be shown in NavBar's overflow menu.
     */
    overflowOnly = 1,
  }

  /**
   * @hidden
   * Represents information about menu item for Action Menu and Navigation Bar Menu.
   */
  export class MenuItem {
    /**
     * @hidden
     * Unique identifier for the menu item.
     */
    public id: string;
    /**
     * @hidden
     * Display title of the menu item.
     */
    public title: string;
    /**
     * @hidden
     * Display icon of the menu item. The icon value must be a string having SVG icon content.
     */
    public icon: string;
    /**
     * @hidden
     * Selected state display icon of the menu item. The icon value must be a string having SVG icon content.
     */
    public iconSelected?: string;
    /**
     * @hidden
     * Additional information for accessibility.
     */
    public contentDescription?: string;
    /**
     * @hidden
     * State of the menu item
     */
    public enabled = true;
    /**
     * @hidden
     * Interface to show list of items on selection of menu item.
     */
    public viewData?: ViewData;
    /**
     * @hidden
     * Whether the menu item is selected or not
     */
    public selected = false;
    /**
     * The Display Mode of the menu item.
     * Default Behaviour would be DisplayMode.ifRoom if null.
     * Refer {@link DisplayMode}
     */
    public displayMode?: DisplayMode;
  }

  /**
   * @hidden
   * Represents information about view to show on Navigation Bar Menu item selection
   */
  export interface ViewData {
    /**
     * @hidden
     * Display header title of the item list.
     */
    listTitle?: string;
    /**
     * @hidden
     * Type of the menu item.
     */
    listType: MenuListType;
    /**
     * @hidden
     * Array of MenuItem. Icon value will be required for all items in the list.
     */
    listItems: MenuItem[];
  }

  /**
   * @hidden
   * Represents information about type of list to display in Navigation Bar Menu.
   */
  export enum MenuListType {
    dropDown = 'dropDown',
    popOver = 'popOver',
  }
  let navBarMenuItemPressHandler: ((id: string) => boolean) | undefined;
  let actionMenuItemPressHandler: ((id: string) => boolean) | undefined;
  let viewConfigItemPressHandler: ((id: string) => boolean) | undefined;

  /**
   * @hidden
   * Register navBarMenuItemPress, actionMenuItemPress, setModuleView handlers.
   *
   * @internal
   * Limited to Microsoft-internal use.
   */
  export function initialize(): void {
    registerHandler('navBarMenuItemPress', handleNavBarMenuItemPress, false);
    registerHandler('actionMenuItemPress', handleActionMenuItemPress, false);
    registerHandler('setModuleView', handleViewConfigItemPress, false);
  }

  /**
   * @hidden
   * Registers list of view configurations and it's handler.
   * Handler is responsible for listening selection of View Configuration.
   *
   * @param viewConfig - List of view configurations. Minimum 1 value is required.
   * @param handler - The handler to invoke when the user selects view configuration.
   */
  export function setUpViews(viewConfig: ViewConfiguration[], handler: (id: string) => boolean): void {
    ensureInitialized(runtime);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    viewConfigItemPressHandler = handler;
    sendMessageToParent('setUpViews', [viewConfig]);
  }

  function handleViewConfigItemPress(id: string): void {
    if (!viewConfigItemPressHandler || !viewConfigItemPressHandler(id)) {
      ensureInitialized(runtime);
      sendMessageToParent('viewConfigItemPress', [id]);
    }
  }

  /**
   * @hidden
   * Used to set menu items on the Navigation Bar. If icon is available, icon will be shown, otherwise title will be shown.
   *
   * @param items List of MenuItems for Navigation Bar Menu.
   * @param handler The handler to invoke when the user selects menu item.
   */
  export function setNavBarMenu(items: MenuItem[], handler: (id: string) => boolean): void {
    ensureInitialized(runtime);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    navBarMenuItemPressHandler = handler;
    sendMessageToParent('setNavBarMenu', [items]);
  }

  function handleNavBarMenuItemPress(id: string): void {
    if (!navBarMenuItemPressHandler || !navBarMenuItemPressHandler(id)) {
      ensureInitialized(runtime);
      sendMessageToParent('handleNavBarMenuItemPress', [id]);
    }
  }

  /** Parameters used to create an action menu within an app */
  export interface ActionMenuParameters {
    /**
     * @hidden
     * Display title for Action Menu
     */
    title: string;
    /**
     * @hidden
     * List of MenuItems for Action Menu
     */
    items: MenuItem[];
  }

  /**
   * @hidden
   * Used to show Action Menu.
   *
   * @param params - Parameters for Menu Parameters
   * @param handler - The handler to invoke when the user selects menu item.
   */
  export function showActionMenu(params: ActionMenuParameters, handler: (id: string) => boolean): void {
    ensureInitialized(runtime);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    actionMenuItemPressHandler = handler;
    sendMessageToParent('showActionMenu', [params]);
  }

  function handleActionMenuItemPress(id: string): void {
    if (!actionMenuItemPressHandler || !actionMenuItemPressHandler(id)) {
      ensureInitialized(runtime);
      sendMessageToParent('handleActionMenuItemPress', [id]);
    }
  }

  /**
   * Checks if the menus capability is supported by the host
   * @returns boolean to represent whether the menus capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.menus ? true : false;
  }
}
