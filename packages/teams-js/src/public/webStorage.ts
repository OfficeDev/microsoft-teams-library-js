import { sendAndUnwrap } from '../internal/communication';
import { GlobalVars } from '../internal/globalVars';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { app } from './app';
import { errorNotSupportedOnPlatform, HostClientType, HostName } from './constants';
import { runtime } from './runtime';

/**
 * Contains functionality enabling apps to query properties about how the host manages web storage (`Window.LocalStorage`)
 *
 * @beta
 */
export namespace webStorage {
  /**
   * Checks if web storage (`Window.LocalStorage`) gets cleared when a user logs out from host
   *
   * @returns `true` if web storage gets cleared on logout and `false` if not
   *
   * @throws `Error` if {@linkcode app.initialize} has not successfully completed
   *
   * @beta
   */
  export async function isWebStorageClearedOnUserLogOut(): Promise<boolean> {
    ensureInitialized(runtime);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    if (
      (GlobalVars.hostClientType === HostClientType.android || GlobalVars.hostClientType === HostClientType.ios) &&
      (await getHostName()) === HostName.teams
    ) {
      // On Teams Mobile, they haven't yet implemented this capability. However, for compatibility reasons, we need
      // to act as if they do. If they did implement it, they would return true, so that's what we do here.
      // Getting Teams Mobile to implement this is a work-in-progress. Once they do implement it, we can remove this
      // whole if-block. Until then, we cannot send the message to them because they will not understand it.
      return true;
    }

    return await sendAndUnwrap(
      getApiVersionTag(ApiVersionNumber.V_2, ApiName.WebStorage_IsWebStorageClearedOnUserLogOut),
      ApiName.WebStorage_IsWebStorageClearedOnUserLogOut,
    );
  }

  // It is safe to cache the host name because the host cannot change at runtime
  let cachedHostName: HostName | null = null;

  async function getHostName(): Promise<HostName> {
    if (cachedHostName === null) {
      cachedHostName = (await app.getContext()).app.host.name;
    }

    return cachedHostName;
  }

  /**
   * Checks if webStorage capability is supported by the host
   * @returns boolean to represent whether the webStorage capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @beta
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.webStorage !== undefined;
  }
}
