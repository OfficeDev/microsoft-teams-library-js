import { location, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';

const CheckLocationCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkLocationCapability',
    title: 'Check Location Capability',
    onClick: async () => `Location module ${location.isSupported() ? 'is' : 'is not'} supported`,
  });

const CheckLocationMapCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkLocationMapCapability',
    title: 'Check Location Map Capability',
    onClick: async () => `Location module ${location.map.isSupported() ? 'is' : 'is not'} supported`,
  });

const GetLocation = (): React.ReactElement =>
  ApiWithTextInput<location.LocationProps>({
    name: 'getLocation',
    title: 'Get Location',
    onClick: {
      validateInput: () => {
        return;
      },
      submit: {
        withPromise: async () => {
          const result = await location.getCurrentLocation();
          return JSON.stringify(result);
        },
        withCallback: (locationProps, setResult) => {
          if (locationProps.allowChooseLocation === undefined) {
            throw new Error('allowChooseLocation is required');
          }
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

const ChooseLocation = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'chooseLocation',
    title: 'Choose Location',
    onClick: async () => {
      const result = await location.map.chooseLocation();
      return JSON.stringify(result);
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
          await location.map.showLocation(locationProps);
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

const HasLocationPermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'HasLocationPermission',
    title: 'Has Permission',
    onClick: async () => {
      const result = await location.hasPermission();
      return JSON.stringify(result);
    },
  });

const RequestLocationPermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'RequestLocationPermission',
    title: 'Request Permission',
    onClick: async () => {
      const result = await location.requestPermission();
      return JSON.stringify(result);
    },
  });

const LocationAPIs = (): ReactElement => (
  <>
    <h1>location</h1>
    <GetLocation />
    <ChooseLocation />
    <ShowLocation />
    <HasLocationPermission />
    <RequestLocationPermission />
    <CheckLocationCapability />
    <CheckLocationMapCapability />
  </>
);

export default LocationAPIs;
