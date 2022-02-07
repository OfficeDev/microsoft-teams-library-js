import { location, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';

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
      validateInput: input => {
        if (input.allowChooseLocation === undefined) {
          throw new Error('allowChooseLocation is required');
        }
      },
      submit: {
        withPromise: async locationProps => {
          const result = await location.getLocation(locationProps);
          return JSON.stringify(result);
        },
        withCallback: (locationProps, setResult) => {
          const callback = (error: SdkError, location: location.Location): void => {
            if (error) {
              setResult(JSON.stringify(error));
            } else {
              setResult(JSON.stringify(location));
            }
          };
          location.getLocation(locationProps, callback);
        },
      },
    },
  });

const ShowLocation = (): React.ReactElement =>
  ApiWithTextInput<location.Location>({
    name: 'showLocation',
    title: 'Show Location',
    onClick: {
      validateInput: input => {
        if (!input.latitude || !input.longitude) {
          throw new Error('latitude and longitude are required');
        }
      },
      submit: {
        withPromise: async locationProps => {
          await location.showLocation(locationProps);
          return 'Completed';
        },
        withCallback: (locationProps, setResult) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const callback = (error: SdkError, status: boolean): void => {
            if (error) {
              setResult(JSON.stringify(error));
            } else {
              setResult('Completed');
            }
          };
          location.showLocation(locationProps, callback);
        },
      },
    },
  });

const LocationAPIs = (): ReactElement => (
  <>
    <h1>location</h1>
    <GetLocation />
    <ShowLocation />
    <CheckLocationCapability />
  </>
);

export default LocationAPIs;
