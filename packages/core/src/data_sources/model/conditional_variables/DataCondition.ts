import { NumberOperation } from './operators/NumberOperator';
import { StringOperation } from './operators/StringOperations';
import { GenericOperation } from './operators/GenericOperator';
import { Model } from '../../../common';
import { LogicalOperation } from './operators/LogicalOperator';
import { evaluateCondition } from './evaluateCondition';

export const ConditionalVariableType = 'conditional-variable';
export type Expression = {
  left: any;
  operator: GenericOperation | StringOperation | NumberOperation;
  right: any;
};

export type LogicGroup = {
  logicalOperator: LogicalOperation;
  statements: (Expression | LogicGroup | boolean)[];
};

export class DataCondition extends Model {
  private conditionResult: boolean;

  defaults() {
    return {
      type: ConditionalVariableType,
      condition: false,
    };
  }

  constructor(
    private condition: Expression | LogicGroup | boolean,
    private ifTrue: any,
    private ifFalse: any,
  ) {
    super();
    this.conditionResult = this.evaluate();
  }

  evaluate() {
    return evaluateCondition(this.condition);
  }

  getDataValue(): any {
    return this.conditionResult ? this.ifTrue : this.ifFalse;
  }

  reevaluate(): void {
    this.conditionResult = this.evaluate();
  }
}
