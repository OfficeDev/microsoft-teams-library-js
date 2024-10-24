export function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`Expected a string but received ${typeof value}`);
  }
}

export function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== 'number') {
    throw new Error(`Expected a number but received ${typeof value}`);
  }
}

export function assertIsBoolean(value: unknown): asserts value is boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`Expected a boolean but received ${typeof value}`);
  }
}

export function assertIsArray<T>(value: unknown, validateElement: (element: unknown) => void): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new Error(`Expected an array but received ${typeof value}`);
  }

  for (const element of value) {
    validateElement(element);
  }
}

export function assertIsObject(value: unknown): asserts value is object {
  if (value === null || typeof value !== 'object') {
    throw new Error(`Expected an object but received ${typeof value}`);
  }
}
