//import { AppAPIs } from './../../apis/AppApi';
import AppInstallDialogAPIs from '../../apis/AppInstallDialogApi';
//import { AuthenticationAPIs } from '../../apis/AuthenticationApi';
//import AppEntityAPIs from './../../apis/AppEntityApi';
import BarCodeAPIs from './../../apis/BarCodeApi';
import CalendarAPIs from './../../apis/CalendarApi';
import CallAPIs from './../../apis/CallApi';
import ChatAPIs from './../../apis/ChatApi';
import ClipboardAPIs from './../../apis/ClipboardApi';
import CustomAPIs from './../../apis/CustomApi';
import DialogAPIs from './../../apis/DialogApi';
import DialogCardAPIs from './../../apis/DialogCardApi';
import { ApiWithTextInput } from '../../apis/utils/ApiWithTextInput';
import { ApiWithCheckboxInput } from '../../apis/utils/ApiWithCheckboxInput';

/* IMPLEMENT WHEN DO FULL FUNCTIONING APP
import { DialogCardBotAPIs } from '../../apis/DialogCardBotApi';
import { DialogUpdateAPIs } from '../../apis/DialogUpdateApi';
import { DialogUrlAPIs } from '../../apis/DialogUrlApi';
import { DialogUrlBotAPIs } from '../../apis/DialogUrlBotApi';
import { DialogUrlParentCommunicationAPIs } from '../../apis/DialogUrlParentCommunicationApi';
import { ExternalAppAuthenticationAPIs } from '../../apis/ExternalAppAuthenticationApi';
import { ExternalAppCardActionsAPIs } from '../../apis/ExternalAppCardActionsApi';
import { ExternalAppCommandsAPIs } from '../../apis/ExternalAppCommandsApi';
import { FilesAPIs } from '../../apis/FilesApi';
import { FullTrustAPIs } from '../../apis/FullTrustApi';
import { GeoLocationAPIs } from '../../apis/GeoLocationApi';
import { Links } from '../../apis/Links';
import { LocationAPIs } from '../../apis/LocationApi';
import { LogAPIs } from '../../apis/LogApi';
import { MailAPIs } from '../../apis/MailApi';
import { MarketplaceAPIs } from '../../apis/MarketplaceApi';
import { MediaAPIs } from '../../apis/MediaApi';
import { MeetingAPIs } from '../../apis/MeetingApi';
import { MeetingRoomAPIs } from '../../apis/MeetingRoomApi';
import { MenusAPIs } from '../../apis/MenusApi';
import { MessageChannelAPIs } from '../../apis/MessageChannelApi';
import { MonetizationAPIs } from '../../apis/MonetizationApi';
import { NestedAppAuthAPIs } from '../../apis/NestedAppAuthApi';
import { NotificationAPIs } from '../../apis/NotificationApi';
import { OtherAppStateChangedAPIs } from '../../apis/OtherAppStateChangedApi';
import { PagesAPIs } from '../../apis/PagesApi';
import { PagesAppButtonAPIs } from '../../apis/PagesAppButtonApi';
import { PagesBackStackAPIs } from '../../apis/PagesBackStackApi';
import { PagesConfigAPIs } from '../../apis/PagesConfigApi';
import { PagesCurrentAppAPIs } from '../../apis/PagesCurrentAppApi';
import { PagesTabsAPIs } from '../../apis/PagesTabsApi';
import { PeopleAPIs } from '../../apis/PeopleApi';
import { PrivateAPIs } from '../../apis/PrivateApi';
import { ProfileAPIs } from '../../apis/ProfileApi';
import { RemoteCameraAPIs } from '../../apis/RemoteCameraApi';
import { SearchAPIs } from '../../apis/SearchApi';
import { SecondaryBrowserAPIs } from '../../apis/SecondaryBrowserApi';
import { SharingAPIs } from '../../apis/SharingApi';
import { WebStorageAPIs } from '../../apis/WebStorageApi';
import { StageViewAPIs } from '../../apis/StageViewApi';
import { TeamsCoreAPIs } from '../../apis/TeamsCoreApi';
import { TeamsAPIs } from '../../apis/TeamsApi';
import { ThirdPartyCloudStorageAPIs } from '../../apis/ThirdPartyCloudStorageApi';
import { VideoAPIs } from '../../apis/VideoApi';
import { VideoExAPIs } from '../../apis/VideoExApi';
import { VisualMediaAPIs } from '../../apis/VisualMediaApi';*/

const apiComponents = [
  { component: AppInstallDialogAPIs, title: 'AppInstallDialogAPIs' },
  //{ component: AppEntityAPIs, title: 'AppEntityAPIs' },
  { component: BarCodeAPIs, title: 'BarCodeAPIs' },
  { component: CalendarAPIs, title: 'CalendarAPIs' },
  { component: CallAPIs, title: 'CallAPIs' },
  { component: ChatAPIs, title: 'ChatAPIs' },
  { component: ClipboardAPIs, title: 'ClipboardAPIs' },
  { component: CustomAPIs, title: 'CustomAPIs' },
  { component: DialogAPIs, title: 'DialogAPIs' },
  { component: DialogCardAPIs, title: 'DialogCardAPIs' },
  { component: ApiWithTextInput, title: 'ApiWithTextInput', inputType: 'text' },
  { component: ApiWithCheckboxInput, title: 'ApiWithCheckboxInput', inputType: 'checkbox' },
  /*
  DialogCardBotAPIs,
  DialogUpdateAPIs,
  DialogUrlAPIs,
  DialogUrlBotAPIs,
  DialogUrlParentCommunicationAPIs,
  ExternalAppAuthenticationAPIs,
  ExternalAppCardActionsAPIs,
  ExternalAppCommandsAPIs,
  FilesAPIs,
  FullTrustAPIs,
  GeoLocationAPIs,
  Links,
  LocationAPIs,
  LogAPIs,
  MailAPIs,
  MarketplaceAPIs,
  MediaAPIs,
  MeetingAPIs,
  MeetingRoomAPIs,
  MenusAPIs,
  MessageChannelAPIs,
  MonetizationAPIs,
  NestedAppAuthAPIs,
  NotificationAPIs,
  OtherAppStateChangedAPIs,
  PagesAPIs,
  PagesAppButtonAPIs,
  PagesBackStackAPIs,
  PagesConfigAPIs,
  PagesCurrentAppAPIs,
  PagesTabsAPIs,
  PeopleAPIs,
  PrivateAPIs,
  ProfileAPIs,
  RemoteCameraAPIs,
  SearchAPIs,
  SecondaryBrowserAPIs,
  SharingAPIs,
  WebStorageAPIs,
  StageViewAPIs,
  TeamsCoreAPIs,
  TeamsAPIs,
  ThirdPartyCloudStorageAPIs,
  VideoAPIs,
  VideoExAPIs,
  VisualMediaAPIs,*/
];

export default apiComponents;
