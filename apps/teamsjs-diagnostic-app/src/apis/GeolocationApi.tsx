import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { geoLocation } from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';
import { checkCapabilitySupport, checkPermission } from '../utils/CheckCapabilityUtils';

export const geolocation_CheckGeoLocationCapability = async (): Promise<void> => {
  const module = 'geolocation';
  const moduleName = 'Geolocation';
  const supportedMessage = 'Geolocation module is supported. Geolocation Map is supported on new Teams (Version 23247.720.2421.8365 and above) Web, M365 Web, new Teams (Version 23247.720.2421.8365 and above) Desktop, M365 Desktop, and Outlook Desktop.';
  const notSupportedMessage = 'Geolocation module is not supported. Geolocation is not supported on Teams versions less than 23247.720.2421.8365 on Web, Outlook Web, Teams versions less than 23247.720.2421.8365 on Desktop, or Mobile.';
  
  await checkCapabilitySupport(module, moduleName, supportedMessage, notSupportedMessage);
};

export const geolocation_CheckGeoLocationMapCapability = async (): Promise<void> => {
  const module = 'geolocationMap';
  const moduleName = 'GeolocationMap';
  const supportedMessage = 'Geolocation Map module is supported. Geolocation Map is supported on new Teams (Version 23247.720.2421.8365 and above) Web and new Teams (Version 23247.720.2421.8365 and above) Desktop';
  const notSupportedMessage = 'Geolocation Map module is not supported. Geolocation Map is only supported on new Teams (Version 23247.720.2421.8365 and above) Web and new Teams (Version 23247.720.2421.8365 and above) Desktop.';
  
  await checkCapabilitySupport(module, moduleName, supportedMessage, notSupportedMessage);
};

export const geolocation_HasGeoLocationPermission = async (): Promise<void> => {
  const module = 'geolocation';
  const moduleName = 'Geolocation';
  const permissionGrantedMessage = 'Geolocation permission has been granted.';
  const errorMessage = 'HasGeolocationPermission functionality is currently not supported on Teams versions less than 23247.720.2421.8365 on Web, Outlook Web, Teams versions less than 23247.720.2421.8365 on Desktop, or Mobile.';
  
  await checkPermission(module, moduleName, permissionGrantedMessage, errorMessage);
};

export const geolocation_RequestGeoLocationPermission = async (): Promise<void> => {
  console.log('Executing RequestGeoLocationPermission...');
  try {
    const result = await geoLocation.requestPermission();
    console.log('GeoLocation permission request result:', result);
  } catch (error) {
    console.log('Error requesting GeoLocation permission:', JSON.stringify(error, null, 2));
    throw error;
  }
};

export const geolocation_GetCurrentLocation = async (): Promise<void> => {
  console.log('Executing GetCurrentLocation...');
    try {
      const result = await geoLocation.getCurrentLocation();
      console.log('Current geoLocation:', result);
    } catch (error) {
      console.log('Error getting current geoLocation:', JSON.stringify(error, null, 2));
      throw error;
    }
};

export const geolocation_ChooseLocation = async (): Promise<void> => {
  console.log('Executing ChooseLocation...');
    try {
      const result = await geoLocation.map.chooseLocation();
      console.log('Chosen geoLocation:', result);
    } catch (error) {
      console.log('Error choosing geoLocation:', JSON.stringify(error, null, 2));
      throw error;
    }
};
interface GeolocationAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const GeolocationAPIs: React.FC<GeolocationAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
    />
  );
};

export default GeolocationAPIs;
