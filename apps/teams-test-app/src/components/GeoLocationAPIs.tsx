import { geoLocation } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';

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
    title: 'Choose Location',
    onClick: async () => {
      const result = await geoLocation.map.chooseLocation();
      return JSON.stringify(result);
    },
  });

const ShowLocation = (): React.ReactElement =>
  ApiWithTextInput<geoLocation.Location>({
    name: 'showLocationOnMap',
    title: 'Show Location',
    onClick: {
      validateInput: input => {
        if (!input.latitude || !input.longitude) {
          throw new Error('latitude and longitude are required');
        }
      },
      submit: async locationProps => {
        await geoLocation.map.showLocation(locationProps);
        return 'Completed';
      },
    },
  });

const HasGeoLocationPermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'hasGeoLocationPermission',
    title: 'Has Permission',
    onClick: async () => {
      const result = await geoLocation.hasPermission();
      return JSON.stringify(result);
    },
  });

const RequestGeoLocationPermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'requestGeoLocationPermission',
    title: 'Request Permission',
    onClick: async () => {
      const result = await geoLocation.requestPermission();
      return JSON.stringify(result);
    },
  });

const WebAPIGetCurrentPosition = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'WebAPIGetCurrentPosition',
    title: 'Web API GetCurrentPosition',
    onClick: async setResult => {
      let result;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
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
  <>
    <h1>geoLocation</h1>
    <GetCurrentLocation />
    <ChooseLocation />
    <ShowLocation />
    <HasGeoLocationPermission />
    <RequestGeoLocationPermission />
    <WebAPIGetCurrentPosition />
    <CheckGeoLocationCapability />
    <CheckGeoLocationMapCapability />
  </>
);

export default GeoLocationAPIs;
