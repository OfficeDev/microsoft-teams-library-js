import { TransformerStrategy } from './TransformerStrategy';

export class NoInputStrategy implements TransformerStrategy {
    transform(output: any): any {
        // No transformation needed for no input
        return null;
    }
}
