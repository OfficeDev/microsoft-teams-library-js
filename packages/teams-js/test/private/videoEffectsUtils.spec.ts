import { TextDecoder, TextEncoder } from 'util';

import { OneTextureMetadata } from '../../src/internal/videoEffectsUtils';
import { app } from '../../src/public';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';

Object.assign(global, { TextDecoder, TextEncoder });

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

/**
 * Test cases for videoEffectsUtils
 */

describe('videoEffectsUtils', () => {
  const utils = new Utils();
  beforeEach(() => {
    utils.messages = [];
    app._initialize(utils.mockWindow);
  });
  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  describe('Test OneTextureMetadata getAttributes method', () => {
    it('should return undefined with empty frame metadata', () => {
      const oneTextureMetadata = new OneTextureMetadata(new ArrayBuffer(0), 0);
      expect(oneTextureMetadata.attributes).toEqual(undefined);
    });

    it('should return empty map for zero count frame attribute metadata', () => {
      const map = new Map<string, Uint8Array>();
      const metadataBuffer = generateFrameAttributeMetadata(map);

      let oneTextureMetadata = new OneTextureMetadata(metadataBuffer, map.size + 1);
      expect(oneTextureMetadata.attributes?.size).toEqual(0);
    });

    it('should return accurate map for non-empty frame attribute metadata', () => {
      const map = new Map<string, Uint8Array>();
      map['attribute-id-1'] = new Uint8Array([23, 45, 2, 75, 134]);
      map['attribute-id-2'] = new Uint8Array([76, 145, 9]);
      map['attribute-id-3'] = new Uint8Array([213, 78, 82, 237, 12, 34, 97, 6]);

      const metadataBuffer = generateFrameAttributeMetadata(map);
      let oneTextureMetadata = new OneTextureMetadata(metadataBuffer, map.size + 1);

      expect(oneTextureMetadata.attributes?.size).toEqual(map.size);
      expect(oneTextureMetadata.attributes).toEqual(map);
    });
  });
});

function numToByteArray(num: number): Uint8Array {
  return new Uint8Array((new Uint32Array([num])).buffer);
}

function generateFrameAttributeMetadata(attributeMap: ReadonlyMap<string, Uint8Array>): ArrayBuffer {
  const ATTRIBUTE_ID_MAP_STREAM_ID = 0x4d444941;

  const streamCount = 1 + attributeMap.size;
  const metadataHeaderSize = 12 * streamCount;

  let streamId = 2;
  const headerSegment = new Array<number>();
  const dataSegment = new Array<number>();
  const textEncoder = new TextEncoder();

  const attributeMapData = new Array<number>();
  attributeMapData.push(...numToByteArray(attributeMap.size));

  attributeMap.forEach((attributeData, attributeId, _) => {
    const stringBytes = textEncoder.encode(attributeId);
    const paddingSize = 4 - (stringBytes.length % 4); // null terminator bytes length

    headerSegment.push(streamId);
    headerSegment.push(metadataHeaderSize + dataSegment.length);
    headerSegment.push(attributeData.length);

    attributeMapData.push(...numToByteArray(streamId++));
    attributeMapData.push(...stringBytes);
    attributeMapData.push(...(new Uint8Array(paddingSize)));

    dataSegment.push(...attributeData);
  });

  headerSegment.push(ATTRIBUTE_ID_MAP_STREAM_ID);
  headerSegment.push(metadataHeaderSize + dataSegment.length);
  headerSegment.push(attributeMapData.length);

  dataSegment.push(...attributeMapData);

  const headerBuffer = new Uint32Array(headerSegment);
  const dataBuffer = new Uint8Array(dataSegment);

  const metadata = new Uint8Array(headerBuffer.byteLength + dataBuffer.byteLength);
  metadata.set(new Uint8Array(headerBuffer.buffer));
  metadata.set(dataBuffer, headerBuffer.byteLength);

  return metadata.buffer;
}
