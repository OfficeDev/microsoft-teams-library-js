import { ensureInitialized } from '../internal/internalAPIs';
import { sendMessageToParent } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
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
    public icon: string;
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
    public enabled = true;
    /**
     * Interface to show list of items on selection of menu item.
     */
    public viewData: ViewData;
    /**
     * Whether the menu item is selected or not
     */
    public selected = false;
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
    dropDown = 'dropDown',
    popOver = 'popOver',
  }
  let navBarMenuItemPressHandler: (id: string) => boolean;
  let actionMenuItemPressHandler: (id: string) => boolean;
  let viewConfigItemPressHandler: (id: string) => boolean;

  export function initialize(): void {
    registerHandler('navBarMenuItemPress', handleNavBarMenuItemPress, false);
    registerHandler('actionMenuItemPress', handleActionMenuItemPress, false);
    registerHandler('setModuleView', handleViewConfigItemPress, false);
  }
  /**
   * Registers list of view configurations and it's handler.
   * Handler is responsible for listening selection of View Configuration.
   * @param viewConfig List of view configurations. Minimum 1 value is required.
   * @param handler The handler to invoke when the user selects view configuration.
   */
  export function setUpViews(viewConfig: ViewConfiguration[], handler: (id: string) => boolean): void {
    ensureInitialized();
    viewConfigItemPressHandler = handler;
    sendMessageToParent('setUpViews', [viewConfig]);
  }
  function handleViewConfigItemPress(id: string): void {
    if (!viewConfigItemPressHandler || !viewConfigItemPressHandler(id)) {
      ensureInitialized();
      sendMessageToParent('viewConfigItemPress', [id]);
    }
  }
  /**
   * Used to set menu items on the Navigation Bar. If icon is available, icon will be shown, otherwise title will be shown.
   * @param items List of MenuItems for Navigation Bar Menu.
   * @param handler The handler to invoke when the user selects menu item.
   */
  export function setNavBarMenu(items: MenuItem[], handler: (id: string) => boolean): void {
    ensureInitialized();
    navBarMenuItemPressHandler = handler;
    sendMessageToParent('setNavBarMenu', [items]);
  }
  function handleNavBarMenuItemPress(id: string): void {
    if (!navBarMenuItemPressHandler || !navBarMenuItemPressHandler(id)) {
      ensureInitialized();
      sendMessageToParent('handleNavBarMenuItemPress', [id]);
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
  export function showActionMenu(params: ActionMenuParameters, handler: (id: string) => boolean): void {
    ensureInitialized();
    actionMenuItemPressHandler = handler;
    sendMessageToParent('showActionMenu', [params]);
  }
  function handleActionMenuItemPress(id: string): void {
    if (!actionMenuItemPressHandler || !actionMenuItemPressHandler(id)) {
      ensureInitialized();
      sendMessageToParent('handleActionMenuItemPress', [id]);
    }
  }
}
