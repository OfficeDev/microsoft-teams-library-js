import {
  FilePreviewParameters,
  openFilePreview,
  registerUserSettingsChangeHandler,
  uploadCustomApp,
  UserSettingTypes,
} from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../../App';
import { ApiWithoutInput, ApiWithTextInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

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

const RegisterUserSettingsChangeHandler = (): React.ReactElement =>
  ApiWithTextInput<string[]>({
    name: 'registerUserSettingsChangeHandler',
    title: 'Register User Settings Change Handler',
    onClick: {
      validateInput: (input) => {
        if (!input || !Array.isArray(input) || input.length === 0 || input.find((x) => typeof x !== 'string')) {
          throw new Error('input has to be an array of strings with at least one element.');
        }
      },
      submit: async (input, setResult) => {
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        const handler = (settingType: UserSettingTypes, value: any): void => {
          setResult(`Success. settingType: ${settingType}, value: ${value}`);
        };

        registerUserSettingsChangeHandler(getUserSettingTypesFromInput(input), handler);
        return 'Called';
      },
    },
  });

const PrivateAPIs = (): ReactElement => {
  const setUploadCustomAppRes = React.useRef<(result: string) => void>();

  const UploadCustomApp = (): React.ReactElement =>
    ApiWithoutInput({
      name: 'uploadCustomApp',
      title: 'Upload Custom App',
      onClick: async (setResult) => {
        const elem = document.getElementById('fileid');
        if (elem) {
          setUploadCustomAppRes.current = setResult;
          elem.click();
        } else {
          throw new Error('Please ensure to program a fileid element to let user upload a file.');
        }
        return '';
      },
    });

  const acceptFile = (files: FileList | null): void => {
    if (setUploadCustomAppRes.current) {
      const setResult = setUploadCustomAppRes.current;

      if (files) {
        if (files.length != 1) {
          throw new Error('There should be exactly one file uploaded.');
        }
        const onComplete = (status: boolean, reason?: string): void => {
          let message = `status: ${status}`;
          if (reason) {
            message = message + `, reason: ${reason}`;
          }
          setResult(message);
        };
        setResult('uploadCustomApp()' + noHostSdkMsg);
        uploadCustomApp(files.item(0) as Blob, onComplete);
      } else {
        setResult('Please upload a proper Custom App manifest.');
      }
    }
  };

  const OpenFilePreview = (): React.ReactElement =>
    ApiWithTextInput<FilePreviewParameters>({
      name: 'openFilePreview',
      title: 'Open File Preview',
      onClick: {
        validateInput: (input) => {
          if (!input.type || !input.objectUrl) {
            throw new Error('type and objectUrl are all required on the input object.');
          }
        },
        submit: async (input) => {
          openFilePreview(input);
          return 'Called';
        },
      },
    });

  return (
    <ModuleWrapper title="PrivateAPIs">
      <RegisterUserSettingsChangeHandler />
      <UploadCustomApp />
      <OpenFilePreview />
      <input id="fileid" type="file" onChange={(e) => acceptFile(e.target.files)} hidden />
    </ModuleWrapper>
  );
};

export default PrivateAPIs;
