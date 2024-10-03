import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { menus } from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';
import { checkCapabilitySupport } from '../utils/CheckCapabilityUtils';

export const menus_CheckMenusCapability = async (): Promise<void> => {
  const module = 'menus';
  const moduleName = 'Menus';
  const supportedMessage = 'Menus module is supported. Menus is supported on Teams Desktop and Teams Mobile, Versions below 23247.720.2421.8365.';
  const notSupportedMessage = 'Menus module is not supported. Menus is not supported on Teams Versions 23247.720.2421.8365 and above, M365 Web, M365 Desktop, Outlook Desktop, M365 Mobile, or Outlook Mobile.';
  
  await checkCapabilitySupport(module, moduleName, supportedMessage, notSupportedMessage);
};

export const menus_SetUpViews = async (input: string): Promise<string> => {
  console.log('Executing SetUpViews...');
  try {
    const views: menus.ViewConfiguration[] = JSON.parse(input);
    views.forEach(viewConfig => {
      if (!viewConfig.id || !viewConfig.title) {
        throw new Error('ID and Title are required for each viewConfiguration');
      }
    });
    await menus.setUpViews(views, (id) => {
      console.log('Handler called with id:', id);
      return true;
    });
    return 'SetUpViews completed successfully';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Error setting up views:', errorMessage);
    throw error;
  }
};

export const menus_SetNavBarMenu = async (input: string): Promise<string> => {
  console.log('Executing SetNavBarMenu...');
  try {
    const menuItems: menus.MenuItem[] = JSON.parse(input);
    menuItems.forEach(menuItem => {
      if (!menuItem.id || !menuItem.title || !menuItem.icon) {
        throw new Error('ID, Title, and Icon are required for each menuItem');
      }
    });
    await menus.setNavBarMenu(menuItems, (id) => {
      console.log('Handler called with id:', id);
      return true;
    });
    return 'SetNavBarMenu completed successfully';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Error setting up nav bar menu:', errorMessage);
    throw error;
  }
};

export const menus_ShowActionMenu = async (input: string): Promise<string> => {
  console.log('Executing ShowActionMenu...');
  try {
    const actionMenuParams: menus.ActionMenuParameters = JSON.parse(input);
    if (!actionMenuParams.title || !actionMenuParams.items) {
      throw new Error('Title and Items are required for actionMenuParameters');
    }
    actionMenuParams.items.forEach(menuItem => {
      if (!menuItem.id || !menuItem.title || !menuItem.icon) {
        throw new Error('ID, Title, and Icon are required for each menuItem');
      }
    });
    await menus.showActionMenu(actionMenuParams, (id) => {
      console.log('Handler called with id:', id);
      return true;
    });
    return 'ShowActionMenu completed successfully';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Error showing action menu:', errorMessage);
    throw error;
  }
};

const functionsRequiringInput = [
  'SetUpViews',
  'SetNavBarMenu',
  'ShowActionMenu'
]; // List of functions requiring input

interface MenuAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const MenuAPIs: React.FC<MenuAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
      functionsRequiringInput={functionsRequiringInput}
    />
  );
};

export default MenuAPIs;
