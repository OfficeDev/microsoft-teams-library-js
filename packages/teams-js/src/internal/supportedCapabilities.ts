/* eslint-disable @typescript-eslint/ban-types */

import { appEntity, conversations, logs, meetingRoom, notifications, remoteCamera, teams } from '../private';
import {
  appInstallDialog,
  AppInstallDialogMetadata,
  barCode,
  BarcodeMetadata,
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
import { MonetizationMetadata } from '../public/monetization';
import { PagesMetadata } from '../public/pages';
import { Runtime } from '../public/runtime';
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

interface ICapability {
  capabilityMetadata: CapabilityMetadata;
  capabilityContents: Object;
}

// Some entries in supports don't match exactly to a capability name, this map can help keep track of those inconsistencies
// Should only be needed if top level capability doesn't match name OR if there's a top level supports value with no matching
// capability (like permissions)
// This will need to be updated anytime *new* top level capability breaking changes are made
function createPublicRuntimeMap(): Map<string, ICapability> {
  return new Map([
    [
      'appInstallDialog',
      { capabilityMetadata: new AppInstallDialogMetadata(), capabilityContents: { ...appInstallDialog } },
    ], // Use the spread operator to make a copy of the capability
    ['barCode', { capabilityMetadata: new BarcodeMetadata(), capabilityContents: { ...barCode } }],
    // ['calendar', { ...calendar }],
    // ['call', { ...call }],
    // ['chat', { ...chat }],
    // ['dialog', { ...dialog }],
    // ['geoLocation', { ...geoLocation }],
    // ['location', { ...location }],
    // ['mail', { ...mail }],
    // ['menus', { ...menus }],
    ['monetization', { capabilityMetadata: new MonetizationMetadata(), capabilityContents: { ...monetization } }],
    ['pages', { capabilityMetadata: new PagesMetadata(), capabilityContents: { ...pages } }],
    // ['people', { ...people }],
    ['permissions', undefined], // permissions doesn't map to a capability
    // ['profile', { ...profile }],
    // ['search', { ...search }],
    // ['sharing', { ...sharing }],
    // ['stageView', { ...stageView }],
    // ['teamsCore', { ...teamsCore }],
    // ['video', { ...video }],
    // ['webStorage', { ...webStorage }],
  ]);
}

function createPrivateRuntimeMap(): Map<string, ICapability> {
  return new Map([
    // ['appEntity', { ...appEntity }],
    // ['conversations', { ...conversations }],
    // ['logs', { ...logs }],
    // ['meetingRoom', { ...meetingRoom }],
    // ['notifications', { ...notifications }],
    // ['remoteCamera', { ...remoteCamera }],
    // ['teams', { ...teams }],
  ]);
}
