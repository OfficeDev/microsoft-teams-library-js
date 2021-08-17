/* eslint-disable @typescript-eslint/ban-types */
import * as uuid from 'uuid';
import { validOrigins } from './constants';
import { GlobalVars } from '../internal/globalVars';
import { HostClientType, HostName } from '../public/constants';
import { Context, ContextBridge } from '../public/interfaces';

/**
 * @param pattern reference pattern
 * @param host candidate string
 * returns true if host matches pre-know valid pattern
 * For example,
 *    validateHostAgainstPattern('*.teams.microsoft.com', 'subdomain.teams.microsoft.com') returns true
 *    validateHostAgainstPattern('teams.microsoft.com', 'team.microsoft.com') returns false
 */
function validateHostAgainstPattern(pattern: string, host: string): boolean {
  if (pattern.substring(0, 2) === '*.') {
    const suffix = pattern.substring(1);
    if (
      host.length > suffix.length &&
      host.split('.').length === suffix.split('.').length &&
      host.substring(host.length - suffix.length) === suffix
    ) {
      return true;
    }
  } else if (pattern === host) {
    return true;
  }
  return false;
}

export function validateOrigin(messageOrigin: URL): boolean {
  // Check whether the url is in the pre-known allowlist or supplied by user
  if (messageOrigin.protocol !== 'https:') {
    return false;
  }
  const messageOriginHost = messageOrigin.host;

  if (validOrigins.some(pattern => validateHostAgainstPattern(pattern, messageOriginHost))) {
    return true;
  }

  for (const domainOrPattern of GlobalVars.additionalValidOrigins) {
    const pattern = domainOrPattern.substring(0, 8) === 'https://' ? domainOrPattern.substring(8) : domainOrPattern;
    if (validateHostAgainstPattern(pattern, messageOriginHost)) {
      return true;
    }
  }

  return false;
}

export function getGenericOnCompleteHandler(errorMessage?: string): (success: boolean, reason?: string) => void {
  return (success: boolean, reason: string): void => {
    if (!success) {
      throw new Error(errorMessage ? errorMessage : reason);
    }
  };
}

/**
 * Compares SDK versions.
 * @param v1 first version
 * @param v2 second version
 * returns NaN in case inputs are not in right format
 *         -1 if v1 < v2
 *          1 if v1 > v2
 *          0 otherwise
 * For example,
 *    compareSDKVersions('1.2', '1.2.0') returns 0
 *    compareSDKVersions('1.2a', '1.2b') returns NaN
 *    compareSDKVersions('1.2', '1.3') returns -1
 *    compareSDKVersions('2.0', '1.3.2') returns 1
 *    compareSDKVersions('2.0', 2.0) returns NaN
 */
export function compareSDKVersions(v1: string, v2: string): number {
  if (typeof v1 !== 'string' || typeof v2 !== 'string') {
    return NaN;
  }

  const v1parts = v1.split('.');
  const v2parts = v2.split('.');

  function isValidPart(x: string): boolean {
    // input has to have one or more digits
    // For ex - returns true for '11', false for '1a1', false for 'a', false for '2b'
    return /^\d+$/.test(x);
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    return NaN;
  }

  // Make length of both parts equal
  while (v1parts.length < v2parts.length) {
    v1parts.push('0');
  }
  while (v2parts.length < v1parts.length) {
    v2parts.push('0');
  }

  for (let i = 0; i < v1parts.length; ++i) {
    if (Number(v1parts[i]) == Number(v2parts[i])) {
      continue;
    } else if (Number(v1parts[i]) > Number(v2parts[i])) {
      return 1;
    } else {
      return -1;
    }
  }
  return 0;
}

/**
 * Generates a GUID
 */
export function generateGUID(): string {
  return uuid.v4();
}

export function deepFreeze<T extends object>(obj: T): T {
  Object.keys(obj).forEach(prop => {
    if (typeof obj[prop] === 'object') deepFreeze(obj[prop]);
  });
  return Object.freeze(obj);
}

/**
 * Transforms the Context bridge object received from Messages to the structured Context object
 */
export function transformContext(contextBridge: ContextBridge): Context {
  const context: Context = {
    app: {
      locale: contextBridge.locale,
      sessionId: contextBridge.appSessionId ? contextBridge.appSessionId : '',
      theme: contextBridge.theme ? contextBridge.theme : 'default',
      iconPositionVertical: contextBridge.appIconPosition,
      osLocaleInfo: contextBridge.osLocaleInfo,
      parentMessageId: contextBridge.parentMessageId,
      userClickTime: contextBridge.userClickTime,
      userFileOpenPreference: contextBridge.userFileOpenPreference,
      host: {
        name: contextBridge.hostName ? contextBridge.hostName : HostName.teams,
        clientType: contextBridge.hostClientType ? contextBridge.hostClientType : HostClientType.web,
        sessionId: contextBridge.sessionId ? contextBridge.sessionId : '',
        ringId: contextBridge.ringId,
      },
      appLaunchId: contextBridge.appLaunchId,
    },
    page: {
      id: contextBridge.entityId,
      frameContext: contextBridge.frameContext ? contextBridge.frameContext : GlobalVars.frameContext,
      subPageId: contextBridge.subEntityId,
      isFullScreen: contextBridge.isFullScreen,
      isMultiWindow: contextBridge.isMultiWindow,
      sourceOrigin: contextBridge.sourceOrigin,
    },
    user: {
      id: contextBridge.userObjectId,
      displayName: contextBridge.userDisplayName,
      isCallingAllowed: contextBridge.isCallingAllowed,
      isPSTNCallingAllowed: contextBridge.isPSTNCallingAllowed,
      licenseType: contextBridge.userLicenseType,
      loginHint: contextBridge.loginHint,
      userPrincipalName: contextBridge.userPrincipalName,
      tenant: contextBridge.tid
        ? {
            id: contextBridge.tid,
            teamsSku: contextBridge.tenantSKU,
          }
        : undefined,
    },
    channel: contextBridge.channelId
      ? {
          id: contextBridge.channelId,
          displayName: contextBridge.channelName,
          relativeUrl: contextBridge.channelRelativeUrl,
          membershipType: contextBridge.channelType,
          defaultOneNoteSectionId: contextBridge.defaultOneNoteSectionId,
          ownerGroupId: contextBridge.hostTeamGroupId,
          ownerTenantId: contextBridge.hostTeamTenantId,
        }
      : undefined,
    chat: contextBridge.chatId
      ? {
          id: contextBridge.chatId,
        }
      : undefined,
    meeting: contextBridge.meetingId
      ? {
          id: contextBridge.meetingId,
        }
      : undefined,
    sharepoint: contextBridge.sharepoint,
    team: contextBridge.teamId
      ? {
          internalId: contextBridge.teamId,
          displayName: contextBridge.teamName,
          type: contextBridge.teamType,
          groupId: contextBridge.groupId,
          templateId: contextBridge.teamTemplateId,
          isArchived: contextBridge.isTeamArchived,
          userRole: contextBridge.userTeamRole,
        }
      : undefined,
    sharePointSite:
      contextBridge.teamSiteUrl || contextBridge.teamSiteDomain || contextBridge.teamSitePath
        ? {
            url: contextBridge.teamSiteUrl,
            domain: contextBridge.teamSiteDomain,
            path: contextBridge.teamSitePath,
            id: contextBridge.teamSiteId,
          }
        : undefined,
  };

  return context;
}
