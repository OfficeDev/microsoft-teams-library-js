import { TransformerStrategy } from './TransformerStrategy';

export class TransformerContext {
    private strategy: TransformerStrategy;

    constructor(strategy: TransformerStrategy) {
        this.strategy = strategy;
    }

    setStrategy(strategy: TransformerStrategy) {
        this.strategy = strategy;
    }

    executeStrategy(output: any): any {
        return this.strategy.transform(output);
    }
}
