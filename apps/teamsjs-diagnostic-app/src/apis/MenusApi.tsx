import React, { useState } from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { menus } from '@microsoft/teams-js';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

export const menus_CheckMenusCapability = async (): Promise<void> => {
  console.log('Executing CheckMenusCapability...');
  try {
    const result = await menus.isSupported();
    if (result) {
      console.log('Menus module is supported. Menus is supported on Teams Desktop and Teams Mobile, Versions below 23247.720.2421.8365');
    } else {
      console.log('Menus module is not supported. Menus is not supported on Teams Versions 23247.720.2421.8365 and above, M365 Web, M365 Desktop, Outlook Desktop, M365 Mobile, or Outlook Mobile.');
      throw new Error('Menus module is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking Menus capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
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
  

interface MenusAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const MenusAPIs: React.FC<MenusAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const functionsRequiringInput = [
    'SetUpViews', 
    'SetNavBarMenu', 
    'ShowActionMenu'
  ]; // List of functions requiring input

  const handleFunctionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFunc = event.target.value;
    setSelectedFunction(selectedFunc);
    setInputValue('');  // Reset input value when function changes
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleDefaultButtonClick = () => {
    if (selectedFunction && apiComponent.defaultInput) {
      const defaultInputs = JSON.parse(apiComponent.defaultInput);
      setInputValue(defaultInputs[selectedFunction] ? JSON.stringify(defaultInputs[selectedFunction]) : '');
    }
  };

  // Determine if the input box should be shown based on the selected function
  const showInputBox = selectedFunction && functionsRequiringInput.includes(selectedFunction);

  const { isDragging, drag } = useDragAndDrop('API', { api: apiComponent, func: selectedFunction, input: inputValue });

  return (
    <div className="api-container" ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div className="api-header">{apiComponent.title}</div>
      <div className="dropdown-menu">
        <select
          aria-label={`Select a function for ${apiComponent.title}`}
          className="box-dropdown"
          onChange={handleFunctionChange}
          value={selectedFunction}
        >
          <option value="">Select a function</option>
          {apiComponent.functions.map((func, index) => (
            <option key={index} value={func.name}>
              {func.name}
            </option>
          ))}
        </select>
        {showInputBox && (
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={`Enter input for ${selectedFunction}`}
            />
            <button onClick={handleDefaultButtonClick}>Default</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenusAPIs;