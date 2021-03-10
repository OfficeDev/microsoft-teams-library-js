import React, { ReactElement } from 'react';
import { location } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const LocationAPIs = (): ReactElement => {
  const [getLocationRes, setGetLocationRes] = React.useState('');
  const [showLocationRes, setShowLocationRes] = React.useState('');
  const [checkLocationCapabilityRes, setCheckLocationCapabilityRes] = React.useState('');

  const getLocation = (locationPropsInput: string): void => {
    let locationProps: location.LocationProps = JSON.parse(locationPropsInput);
    setGetLocationRes('location.getLocation()' + noHubSdkMsg);
    location.getLocation(locationProps, (err: teamsjs.SdkError, location: teamsjs.location.Location): void => {
      if (err) {
        setGetLocationRes(err.errorCode.toString + ' ' + err.message);
        return;
      }
      setGetLocationRes(JSON.stringify(location));
    });
  };

  const showLocation = (locationInput: string): void => {
    let locationParam: location.Location = JSON.parse(locationInput);
    setShowLocationRes('location.showLocation()' + noHubSdkMsg);
    location.showLocation(locationParam, (err: teamsjs.SdkError, result: boolean): void => {
      if (err) {
        setShowLocationRes(err.errorCode.toString + ' ' + err.message);
        return;
      }
      setShowLocationRes('result: ' + result);
    });
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
      <BoxAndButton
        handleClick={getLocation}
        output={getLocationRes}
        hasInput={true}
        title="Get Location"
        name="getLocation"
      />
      <BoxAndButton
        handleClick={showLocation}
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
