import { barCode } from 'testlibraryfortreeshaking';
import { geoLocation } from '@microsoft/teams-js';
barCode.hasPermission();
geoLocation.requestPermission();
geoLocation.map.isSupported();
