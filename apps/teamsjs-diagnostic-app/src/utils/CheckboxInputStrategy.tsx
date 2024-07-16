import { TransformerStrategy } from './TransformerStrategy';

export class CheckboxInputStrategy implements TransformerStrategy {
    transform(output: any): any {
        // Transform output to boolean for checkbox input
        return Boolean(output);
    }
}
