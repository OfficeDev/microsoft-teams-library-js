import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { pages } from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';

export const pagesTabs_CheckPagesTabsCapability = async (): Promise<void> => {
  console.log('Executing CheckPagesTabsCapability...');
  try {
    const result = pages.isSupported();
    if (result) {
      console.log('Pages Tabs module is supported. Pages Tabs is supported on Teams Web and Teams Desktop.');
    } else {
      console.log('Pages Tabs module is not supported. Pages Tabs is not supported on M365 Web, Outlook Web, M365 Desktop, Outlook Desktop, Teams Mobile, M365 Mobile, or Outlook Mobile.');
      throw new Error('Pages Tabs capability is not supported');
    }
  } catch (error) {
    console.log('Error checking Pages Tabs capability:', error);
    throw error;
  }
};

export const pagesTabs_NavigateToTab = async (input: any): Promise<void> => {
  console.log('Executing NavigateToTab with input...');
  try {
    await pages.tabs.navigateToTab(input);
    console.log('Navigation to tab completed successfully.');
  } catch (error) {
    console.log('Error navigating to tab:', JSON.stringify(error, null, 2));
    throw error;
  }
};

export const pagesTabs_GetTabInstances = async (input: any): Promise<void> => {
  console.log('Executing GetTabInstances with input...');
  try {
    const result = await pages.tabs.getTabInstances(input);
    console.log('Tab instances retrieved:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('Error getting tab instances:', error);
    throw error;
  }
};

export const pagesTabs_GetMruTabInstances = async (input: any): Promise<void> => {
  console.log('Executing GetMruTabInstances with input...');
  try {
    const result = await pages.tabs.getMruTabInstances(input);
    console.log('MRU tab instances retrieved:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('Error getting MRU tab instances:', JSON.stringify(error, null, 2));
    throw error;
  }
};

const functionsRequiringInput = [
  'NavigateToTab', 
  'GetTabInstances', 
  'GetMruTabInstances',
];
interface PagesTabsAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const PagesTabsAPIs: React.FC<PagesTabsAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
      functionsRequiringInput={functionsRequiringInput}
    />
  );
};

export default PagesTabsAPIs;
