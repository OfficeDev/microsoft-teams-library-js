import { InputStrategy } from "./InputStrategy";
export class CheckboxInputStrategy implements InputStrategy {
    execute(input: any): any {
      // Transform the input to a boolean format
      return input ? true : false;
    }
  }
