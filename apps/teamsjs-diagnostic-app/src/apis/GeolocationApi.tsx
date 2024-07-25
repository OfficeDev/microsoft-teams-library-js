import React, { useState } from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { useDragAndDrop } from '../utils/UseDragAndDrop';
import { geoLocation } from '@microsoft/teams-js';

export const geolocation_CheckGeoLocationCapability = async (): Promise<void> => {
  console.log('Executing CheckGeoLocationCapability...');
  try {
    const result = await geoLocation.isSupported();
    if (result) {
      console.log('Geolocation module is supported. Geolocation Map is supported on new Teams (Version 23247.720.2421.8365 and above) Web, M365 Web, new Teams (Version 23247.720.2421.8365 and above) Desktop, M365 Desktop, and Outlook Desktop.');
    } else {
      console.log('Geolocation module is not supported. Geolocation is not supported on Teams versions less than 23247.720.2421.8365 on Web, Outlook Web, Teams versions less than 23247.720.2421.8365 on DEsktop, or Mobile.');
      throw new Error('Geolocation capability is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking Geolocation capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

export const geolocation_CheckGeoLocationMapCapability = async (): Promise<void> => {
  console.log('Executing CheckGeoLocationMapCapability...');
  try {
    const result = await geoLocation.map.isSupported();
    if (result) {
      console.log('Geolocation Map module is supported. Geolocation Map is supported on new Teams (Version 23247.720.2421.8365 and above) Web and new Teams (Version 23247.720.2421.8365 and above) Desktop.');
    } else {
      console.log('Geolocation Map module is not supported. Geolocation Map is only supported on new Teams (Version 23247.720.2421.8365 and above) Web and new Teams (Version 23247.720.2421.8365 and above) Desktop.');
      throw new Error('Geolocation capability is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking Geolocation Map capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
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

const GeolocationAPIs: React.FC<GeolocationAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');


  const handleFunctionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFunc = event.target.value;
    setSelectedFunction(selectedFunc);
    setInputValue('');  // Reset input value when function changes
  };

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
      </div>
    </div>
  );
};

export default GeolocationAPIs;
