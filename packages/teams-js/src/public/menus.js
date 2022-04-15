"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menus = void 0;
var communication_1 = require("../internal/communication");
var handlers_1 = require("../internal/handlers");
var internalAPIs_1 = require("../internal/internalAPIs");
var runtime_1 = require("../public/runtime");
/**
 * Namespace to interact with the menu-specific part of the SDK.
 * This object is used to show View Configuration, Action Menu and Navigation Bar Menu.
 */
var menus;
(function (menus) {
    /**
     * Defines how a menu item should appear in the NavBar.
     */
    var DisplayMode;
    (function (DisplayMode) {
        /**
         * Only place this item in the NavBar if there's room for it.
         * If there's no room, item is shown in the overflow menu.
         */
        DisplayMode[DisplayMode["ifRoom"] = 0] = "ifRoom";
        /**
         * Never place this item in the NavBar.
         * The item would always be shown in NavBar's overflow menu.
         */
        DisplayMode[DisplayMode["overflowOnly"] = 1] = "overflowOnly";
    })(DisplayMode = menus.DisplayMode || (menus.DisplayMode = {}));
    /**
     * @hidden
     * Represents information about menu item for Action Menu and Navigation Bar Menu.
     */
    var MenuItem = /** @class */ (function () {
        function MenuItem() {
            /**
             * @hidden
             * State of the menu item
             */
            this.enabled = true;
            /**
             * @hidden
             * Whether the menu item is selected or not
             */
            this.selected = false;
        }
        return MenuItem;
    }());
    menus.MenuItem = MenuItem;
    /**
     * @hidden
     * Represents information about type of list to display in Navigation Bar Menu.
     */
    var MenuListType;
    (function (MenuListType) {
        MenuListType["dropDown"] = "dropDown";
        MenuListType["popOver"] = "popOver";
    })(MenuListType = menus.MenuListType || (menus.MenuListType = {}));
    var navBarMenuItemPressHandler;
    var actionMenuItemPressHandler;
    var viewConfigItemPressHandler;
    function initialize() {
        (0, handlers_1.registerHandler)('navBarMenuItemPress', handleNavBarMenuItemPress, false);
        (0, handlers_1.registerHandler)('actionMenuItemPress', handleActionMenuItemPress, false);
        (0, handlers_1.registerHandler)('setModuleView', handleViewConfigItemPress, false);
    }
    menus.initialize = initialize;
    /**
     * @hidden
     * Registers list of view configurations and it's handler.
     * Handler is responsible for listening selection of View Configuration.
     *
     * @param viewConfig - List of view configurations. Minimum 1 value is required.
     * @param handler - The handler to invoke when the user selects view configuration.
     */
    function setUpViews(viewConfig, handler) {
        (0, internalAPIs_1.ensureInitialized)();
        viewConfigItemPressHandler = handler;
        (0, communication_1.sendMessageToParent)('setUpViews', [viewConfig]);
    }
    menus.setUpViews = setUpViews;
    function handleViewConfigItemPress(id) {
        if (!viewConfigItemPressHandler || !viewConfigItemPressHandler(id)) {
            (0, internalAPIs_1.ensureInitialized)();
            (0, communication_1.sendMessageToParent)('viewConfigItemPress', [id]);
        }
    }
    /**
     * @hidden
     * Used to set menu items on the Navigation Bar. If icon is available, icon will be shown, otherwise title will be shown.
     *
     * @param items List of MenuItems for Navigation Bar Menu.
     * @param handler The handler to invoke when the user selects menu item.
     */
    function setNavBarMenu(items, handler) {
        (0, internalAPIs_1.ensureInitialized)();
        navBarMenuItemPressHandler = handler;
        (0, communication_1.sendMessageToParent)('setNavBarMenu', [items]);
    }
    menus.setNavBarMenu = setNavBarMenu;
    function handleNavBarMenuItemPress(id) {
        if (!navBarMenuItemPressHandler || !navBarMenuItemPressHandler(id)) {
            (0, internalAPIs_1.ensureInitialized)();
            (0, communication_1.sendMessageToParent)('handleNavBarMenuItemPress', [id]);
        }
    }
    /**
     * @hidden
     * Used to show Action Menu.
     *
     * @param params - Parameters for Menu Parameters
     * @param handler - The handler to invoke when the user selects menu item.
     */
    function showActionMenu(params, handler) {
        (0, internalAPIs_1.ensureInitialized)();
        actionMenuItemPressHandler = handler;
        (0, communication_1.sendMessageToParent)('showActionMenu', [params]);
    }
    menus.showActionMenu = showActionMenu;
    function handleActionMenuItemPress(id) {
        if (!actionMenuItemPressHandler || !actionMenuItemPressHandler(id)) {
            (0, internalAPIs_1.ensureInitialized)();
            (0, communication_1.sendMessageToParent)('handleActionMenuItemPress', [id]);
        }
    }
    function isSupported() {
        return runtime_1.runtime.supports.menus ? true : false;
    }
    menus.isSupported = isSupported;
})(menus = exports.menus || (exports.menus = {}));
//# sourceMappingURL=menus.js.map