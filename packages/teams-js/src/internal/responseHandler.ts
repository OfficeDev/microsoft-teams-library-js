/**
 * This class is used for validating and deserializing the response from the host.
 *
 * @typeParam SerializedReturnValueFromHost The type of the response received from the host
 * @typeParam DeserializedReturnValueFromHost The type of the response after deserialization
 */
export abstract class ResponseHandler<SerializedReturnValueFromHost, DeserializedReturnValueFromHost> {
  /**
   * Checks if the response from the host is valid.
   *
   * @param response The response from the host to validate
   *
   * @returns True if the response is valid, false otherwise
   */
  public abstract validate(response: SerializedReturnValueFromHost): boolean;

  /**
   * This function converts the response from the host into a different format
   * before returning it to the caller (if needed).
   * @param response
   */
  public abstract deserialize(response: SerializedReturnValueFromHost): DeserializedReturnValueFromHost;
}

export type SimpleType = string | number | boolean | null | undefined | SimpleType[];

/**
 * This class is used for validating and deserializing boolean responses from the host.
 */
export class SimpleTypeResponseHandler<T extends SimpleType> extends ResponseHandler<T, T> {
  public validate(_response: T): boolean {
    return true;
  }

  public deserialize(response: T): T {
    return response;
  }
}
