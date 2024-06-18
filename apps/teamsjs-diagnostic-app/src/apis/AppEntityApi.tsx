import { appEntity } from '@microsoft/teams-js';
import { captureConsoleLogs } from './../components/sample/LoggerUtility';

const checkAppEntityCapability = async () => {
  captureConsoleLogs((log) => console.log(log));

  console.log('Checking if AppEntity module is supported...');
  const isSupported = appEntity.isSupported();
  console.log(`AppEntity module ${isSupported ? 'is' : 'is not'} supported`);
  return `AppEntity module ${isSupported ? 'is' : 'is not'} supported`;
};

export default checkAppEntityCapability;
