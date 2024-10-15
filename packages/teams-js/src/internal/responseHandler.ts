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

/**
 * This class is used for validating and deserializing boolean responses from the host.
 */
export class BooleanResponseHandler extends ResponseHandler<boolean, boolean> {
  public validate(_response: boolean): boolean {
    return true;
  }

  public deserialize(response: boolean): boolean {
    return response;
  }
}
