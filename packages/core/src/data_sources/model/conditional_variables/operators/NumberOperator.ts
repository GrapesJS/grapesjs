import { Operator } from '.';

export enum NumberOperation {
  greaterThan = '>',
  lessThan = '<',
  greaterThanOrEqual = '>=',
  lessThanOrEqual = '<=',
  equals = '=',
  notEquals = '!=',
}

export class NumberOperator extends Operator {
  constructor(private operator: NumberOperation) {
    super();
  }

  evaluate(left: number, right: number): boolean {
    switch (this.operator) {
      case NumberOperation.greaterThan:
        return left > right;
      case NumberOperation.lessThan:
        return left < right;
      case NumberOperation.greaterThanOrEqual:
        return left >= right;
      case NumberOperation.lessThanOrEqual:
        return left <= right;
      case NumberOperation.equals:
        return left === right;
      case NumberOperation.notEquals:
        return left !== right;
      default:
        throw new Error(`Unsupported number operator: ${this.operator}`);
    }
  }
}
