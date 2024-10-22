import { Operator } from '.';

export enum StringOperation {
  contains = 'contains',
  startsWith = 'startsWith',
  endsWith = 'endsWith',
  matchesRegex = 'matchesRegex',
}

export class StringOperator extends Operator {
  constructor(private operator: StringOperation) {
    super();
  }

  evaluate(left: string, right: string): boolean {
    switch (this.operator) {
      case StringOperation.contains:
        return left.includes(right);
      case StringOperation.startsWith:
        return left.startsWith(right);
      case StringOperation.endsWith:
        return left.endsWith(right);
      case StringOperation.matchesRegex:
        return new RegExp(right).test(left);
      default:
        throw new Error(`Unsupported string operator: ${this.operator}`);
    }
  }
}
