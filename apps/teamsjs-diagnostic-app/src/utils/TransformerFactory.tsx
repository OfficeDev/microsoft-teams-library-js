import { InputStrategy } from './InputStrategy';
import { NoInputStrategy } from './NoInputStrategy';
import { TextInputStrategy } from './TextInputStrategy';
import { CheckboxInputStrategy } from './CheckboxInputStrategy';

export class TransformerFactory {
  public static createStrategy(inputType: string): InputStrategy {
    switch (inputType) {
      case 'text':
        return new TextInputStrategy();
      case 'checkbox':
        return new CheckboxInputStrategy();
      default:
        return new NoInputStrategy();
    }
  }
}
