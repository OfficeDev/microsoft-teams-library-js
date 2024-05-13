import { generateGUID, validateUuid } from './utils';

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * UUID object
 */
export class UUID {
  public constructor(private readonly uuid: string = generateGUID()) {
    validateUuid(uuid);
  }

  public toString(): string {
    return this.uuid;
  }
}
