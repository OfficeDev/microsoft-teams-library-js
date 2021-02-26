import React, { ReactElement } from 'react';
import { location } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const LocationAPIs = (): ReactElement => {
  const [getLocationRes, setGetLocationRes] = React.useState('');
  const [showLocationRes, setShowLocationRes] = React.useState('');

  const getLocation = (locationProps: any): void => {
    setGetLocationRes('location.getLocation()' + noHubSdkMsg);
    location.getLocation(locationProps, (err: teamsjs.SdkError, location: teamsjs.location.Location): void => {
      if (err) {
        setGetLocationRes(err.errorCode.toString + ' ' + err.message);
        return;
      }
      setGetLocationRes(JSON.stringify(location));
    });
  };

  const showLocation = (location: any): void => {
    setShowLocationRes('location.showLocation()' + noHubSdkMsg);
    location.showLocation(location, (err: teamsjs.SdkError, result: boolean): void => {
      if (err) {
        setShowLocationRes(err.errorCode.toString + ' ' + err.message);
        return;
      }
      setShowLocationRes('result: ' + result);
    });
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
    </>
  );
};

export default LocationAPIs;
