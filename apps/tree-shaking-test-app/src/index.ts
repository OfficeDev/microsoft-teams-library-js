import { barCode } from 'testlibraryfortreeshaking';
//import { PrintTestMessage } from 'testlibraryfortreeshaking/app';
import { geoLocation } from '@microsoft/teams-js';

//import { barCode } from '@microsoft/teams-js';

//import { clipboard } from '@microsoft/teams-js';
//clipboard.read();

//import { app } from '@microsoft/teams-js';
//app.getContext();

barCode.hasPermission();
//PrintTestMessage();
//barCode.scanBarCode({});
//barCode.hasPermission();

geoLocation.requestPermission();
geoLocation.map.isSupported();
