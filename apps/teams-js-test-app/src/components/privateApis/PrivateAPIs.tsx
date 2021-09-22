import { registerUserSettingsChangeHandler, uploadCustomApp, UserSettingTypes } from '@microsoft/teamsjs-app-sdk';
import React, { ReactElement } from 'react';

import { generateJsonParseErrorMsg, noHubSdkMsg } from '../../App';
import BoxAndButton from '../BoxAndButton';

const PrivateAPIs = (): ReactElement => {
  const [uploadCustomAppRes, setUploadCustomAppRes] = React.useState('');
  const [registerUserSettingsChangeHandlerRes, setRegisterUserSettingsChangeHandlerRes] = React.useState('');

  const getUserSettingTypesFromInput = (input: string[]): UserSettingTypes[] => {
    const ret: UserSettingTypes[] = [];
    if (input.includes('fileOpenPreference')) {
      ret.push(UserSettingTypes.fileOpenPreference);
    }
    if (input.includes('theme')) {
      ret.push(UserSettingTypes.theme);
    }

    return ret;
  };

  const acceptFile = (files: FileList | null): void => {
    if (files) {
      if (files.length != 1) {
        throw new Error('There should be exactly one file uploaded.');
      }
      const onComplete = (status: boolean, reason?: string): void => {
        let message = `status: ${status}`;
        if (reason) {
          message = message + `, reason: ${reason}`;
        }
        setUploadCustomAppRes(message);
      };
      setUploadCustomAppRes('uploadCustomApp()' + noHubSdkMsg);
      uploadCustomApp(files.item(0) as Blob, onComplete);
    } else {
      setUploadCustomAppRes('Please upload a proper Custom App manifest.');
    }
  };

  const registerUserSettingsChangeHandlerInTestApp = (settingTypesInput: string): void => {
    try {
      const settingTypes: string[] = JSON.parse(settingTypesInput);
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const handler = (settingType: UserSettingTypes, value: any): void => {
        setRegisterUserSettingsChangeHandlerRes(`Success. settingType: ${settingType}, value: ${value}`);
      };
      setRegisterUserSettingsChangeHandlerRes('registerUserSettingsChangeHandler()' + noHubSdkMsg);
      registerUserSettingsChangeHandler(getUserSettingTypesFromInput(settingTypes), handler);
    } catch (error) {
      if (error instanceof SyntaxError) {
        setRegisterUserSettingsChangeHandlerRes(generateJsonParseErrorMsg());
      }
    }
  };

  const uploadCustomAppInTestApp = (): void => {
    const elem = document.getElementById('fileid');
    if (elem) {
      elem.click();
    } else {
      throw new Error('Please ensure to program a fileid element to let user upload a file.');
    }
  };

  return (
    <>
      <h1>privateAPIs</h1>
      <BoxAndButton
        handleClickWithInput={registerUserSettingsChangeHandlerInTestApp}
        output={registerUserSettingsChangeHandlerRes}
        hasInput={true}
        title="Register User Settings Change Handler"
        name="registerUserSettingsChangeHandler"
      />
      <BoxAndButton
        handleClick={uploadCustomAppInTestApp}
        output={uploadCustomAppRes}
        hasInput={false}
        title="Upload Custom App"
        name="uploadCustomApp"
      />
      <input id="fileid" type="file" onChange={e => acceptFile(e.target.files)} hidden />
    </>
  );
};

export default PrivateAPIs;
