/* eslint-disable @typescript-eslint/ban-types */

import { appEntity, conversations, logs, meetingRoom, notifications, remoteCamera, teams } from '../private';
import { AppEntityMetadata } from '../private/appEntity';
import { ConversationsMetadata } from '../private/conversations';
import { LogsMetadata } from '../private/logs';
import { MeetingRoomMetadata } from '../private/meetingRoom';
import { NotificationsMetadata } from '../private/notifications';
import { RemoteCameraMetadata } from '../private/remoteCamera';
import { TeamsMetadata } from '../private/teams';
import {
  appInstallDialog,
  barCode,
  calendar,
  call,
  chat,
  dialog,
  FrameContexts,
  geoLocation,
  location,
  mail,
  menus,
  monetization,
  pages,
  people,
  profile,
  search,
  sharing,
  stageView,
  teamsCore,
  video,
  webStorage,
} from '../public';
import { AppInstallDialogMetadata } from '../public/appInstallDialog';
import { BarcodeMetadata } from '../public/barCode';
import { CalendarMetadata } from '../public/calendar';
import { CallMetadata } from '../public/call';
import { ChatMetadata } from '../public/chat';
import { DialogMetadata } from '../public/dialog';
import { GeoLocationMetadata } from '../public/geoLocation';
import { LocationMetadata } from '../public/location';
import { MailMetadata } from '../public/mail';
import { MenusMetadata } from '../public/menus';
import { MonetizationMetadata } from '../public/monetization';
import { PagesMetadata } from '../public/pages';
import { PeopleMetadata } from '../public/people';
import { ProfileMetadata } from '../public/profile';
import { Runtime } from '../public/runtime';
import { SearchMetadata } from '../public/search';
import { SharingMetadata } from '../public/sharing';
import { StageViewMetadata } from '../public/stageView';
import { TeamsCoreMetadata } from '../public/teamsAPIs';
import { VideoMetadata } from '../public/video';
import { WebStorageMetadata } from '../public/webStorage';
import { CapabilityMetadata } from './capability';

export type MicrosoftOnlyCapabilities = {
  readonly appEntity: typeof appEntity;
  readonly conversations: typeof conversations;
  readonly logs: typeof logs;
  readonly meetingRoom: typeof meetingRoom;
  readonly notifications: typeof notifications;
  readonly remoteCamera: typeof remoteCamera;
  readonly teams: typeof teams;
};

// TODO: The top-level capability comments get stripped out of this. These comments may need to live here or be copied here
// for now
// I wonder if there's some typedoc fanciness that will let me link to the other comments
export interface SupportedCapabilities {
  readonly appInstallDialog: typeof appInstallDialog;
  readonly barCode: typeof barCode;
  readonly calendar: typeof calendar;
  readonly call: typeof call;
  readonly chat: typeof chat;
  readonly dialog: typeof dialog;
  readonly geoLocation: typeof geoLocation;
  readonly location: typeof location;
  readonly mail: typeof mail;
  readonly menus: typeof menus;
  readonly microsoftOnly?: MicrosoftOnlyCapabilities;
  readonly monetization: typeof monetization;
  readonly pages: typeof pages;
  readonly people: typeof people;
  readonly profile: typeof profile;
  readonly search: typeof search;
  readonly sharing: typeof sharing;
  readonly stageView: typeof stageView;
  readonly teamsCore: typeof teamsCore;
  readonly video: typeof video;
  readonly webStorage: typeof webStorage;
}

export function getSupportedCapabilities(
  runtime: Runtime,
  frameContext: FrameContexts,
  getPrivateFunctions = false,
): SupportedCapabilities {
  const supportedCapabilities = { microsoftOnly: getPrivateFunctions ? {} : undefined };
  const runtimeMap = getMapForPassedInRuntimeVersion(runtime);
  const privateRuntimeMap = getPrivateMapForPassedInRuntimeVersion(runtime);

  addTopLevelCapabilities(supportedCapabilities, runtimeMap, frameContext);

  if (getPrivateFunctions && supportedCapabilities.microsoftOnly !== undefined) {
    addTopLevelCapabilities(supportedCapabilities.microsoftOnly, privateRuntimeMap, frameContext);
  }

  return supportedCapabilities as unknown as SupportedCapabilities;
}

function addTopLevelCapabilities(
  supportedCapabilities: Object,
  map: Map<string, ICapability>,
  frameContext: FrameContexts,
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map.forEach((capability: ICapability, capabilityName) => {
    if (!capability) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (capability && (capability.capabilityContents as any).isSupported) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((capability.capabilityContents as any).isSupported()) {
        if (map.has(capabilityName)) {
          capability.capabilityContents = map.get(capabilityName)?.capabilityContents;
          supportedCapabilities = fillOutSupportedCapability(
            capabilityName,
            supportedCapabilities,
            capability,
            frameContext,
          );
        }
      } else {
        supportedCapabilities[capabilityName] = removeAllUnsupportedFunctions(capability);
      }
    }
  });
}

function removeAllUnsupportedFunctions(capability: ICapability): Object {
  Object.values(capability.capabilityContents).forEach((entry) => {
    if (entry instanceof Function && entry.name !== 'isSupported') {
      capability.capabilityContents[entry.name] = undefined;
    }
  });
  return capability.capabilityContents;
}

