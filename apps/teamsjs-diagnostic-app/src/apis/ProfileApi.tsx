import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { profile } from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';

export const profile_CheckProfileCapability = async (): Promise<void> => {
  console.log('Executing CheckProfileCapability...');
  try {
    const result = await profile.isSupported();
    if (result) {
      console.log('Profile module is supported. Profile is supported on new Teams (Version 23247.720.2421.8365 and above) Web, Outlook Web, new Teams (Version 23247.720.2421.8365 and above) Desktop, and Outlook Desktop');
    } else {
      console.log('Profile module is not supported. Profile is not supported on Teams versions under 23247.720.2421.8365, M365, or any Mobile platforms.');
      throw new Error('Profile capability is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking Profile capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

export function profile_ShowProfile(input: profile.ShowProfileRequest) {
  return new Promise<void>((resolve, reject) => {
    if (!input) {
      console.log('ShowProfileRequest input is missing');
      return reject('ShowProfileRequest is required');
    }

    console.log('Starting ShowProfile with input:', input);

    try {
      profile.showProfile(input);
      console.log('Profile displayed successfully');
      resolve();
    } catch (error) {
      console.error('Error displaying profile:', error);
      reject(error);
    }
  });
}

const functionsRequiringInput = [
  'ShowProfile'
]; // List of functions requiring input

interface ProfileAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const ProfileAPIs: React.FC<ProfileAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
      functionsRequiringInput={functionsRequiringInput}
    />
  );
};

export default ProfileAPIs;
