/* eslint-disable @typescript-eslint/ban-types */

import { appEntity, conversations, logs, meetingRoom, notifications, remoteCamera, teams } from './private';
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
} from './public';
import { Runtime } from './public/runtime';

// Some entries in supports don't match exactly to a capability name, this map can help keep track of those inconsistencies
// Should only be needed if top level capability doesn't match name OR if there's a top level supports value with no matching
// capability (like permissions)
const capabilityToSupportsNameMapV2 = new Map([
  ['appEntity', appEntity as Object],
  ['appInstallDialog', appInstallDialog as Object],
  ['barCode', barCode as Object],
  ['calendar', calendar as Object],
  ['call', call as Object],
  ['chat', chat as Object],
  ['conversations', conversations as Object],
  ['dialog', dialog as Object],
  ['geoLocation', geoLocation as Object],
  ['location', location as Object],
  ['logs', logs as Object],
  ['mail', mail as Object],
  ['meetingRoom', meetingRoom as Object],
  ['menus', menus as Object],
  ['monetization', monetization as Object],
  ['notifications', notifications as Object],
  ['pages', pages as Object],
  ['people', people as Object],
  ['permissions', undefined], // permissions doesn't map to a capability
  ['profile', profile as Object],
  ['remoteCamera', remoteCamera as Object],
  ['search', search as Object],
  ['sharing', sharing as Object],
  ['stageView', stageView as Object],
  ['teams', teams as Object],
  ['teamsCore', teamsCore as Object],
  ['video', video as Object],
  ['webStorage', webStorage as Object],
]);

// TODO: The top-level capability comments get stripped out of this. These comments may need to live here or be copied here
// for now
// I wonder if there's some typedoc fanciness that will let me link to the other comments
export interface SupportedCapabilities {
  readonly appEntity: typeof appEntity;
  readonly appInstallDialog: typeof appInstallDialog;
  readonly barCode: typeof barCode;
  readonly calendar: typeof calendar;
  readonly call: typeof call;
  readonly chat: typeof chat;
  readonly conversations: typeof conversations;
  readonly dialog: typeof dialog;
  readonly geoLocation: typeof geoLocation;
  readonly location: typeof location;
  readonly logs: typeof logs;
  readonly mail: typeof mail;
  readonly meetingRoom: typeof meetingRoom;
  readonly menus: typeof menus;
  readonly monetization: typeof monetization;
  readonly notifications: typeof notifications;
  readonly pages: typeof pages;
  readonly people: typeof people;
  readonly profile: typeof profile;
  readonly remoteCamera: typeof remoteCamera;
  readonly search: typeof search;
  readonly sharing: typeof sharing;
  readonly stageView: typeof stageView;
  readonly teams: typeof teams;
  readonly teamsCore: typeof teamsCore;
  readonly video: typeof video;
  readonly webStorage: typeof webStorage;
}

export function getSupportedCapabilities(runtime: Runtime): SupportedCapabilities {
  let supportedCapabilities = {};

  // Go through each value in the list of capabilities that the host supports, capturing the name and index of each
  Object.keys(runtime.supports).forEach((capabilityName, capabilityIndex) => {
    if (capabilityToSupportsNameMapV2.has(capabilityName)) {
      const capability = capabilityToSupportsNameMapV2.get(capabilityName);
      // Check if capability is undefined so we don't generate an entry for runtime objects
      // that don't map to capabilities
      if (capability && Object.values(runtime.supports)[capabilityIndex]) {
        supportedCapabilities = fillOutSupportedCapability(capabilityName, supportedCapabilities, capability);
      }
    }
  });

  return supportedCapabilities as SupportedCapabilities;
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