function fillOutSupportedCapability(
  capabilityName: string,
  supportedCapabilities: Object,
  capability: ICapability,
  frameContext: FrameContexts,
): Object {
  supportedCapabilities[capabilityName] = capability.capabilityContents;
  // Also, think about how to handle things like exported interfaces (which don't show up here)
  Object.values(capability.capabilityContents).forEach((value, index) => {
    // Make sure that we only recursively check objects that contain definitions for isSupported
    // (skip functions and enums for example and just leave those alone)
    if (value && !(value instanceof Function) && value.isSupported) {
      if (!value.isSupported()) {
        // if a subcapability is not supported, remove all entries from it other than isSupported and namespaces
        const subCapability = supportedCapabilities[capabilityName][Object.keys(capability.capabilityContents)[index]];
        // TODO call removeAllUnsupportedFunctions instead//////////////////////
        Object.values(subCapability).forEach((subCapabilityEntry) => {
          if (subCapabilityEntry instanceof Function && subCapabilityEntry.name !== 'isSupported') {
            subCapability[subCapabilityEntry.name] = undefined;
          }
        });
        ////////////////////////////////////////////////////////////////////////
        supportedCapabilities[capabilityName][Object.keys(capability.capabilityContents)[index]] = subCapability;
      }

      // recursively check subcapability for more subcapabilities
      fillOutSupportedCapability(
        Object.keys(capability.capabilityContents)[index],
        supportedCapabilities[capabilityName],
        { capabilityMetadata: capability.capabilityMetadata, capabilityContents: value },
        frameContext,
      );
    } else if (value) {
      const functionName = Object.keys(capability.capabilityContents)[index];
      if (functionName === 'isSupported') {
        return;
      }
      // const allowedFrameContexts = capability.capabilityMetadata.getFrameContextsForFunction(value);
      // if (!allowedFrameContexts.includes(frameContext)) {
      //   supportedCapabilities[capabilityName][functionName] = undefined;
      // }
      if (!capability.capabilityMetadata.isFrameContextValidForFunction(frameContext, value)) {
        supportedCapabilities[capabilityName][functionName] = undefined;
      }
    }
  });
  return supportedCapabilities;
}

function getMapForPassedInRuntimeVersion(runtime: Runtime): Map<string, ICapability> {
  if (runtime.apiVersion <= 2) {
    return createPublicRuntimeMap();
  }

  throw new Error(`Unsupported runtime version: ${runtime.apiVersion}`);
}

function getPrivateMapForPassedInRuntimeVersion(runtime: Runtime): Map<string, ICapability> {
  if (runtime.apiVersion <= 2) {
    return createPrivateRuntimeMap();
  }

  throw new Error(`Unsupported runtime version: ${runtime.apiVersion}`);
}

// Some entries in supports don't match exactly to a capability name, this map can help keep track of those inconsistencies
// Should only be needed if top level capability doesn't match name OR if there's a top level supports value with no matching
// capability (like permissions)
// This will need to be updated anytime *new* top level capability breaking changes are made
function createPublicRuntimeMap(): Map<string, ICapability> {
  return new Map([
    ['appInstallDialog', createCapability(new AppInstallDialogMetadata(), appInstallDialog)],
    ['barCode', createCapability(new BarcodeMetadata(), barCode)],
    ['calendar', createCapability(new CalendarMetadata(), calendar)],
    ['call', createCapability(new CallMetadata(), call)],
    ['chat', createCapability(new ChatMetadata(), chat)],
    ['dialog', createCapability(new DialogMetadata(), dialog)],
    ['geoLocation', createCapability(new GeoLocationMetadata(), geoLocation)],
    ['location', createCapability(new LocationMetadata(), location)],
    ['mail', createCapability(new MailMetadata(), mail)],
    ['menus', createCapability(new MenusMetadata(), menus)],
    ['monetization', createCapability(new MonetizationMetadata(), monetization)],
    ['pages', createCapability(new PagesMetadata(), pages)],
    ['people', createCapability(new PeopleMetadata(), people)],
    ['permissions', undefined], // permissions doesn't map to a capability
    ['profile', createCapability(new ProfileMetadata(), profile)],
    ['search', createCapability(new SearchMetadata(), search)],
    ['sharing', createCapability(new SharingMetadata(), sharing)],
    ['stageView', createCapability(new StageViewMetadata(), stageView)],
    ['teamsCore', createCapability(new TeamsCoreMetadata(), teamsCore)],
    ['video', createCapability(new VideoMetadata(), video)],
    ['webStorage', createCapability(new WebStorageMetadata(), webStorage)],
  ]);
}

function createPrivateRuntimeMap(): Map<string, ICapability> {
  return new Map([
    ['appEntity', createCapability(new AppEntityMetadata(), appEntity)],
    ['conversations', createCapability(new ConversationsMetadata(), conversations)],
    ['logs', createCapability(new LogsMetadata(), logs)],
    ['meetingRoom', createCapability(new MeetingRoomMetadata(), meetingRoom)],
    ['notifications', createCapability(new NotificationsMetadata(), notifications)],
    ['remoteCamera', createCapability(new RemoteCameraMetadata(), remoteCamera)],
    ['teams', createCapability(new TeamsMetadata(), teams)],
  ]);
}

interface ICapability {
  capabilityMetadata: CapabilityMetadata;
  capabilityContents: Object;
}

function createCapability(capabilityMetadata: CapabilityMetadata, capabilityContents: unknown): ICapability {
  return {
    capabilityMetadata,
    capabilityContents: deepCopy(capabilityContents),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepCopy(obj: any): any {
  // Handle the 3 simple types, and null or undefined
  if (null == obj || 'object' != typeof obj) {
    return obj;
  }

  // Handle Date
  if (obj instanceof Date) {
    const copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    const copy = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = deepCopy(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    const copy = {};
    for (const attr in obj) {
      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty(attr)) {
        const foo = deepCopy(obj[attr]);
        copy[attr] = foo;
      }
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
}
