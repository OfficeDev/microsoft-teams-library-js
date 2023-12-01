import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { app, menus } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";

/**
 * This component returns button to setupViews
 * Sets Navbar menus and shows action menu
 * works on mobile app.
 */
export const Menus = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (menus.isSupported()) {
      const menuItem: menus.MenuItem[] = [
        {
          id: "0",
          title: "Home",
          icon: "there is an <svg></svg> tag here but I shortened it for easier reading",
          enabled: true,
          viewData: null as any,
          selected: false,
        },
        {
          id: "1",
          title: "News",
          icon: "there is an <svg></svg> tag here but I shortened it for easier reading",
          enabled: true,
          viewData: null as any,
          selected: false,
        },
        {
          id: "2",
          title: "Contact",
          icon: "there is an <svg></svg> tag here but I shortened it for easier reading",
          enabled: true,
          viewData: null as any,
          selected: false,
        },
        {
          id: "3",
          title: "About",
          icon: "there is an <svg></svg> tag here but I shortened it for easier reading",
          enabled: true,
          viewData: null as any,
          selected: false,
        },
        {
          id: "4",
          title: "Dashboard",
          icon: "there is an <svg></svg> tag here but I shortened it for easier reading",
          enabled: true,
          viewData: null as any,
          selected: false,
        },
      ];

      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Tooltip content="menus.setUpViews()" trigger={
            <Button
              onClick={() => {
                menus.setUpViews([{ id: "1", title: "View 1" }], (id: string) => {
                  console.log(id);
                  return true;
                });
              }}
            >
              Setup Views
            </Button>
          } />
          <Tooltip content="menus.setNavBarMenu()" trigger={
            <Button
              onClick={() => {
                menus.setNavBarMenu(menuItem, (id: string) => {
                  console.log(id);
                  return true;
                });
              }}
            >
              SetNavBarMenu
            </Button>
          } />
          <Tooltip content="menus.showActionMenu()" trigger={
            <Button
              onClick={() => {
                menus.showActionMenu(
                  { items: menuItem, title: "Menu Title" },
                  (id: string) => {
                    return true;
                  }
                );
              }}
            >
              Show Action Menu
            </Button>
          } />
        </Flex>
      );
    } else {
      // return's if capability is not supported
      return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;
    }
  }
  // return's if App is not initialized.
  return <>{CapabilityStatus.NotInitialized}</>;
};
