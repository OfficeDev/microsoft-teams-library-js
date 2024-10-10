export interface SerializableArg {
  getSerializableObject(): object | string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isSerializableArg(arg: any): arg is SerializableArg {
  return arg && typeof arg.getSerializableObject === 'function';
}

export type SimpleType = string | number | boolean | null | undefined | SimpleType[];

export class ArgsForHost {
  public constructor(public args: (SimpleType | SerializableArg)[] | undefined) {}

  public getSerializableArgs(): (object | SimpleType)[] | undefined {
    if (this.args === undefined) {
      return undefined;
    }

    return this.args.map((arg) => {
      if (isSerializableArg(arg)) {
        return arg.getSerializableObject();
      } else {
        return arg;
      }
    });
  }
}
