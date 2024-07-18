import { InputStrategy } from './InputStrategy';

export class NoInputStrategy implements InputStrategy {
    execute(input: any): any {
      // No transformation needed
      return input;
    }
  }
