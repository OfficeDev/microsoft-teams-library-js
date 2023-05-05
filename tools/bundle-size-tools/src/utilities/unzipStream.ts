/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as JSZip from 'jszip';

function readStreamAsBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any[] = [];
    stream.on('data', (chunk) => {
      data.push(chunk);
    });
    stream.on('close', () => {
      resolve(Buffer.concat(data));
    });
    stream.on('error', (error) => {
      reject(error);
    });
  });
}

// JSZip doesn't appear to export the JSZip type after a very quick scan
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function unzipStream(stream: NodeJS.ReadableStream): Promise<any> {
  return JSZip.loadAsync(await readStreamAsBuffer(stream));
}
