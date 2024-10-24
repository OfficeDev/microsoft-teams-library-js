import { barCode } from 'testlibraryfortreeshaking';
import { geoLocation, OpenGroupChatRequest } from '@microsoft/teams-js';
barCode.hasPermission();
geoLocation.requestPermission();
geoLocation.map.isSupported();
