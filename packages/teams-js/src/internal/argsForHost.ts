import { ISerializable } from '../public/serializable.interface';

function isSerializable(arg: unknown): arg is ISerializable {
  return (
    arg !== undefined &&
    arg !== null &&
    (arg as ISerializable).serialize !== undefined &&
    typeof (arg as ISerializable).serialize === 'function'
  );
}

/**
 * @hidden
 * @internal
 *
 * A simple type that can be passed to the host
 */
export type SimpleType = string | number | boolean | null | undefined | SimpleType[];

/**
 * @hidden
 * @internal
 *
 * This class is used for serializing the arguments passed to the host.
 */
export class ArgsForHost {
  public constructor(public args: (SimpleType | ISerializable)[] | undefined) {}

  public getSerializableArgs(): unknown[] | undefined {
    if (this.args === undefined) {
      return undefined;
    }

    return this.args.map((arg) => {
      if (isSerializable(arg)) {
        return arg.serialize();
      } else {
        return arg;
      }
    });
  }
}
