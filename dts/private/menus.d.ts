/**
 * Namespace to interact with the menu-specific part of the SDK.
 * This object is used to show View Configuration, Action Menu and Navigation Bar Menu.
 *
 * @private
 * Hide from docs until feature is complete
 */
export declare namespace menus {
    /**
     * Represents information about item in View Configuration.
     */
    interface ViewConfiguration {
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
    class MenuItem {
        /**
         * Unique identifier for the menu item.
         */
        id: string;
        /**
         * Display title of the menu item.
         */
        title: string;
        /**
         * Display icon of the menu item. The icon value must be a string having SVG icon content.
         */
        icon?: string;
        /**
         * Selected state display icon of the menu item. The icon value must be a string having SVG icon content.
         */
        iconSelected?: string;
        /**
         * Additional information for accessibility.
         */
        contentDescription?: string;
        /**
         * State of the menu item
         */
        enabled: boolean;
        /**
         * Interface to show list of items on selection of menu item.
         */
        viewData: ViewData;
    }
    /**
     * Represents information about view to show on Navigation Bar Menu item selection
     */
    interface ViewData {
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
    enum MenuListType {
        dropDown = "dropDown",
        popOver = "popOver"
    }
    /**
     * Registers list of view configurations and it's handler.
     * Handler is responsible for listening selection of View Configuration.
     * @param viewConfig List of view configurations. Minimum 1 value is required.
     * @param handler The handler to invoke when the user selects view configuration.
     */
    function setUpViews(viewConfig: ViewConfiguration[], handler: (id: string) => boolean): void;
    /**
     * Used to set menu items on the Navigation Bar. If icon is available, icon will be shown, otherwise title will be shown.
     * @param items List of MenuItems for Navigation Bar Menu.
     * @param handler The handler to invoke when the user selects menu item.
     */
    function setNavBarMenu(items: MenuItem[], handler: (id: string) => boolean): void;
    interface ActionMenuParameters {
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
    function showActionMenu(params: ActionMenuParameters, handler: (id: string) => boolean): void;
}
