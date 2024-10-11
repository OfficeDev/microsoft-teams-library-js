/**
 * Interface for objects that can be serialized and passed to the host
 */
export interface ISerializable {
  /**
   * @returns A serializable representation of the object, used for passing objects to the host.
   */
  serialize(): unknown;
}
