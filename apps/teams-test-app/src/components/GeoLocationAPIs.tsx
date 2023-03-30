import { geoLocation } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckGeoLocationCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkGeoLocationCapability',
    title: 'Check geoLocation Capability',
    onClick: async () => `geoLocation module ${geoLocation.isSupported() ? 'is' : 'is not'} supported`,
  });

const CheckGeoLocationMapCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkLocationMapCapability',
    title: 'Check geoLocation Map Capability',
    onClick: async () => `LocationMap module ${geoLocation.map.isSupported() ? 'is' : 'is not'} supported`,
  });

const GetCurrentLocation = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getCurrentLocation',
    title: 'Get Current geoLocation',
    onClick: async () => {
      const result = await geoLocation.getCurrentLocation();
      return JSON.stringify(result);
    },
  });

const ChooseLocation = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'chooseLocationOnMap',
    title: 'Choose geoLocation',
    onClick: async () => {
      const result = await geoLocation.map.chooseLocation();
      return JSON.stringify(result);
    },
  });

const ShowLocation = (): React.ReactElement =>
  ApiWithTextInput<geoLocation.Location>({
    name: 'showLocationOnMap',
    title: 'Show geoLocation',
    onClick: {
      validateInput: (input) => {
        if (!input.latitude || !input.longitude) {
          throw new Error('latitude and longitude are required');
        }
      },
      submit: async (locationProps) => {
        await geoLocation.map.showLocation(locationProps);
        return 'Completed';
      },
    },
  });

const HasGeoLocationPermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'hasGeoLocationPermission',
    title: 'Has GeoLocation Permission',
    onClick: async () => {
      const result = await geoLocation.hasPermission();
      return JSON.stringify(result);
    },
  });

const RequestGeoLocationPermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'requestGeoLocationPermission',
    title: 'Request GeoLocation Permission',
    onClick: async () => {
      const result = await geoLocation.requestPermission();
      return JSON.stringify(result);
    },
  });

const WebAPIGetCurrentPosition = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'WebAPIGetCurrentPosition',
    title: 'Web API GetCurrentPosition',
    onClick: async (setResult) => {
      let result;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          result = 'Latitude: ' + position.coords.latitude + ' Longitude: ' + position.coords.longitude;
          setResult(result);
        });
      } else {
        result = 'navigator.geolocation is not accessible';
        setResult(result);
      }
      return JSON.stringify('Do not have required permissions to access location');
    },
  });

const GeoLocationAPIs = (): ReactElement => (
  <ModuleWrapper title="GeoLocation">
    <GetCurrentLocation />
    <ChooseLocation />
    <ShowLocation />
    <HasGeoLocationPermission />
    <RequestGeoLocationPermission />
    <WebAPIGetCurrentPosition />
    <CheckGeoLocationCapability />
    <CheckGeoLocationMapCapability />
  </ModuleWrapper>
);

export default GeoLocationAPIs;
