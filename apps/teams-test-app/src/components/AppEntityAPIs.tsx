import { app, appEntity, Context, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';

interface AppEntityParams {
  threadId: string;
  categories: string[];
}
const AppEntityAPIs = (): ReactElement => {
  const [selectAppEntityRes, setSelectAppEntityRes] = React.useState('');
  const [capabilityCheckRes, setCapabilityCheckRes] = React.useState('');

  const handleClickOnSelectAppEntity = (input: string): void => {
    const appEntityParams: AppEntityParams = JSON.parse(input);
    const callback = (error?: SdkError, entity?: appEntity.AppEntity): void => {
      if (entity) {
        setSelectAppEntityRes(JSON.stringify(entity));
      } else if (error) {
        setSelectAppEntityRes(JSON.stringify(error));
      }
    };
    setSelectAppEntityRes('appEntity.selectAppEntity()' + noHostSdkMsg);
    app.getContext().then((res: Context) => {
      if (res.page.subPageId !== undefined) {
        appEntity.selectAppEntity(appEntityParams.threadId, appEntityParams.categories, res.page.subPageId, callback);
      } else {
        appEntity.selectAppEntity(appEntityParams.threadId, appEntityParams.categories, '', callback);
      }
    });
  };

  const checkAppEntityCapability = (): void => {
    if (appEntity.isSupported()) {
      setCapabilityCheckRes('AppEntity is supported');
    } else {
      setCapabilityCheckRes('AppEntity is not supported');
    }
  };

  return (
    <>
      <h1>appEntity</h1>
      <BoxAndButton
        handleClickWithInput={handleClickOnSelectAppEntity}
        output={selectAppEntityRes}
        hasInput={true}
        title="Select AppEntity"
        name="select_appEntity"
      />
      <BoxAndButton
        handleClick={checkAppEntityCapability}
        output={capabilityCheckRes}
        hasInput={false}
        title="Check AppEntity Capability"
        name="checkAppEntityCapability"
      />
    </>
  );
};

export default AppEntityAPIs;
