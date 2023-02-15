/* eslint-disable @typescript-eslint/ban-types */

import { appEntity, conversations, logs, meetingRoom, notifications, remoteCamera, teams } from '../private';
import {
  appInstallDialog,
  barCode,
  calendar,
  call,
  chat,
  dialog,
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
import { Runtime } from '../public/runtime';

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

export function getSupportedCapabilities(runtime: Runtime, getPrivateFunctions = false): SupportedCapabilities {
  const supportedCapabilities = { microsoftOnly: getPrivateFunctions ? {} : undefined };
  const runtimeMap = getMapForPassedInRuntimeVersion(runtime);
  const privateRuntimeMap = getPrivateMapForPassedInRuntimeVersion(runtime);

  addTopLevelCapabilities(supportedCapabilities, runtimeMap);

  if (getPrivateFunctions && supportedCapabilities.microsoftOnly !== undefined) {
    addTopLevelCapabilities(supportedCapabilities.microsoftOnly, privateRuntimeMap);
  }

  return supportedCapabilities as unknown as SupportedCapabilities;
}

function addTopLevelCapabilities(supportedCapabilities: Object, map: Map<string, Object>): Object {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map.forEach((capability: any, capabilityName) => {
    if (!capability) {
      return;
    }

    if (capability && capability.isSupported) {
      if (capability.isSupported()) {
        if (map.has(capabilityName)) {
          capability = map.get(capabilityName);
          supportedCapabilities = fillOutSupportedCapability(capabilityName, supportedCapabilities, capability);
        }
      } else {
        supportedCapabilities[capabilityName] = removeAllUnsupportedFunctions(capability);
      }
    }
  });

  return supportedCapabilities;
}

function removeAllUnsupportedFunctions(capability: Object): Object {
  Object.values(capability).forEach((entry) => {
    if (entry instanceof Function && entry.name !== 'isSupported') {
      capability[entry.name] = undefined;
    }
  });
  return capability;
}

function fillOutSupportedCapability(capabilityName: string, supportedCapabilities: Object, capability: Object): Object {
  supportedCapabilities[capabilityName] = capability;
  // Also, think about how to handle things like exported interfaces (which don't show up here)
  Object.values(capability).forEach((value, index) => {
    // Make sure that we only recursively check objects that contain definitions for isSupported
    // (skip functions and enums for example and just leave those alone)
    if (value && !(value instanceof Function) && value.isSupported) {
      if (!value.isSupported()) {
        // if a subcapability is not supported, remove all entries from it other than isSupported and namespaces
        const subCapability = supportedCapabilities[capabilityName][Object.keys(capability)[index]];
        Object.values(subCapability).forEach((subCapabilityEntry) => {
          if (subCapabilityEntry instanceof Function && subCapabilityEntry.name !== 'isSupported') {
            subCapability[subCapabilityEntry.name] = undefined;
          }
        });
        supportedCapabilities[capabilityName][Object.keys(capability)[index]] = subCapability;
      }

      // recursively check subcapability for more subcapabilities
      fillOutSupportedCapability(Object.keys(capability)[index], supportedCapabilities[capabilityName], value);
    }
  });
  return supportedCapabilities;
}

function getMapForPassedInRuntimeVersion(runtime: Runtime): Map<string, Object> {
  if (runtime.apiVersion <= 2) {
    return createPublicRuntimeMap();
  }

  throw new Error(`Unsupported runtime version: ${runtime.apiVersion}`);
}

function getPrivateMapForPassedInRuntimeVersion(runtime: Runtime): Map<string, Object> {
  if (runtime.apiVersion <= 2) {
    return createPrivateRuntimeMap();
  }

  throw new Error(`Unsupported runtime version: ${runtime.apiVersion}`);
}

// Some entries in supports don't match exactly to a capability name, this map can help keep track of those inconsistencies
// Should only be needed if top level capability doesn't match name OR if there's a top level supports value with no matching
// capability (like permissions)
// This will need to be updated anytime *new* top level capability breaking changes are made
function createPublicRuntimeMap(): Map<string, Object> {
  return new Map([
    ['appInstallDialog', { ...appInstallDialog }], // Use the spread operator to make a copy of the capability
    ['barCode', { ...barCode }],
    ['calendar', { ...calendar }],
    ['call', { ...call }],
    ['chat', { ...chat }],
    ['dialog', { ...dialog }],
    ['geoLocation', { ...geoLocation }],
    ['location', { ...location }],
    ['mail', { ...mail }],
    ['menus', { ...menus }],
    ['monetization', { ...monetization }],
    ['pages', { ...pages }],
    ['people', { ...people }],
    ['permissions', undefined], // permissions doesn't map to a capability
    ['profile', { ...profile }],
    ['search', { ...search }],
    ['sharing', { ...sharing }],
    ['stageView', { ...stageView }],
    ['teamsCore', { ...teamsCore }],
    ['video', { ...video }],
    ['webStorage', { ...webStorage }],
  ]);
}

function createPrivateRuntimeMap(): Map<string, Object> {
  return new Map([
    ['appEntity', { ...appEntity }],
    ['conversations', { ...conversations }],
    ['logs', { ...logs }],
    ['meetingRoom', { ...meetingRoom }],
    ['notifications', { ...notifications }],
    ['remoteCamera', { ...remoteCamera }],
    ['teams', { ...teams }],
  ]);
}
