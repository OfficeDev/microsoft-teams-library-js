import * as uuid from 'uuid';
// This will return a reg expression a given url
function generateRegExpFromUrl(url: string): string {
  let urlRegExpPart = '^';
  const urlParts = url.split('.');
  for (let j = 0; j < urlParts.length; j++) {
    urlRegExpPart += (j > 0 ? '[.]' : '') + urlParts[j].replace('*', '[^/^.]+');
  }
  urlRegExpPart += '$';
  return urlRegExpPart;
}

// This will return a reg expression for list of url
export function generateRegExpFromUrls(urls: string[]): RegExp {
  let urlRegExp = '';
  for (let i = 0; i < urls.length; i++) {
    urlRegExp += (i === 0 ? '' : '|') + generateRegExpFromUrl(urls[i]);
  }
  return new RegExp(urlRegExp);
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
