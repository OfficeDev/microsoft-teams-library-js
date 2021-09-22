import { location } from '@microsoft/teamsjs-app-sdk';
import React, { ReactElement } from 'react';

import { noHubSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';

const LocationAPIs = (): ReactElement => {
  const [getLocationRes, setGetLocationRes] = React.useState('');
  const [showLocationRes, setShowLocationRes] = React.useState('');
  const [checkLocationCapabilityRes, setCheckLocationCapabilityRes] = React.useState('');

  const getLocation = (locationPropsInput: string): void => {
    const locationProps: location.LocationProps = JSON.parse(locationPropsInput);
    setGetLocationRes('location.getLocation()' + noHubSdkMsg);
    location
      .getLocation(locationProps)
      .then(location => setGetLocationRes(JSON.stringify(location)))
      .catch(err => setGetLocationRes(err.errorCode.toString + ' ' + err.message));
  };

  const showLocation = (locationInput: string): void => {
    const locationParam: location.Location = JSON.parse(locationInput);
    setShowLocationRes('location.showLocation()' + noHubSdkMsg);
    location
      .showLocation(locationParam)
      .then(() => setShowLocationRes('Completed'))
      .catch(err => setShowLocationRes(err.errorCode.toString + ' ' + err.message));
  };

  const locationCapabilityCheck = (): void => {
    if (location.isSupported()) {
      setCheckLocationCapabilityRes('Location module is supported');
    } else {
      setCheckLocationCapabilityRes('Location module is not supported');
    }
  };

  return (
    <>
      <h1>location</h1>
      <BoxAndButton
        handleClickWithInput={getLocation}
        output={getLocationRes}
        hasInput={true}
        title="Get Location"
        name="getLocation"
      />
      <BoxAndButton
        handleClickWithInput={showLocation}
        output={showLocationRes}
        hasInput={true}
        title="Show Location"
        name="showLocation"
      />
      <BoxAndButton
        handleClick={locationCapabilityCheck}
        output={checkLocationCapabilityRes}
        hasInput={false}
        title="Check Location Capability"
        name="checkLocationCapability"
      />
    </>
  );
};

export default LocationAPIs;
