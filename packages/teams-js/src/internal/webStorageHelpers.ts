// It is safe to cache the host name because the host cannot change at runtime
import * as app from '../public/app/app';
import { HostName } from '../public/constants';

export let cachedHostName: HostName | null = null;

export async function getCachedHostName(): Promise<HostName> {
  if (cachedHostName === null) {
    cachedHostName = (await app.getContext()).app.host.name;
  }

  return cachedHostName;
}

// ...except during unit tests, where we will change it at runtime regularly for testing purposes
export function clearWebStorageCachedHostNameForTests(): void {
  cachedHostName = null;
}
