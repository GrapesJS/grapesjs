import { LogicalOperator } from './operators/LogicalOperator';
import { Expression, LogicGroup } from './DataCondition';
import { evaluateCondition } from './evaluateCondition';

export class LogicalGroupStatement {
  constructor(
    private operator: LogicalOperator,
    private statements: (Expression | LogicGroup | boolean)[],
  ) {}

  evaluate(): boolean {
    const results = this.statements.map((statement) => evaluateCondition(statement));
    return this.operator.evaluate(results);
  }
}
