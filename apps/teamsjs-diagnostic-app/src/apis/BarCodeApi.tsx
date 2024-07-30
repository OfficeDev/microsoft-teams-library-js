import { barCode } from '@microsoft/teams-js';
import { ApiComponent } from '../components/sample/ApiComponents';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';

export const barCode_CheckBarCodeCapability = async (): Promise<void> => {
  console.log('Executing CheckBarCodeCapability...');
  
  try {
    const result = barCode.isSupported();
    if (result) {
      console.log('BarCode module is supported.');
    } else {
      console.log('BarCode module is not supported. BarCode is not supported on Teams, M365, or Outlook on Web, Desktop, or Mobile.');
      console.log ('Note: BarCode API is in Beta and provided as a preview for developers and may change based on feedback that we receive. Do not use this API in a production environment.');
      throw new Error('BarCode capability is not supported.');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking BarCode capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

export const barCode_ScanBarCode = async (config: barCode.BarCodeConfig = {}): Promise<string> => {
  console.log('Executing ScanBarCode with config:', JSON.stringify(config, null, 2));

  try {
    const scannedCode = await barCode.scanBarCode(config);
    console.log('Scanned code result:', scannedCode);
    return scannedCode;

  } catch (error) {
    console.log('Error scanning BarCode:', JSON.stringify(error, null, 2));
    console.log('ScanBarCode functionality is currently not supported on Teams, M365, or Outlook on Web, Desktop, or Mobile.');
    console.log ('Note: BarCode API is in Beta and provided as a preview for developers and may change based on feedback that we receive. Do not use this API in a production environment.');
    throw error;
  }
};

export const barCode_HasBarCodePermission = async (): Promise<void> => {
  console.log('Executing HasBarCodePermission...');
  try {
    await barCode.hasPermission();
    console.log('BarCode permission has been granted.');
  } catch (error) {
    console.log('Error checking BarCode permission:', JSON.stringify(error, null, 2));
    console.log('HasBarCodePermission functionality is currently not supported on Teams, M365, or Outlook on Web, Desktop, or Mobile.');
    console.log ('Note: BarCode API is in Beta and provided as a preview for developers and may change based on feedback that we receive. Do not use this API in a production environment.');

    throw error;
  }
};

const functionsRequiringInput = [
  'ScanBarCode'
]; // List of functions requiring input

interface BarCodeAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const BarCodeAPIs: React.FC<BarCodeAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
      functionsRequiringInput={functionsRequiringInput}
    />
  );
};

export default BarCodeAPIs;
