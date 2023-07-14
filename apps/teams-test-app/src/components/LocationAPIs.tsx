import { location, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckLocationCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkLocationCapability',
    title: 'Check Location Capability',
    onClick: async () => `Location module ${location.isSupported() ? 'is' : 'is not'} supported`,
  });

const GetLocation = (): React.ReactElement =>
  ApiWithTextInput<location.LocationProps>({
    name: 'getLocation',
    title: 'Get Location',
    onClick: {
      validateInput: (locationProps) => {
        if (locationProps.allowChooseLocation === undefined) {
          throw new Error('allowChooseLocation is required');
        }
      },
      submit: async (locationProps, setResult) => {
        const callback = (error: SdkError, location: location.Location): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else {
            setResult(JSON.stringify(location));
          }
        };
        location.getLocation(locationProps, callback);
        return '';
      },
    },
  });

const ShowLocation = (): React.ReactElement =>
  ApiWithTextInput<location.Location>({
    name: 'showLocation',
    title: 'Show Location',
    onClick: {
      validateInput: (input) => {
        if (!input.latitude || !input.longitude) {
          throw new Error('latitude and longitude are required');
        }
      },
      submit: async (locationProps, setResult) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const callback = (error: SdkError, status: boolean): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else {
            setResult('Completed');
          }
        };
        location.showLocation(locationProps, callback);
        return '';
      },
    },
  });

const LocationAPIs = (): ReactElement => (
  <ModuleWrapper title="Location">
    <GetLocation />
    <ShowLocation />
    <CheckLocationCapability />
  </ModuleWrapper>
);

export default LocationAPIs;
