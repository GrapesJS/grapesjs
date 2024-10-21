import { Operator } from '.';

export enum LogicalOperation {
  and = 'and',
  or = 'or',
  xor = 'xor',
}

export class LogicalOperator extends Operator {
  constructor(private operator: LogicalOperation) {
    super();
  }

  evaluate(statements: boolean[]): boolean {
    if (!statements.length) throw new Error('Expected one or more statments, got none');

    switch (this.operator) {
      case LogicalOperation.and:
        return statements.every(Boolean);
      case LogicalOperation.or:
        return statements.some(Boolean);
      case LogicalOperation.xor:
        return statements.filter(Boolean).length === 1;
      default:
        throw new Error(`Unsupported logical operator: ${this.operator}`);
    }
  }
}
