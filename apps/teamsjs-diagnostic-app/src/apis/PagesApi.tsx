import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { pages } from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';

export const pages_CheckCapability = async (): Promise<void> => {
    console.log('Executing CheckCapability...');
    try {
        const result = pages.isSupported();
        if (result) {
            console.log('Pages module is supported. Pages is supported on all platforms.');
        } else {
            console.log('Pages module is not supported.');
            throw new Error('Pages capability is not supported');
        }
    } catch (error) {
        console.error('Error checking Pages capability:', error);
        throw error;
    }
};

export const pages_NavigateCrossDomain = async (url: string): Promise<void> => {
    console.log('Executing NavigateCrossDomain...');

    console.log('URL received:', url);
    console.log('Type of URL:', typeof url);

    if (typeof url !== 'string') {
        console.log('Url is invalid. Must be a URL string.');
        throw new Error('Url is invalid');
    }

    try {
        await pages.navigateCrossDomain(url);
        console.log(`Navigation to ${url} was successful.`);
    } catch (error) {
        console.error(`Error navigating to ${url}:`, error);
        throw error;
    }
};

export const pages_NavigateToApp = async (input: {
    appId: string;
    pageId: string;
    webUrl: string;
    subPageId?: string;
    channelId?: string;
}): Promise<void> => {
    console.log('Executing NavigateToApp...');

    try {
        await pages.navigateToApp(input);
        console.log(`Navigation to app with ID ${input.appId} was successful.`);
    } catch (error) {
        console.log(`Error navigating to app with ID ${input.appId}:`, error);
        throw error;
    }
};

export const pages_ShareDeepLink = async (input: {
    subEntityId: string;
    subEntityLabel: string;
    subEntityWebUrl: string;
    subPageId: string;
    subPageLabel: string;
    subPageWebUrl: string;
}): Promise<void> => {
    console.log('Executing ShareDeepLink...');
    try {
        await pages.shareDeepLink(input);
        console.log(`Deep link shared successfully.`);
    } catch (error) {
        console.error('Error sharing deep link:', error);
        throw error;
    }
};

export const pages_SetCurrentFrame = async (input: {
    websiteUrl: string;
    contentUrl: string;
}): Promise<void> => {
    console.log('Executing SetCurrentFrame...');
    try {
        await pages.setCurrentFrame(input);
        console.log('Current frame set successfully.');
    } catch (error) {
        console.error('Error setting current frame:', error);
        throw error;
    }
};

export const pages_GetConfig = async (): Promise<void> => {
    console.log('Executing GetConfig...');
    try {
        const config = await pages.getConfig();
        console.log('Page configuration retrieved:', JSON.stringify(config, null, 2));
    } catch (error) {
        console.log('Error getting page configuration:', error);
        throw error;
    }
};

export const pages_RegisterFocusEnterHandler = async (): Promise<void> => {
    console.log('Executing RegisterChangeHandler...');
    try {
        pages.registerFocusEnterHandler((event) => {
            console.log('Page configuration changed:', event);
        });
        console.log('Change handler registered successfully.');
    } catch (error) {
        console.error('Error registering change handler:', error);
        throw error;
    }
};

export const pages_RegisterFullScreenChangeHandler = async (): Promise<void> => {
    console.log('Executing RegisterFullScreenChangeHandler...');
    try {
        pages.registerFullScreenHandler((isFullScreen) => {
            console.log(`Full screen mode changed: ${isFullScreen}`);
        });

        console.log('Full screen change handler registered successfully.');
    } catch (error) {
        console.error('Error registering full screen change handler:', error);
        throw error;
    }
};

const functionsRequiringInput = [
  'NavigateCrossDomain',
  'NavigateToApp',
  'ShareDeepLink',
  'SetCurrentFrame'
];
interface PagesAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const PagesAPIs: React.FC<PagesAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
      functionsRequiringInput={functionsRequiringInput}
    />
  );
};

export default PagesAPIs;
