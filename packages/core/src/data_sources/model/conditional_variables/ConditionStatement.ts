import { Operator } from './operators';

export class ConditionStatement {
  constructor(
    private leftValue: any,
    private operator: Operator,
    private rightValue: any,
  ) {}

  evaluate(): boolean {
    return this.operator.evaluate(this.leftValue, this.rightValue);
  }
}
