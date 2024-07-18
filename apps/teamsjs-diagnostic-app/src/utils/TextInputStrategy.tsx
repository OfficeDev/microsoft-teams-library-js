import { InputStrategy } from "./InputStrategy";
export class TextInputStrategy implements InputStrategy {
    execute(input: any): any {
      // Transform the input to text format
      return input.toString();
    }
  }
