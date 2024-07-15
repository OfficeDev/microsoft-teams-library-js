import { TransformerStrategy } from './TransformerStrategy';

export class TextInputStrategy implements TransformerStrategy {
    transform(output: any): any {
        // Transform output to text input
        return `${output}`;
    }
}
