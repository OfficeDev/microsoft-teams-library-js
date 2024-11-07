const objectToString = Object.prototype.toString;
const uint8ArrayStringified = '[object Uint8Array]';
const arrayBufferStringified = '[object ArrayBuffer]';

const cachedDecoders = {
  utf8: new globalThis.TextDecoder('utf8'),
};

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

function isType(value, typeConstructor, typeStringified): boolean {
  if (!value) {
    return false;
  }

  if (value.constructor === typeConstructor) {
    return true;
  }

  return objectToString.call(value) === typeStringified;
}

export function isUint8Array(value: unknown): value is Uint8Array {
  return isType(value, Uint8Array, uint8ArrayStringified);
}

function isArrayBuffer(value): boolean {
  return isType(value, ArrayBuffer, arrayBufferStringified);
}

function assertString(value): void {
  if (typeof value !== 'string') {
    throw new TypeError(`Expected \`string\`, got \`${typeof value}\``);
  }
}

export function base64ToUint8Array(base64String: string): Uint8Array {
  assertString(base64String);
  return Uint8Array.from(globalThis.atob(base64UrlToBase64(base64String)), (x) => {
    const codePoint = x.codePointAt(0);
    if (codePoint === undefined) {
      throw new Error('Invalid character encountered');
    }
    return codePoint;
  });
}

function base64UrlToBase64(base64url: string): string {
  return base64url.replaceAll('-', '+').replaceAll('_', '/');
}

export function uint8ArrayToString(array: Uint8Array | ArrayBuffer, encoding = 'utf8'): string {
  assertUint8ArrayOrArrayBuffer(array);
  cachedDecoders[encoding] ??= new globalThis.TextDecoder(encoding);
  return cachedDecoders[encoding].decode(array);
}

export function base64ToString(base64String: string): string {
  assertString(base64String);
  return uint8ArrayToString(base64ToUint8Array(base64String));
}

export function assertUint8ArrayOrArrayBuffer(value): void {
  if (!isUint8ArrayOrArrayBuffer(value)) {
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof value}\``);
  }
}

function isUint8ArrayOrArrayBuffer(value): boolean {
  return isUint8Array(value) || isArrayBuffer(value);
}
