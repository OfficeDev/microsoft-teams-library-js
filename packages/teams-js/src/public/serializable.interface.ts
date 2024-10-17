/**
 * Interface for objects that can be serialized and passed to the host
 */
export interface ISerializable {
  /**
   * @returns A serializable representation of the object, used for passing objects to the host.
   */
  serialize(): string | object;
}

/**
 * @hidden
 * @internal
 * Used by the communication layer to make sure that an argument being passed to the host is serializable.
 * @param arg The argument to evaluate
 * @returns Whether or not the argument is serializable.
 */
export function isSerializable(arg: unknown): arg is ISerializable {
  return (
    arg !== undefined &&
    arg !== null &&
    (arg as ISerializable).serialize !== undefined &&
    typeof (arg as ISerializable).serialize === 'function'
  );
}
