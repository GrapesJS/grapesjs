import { ConditionStatement } from './ConditionStatement';
import { Expression, LogicGroup } from './DataCondition';
import { LogicalGroupStatement } from './LogicalGroupStatement';
import { Operator } from './operators';
import { GenericOperation, GenericOperator } from './operators/GenericOperator';
import { LogicalOperator } from './operators/LogicalOperator';
import { NumberOperation, NumberOperator } from './operators/NumberOperator';
import { StringOperation, StringOperator } from './operators/StringOperations';

export function evaluateCondition(condition: any): boolean {
  if (typeof condition === 'boolean') {
    return condition;
  }

  if (isLogicGroup(condition)) {
    const { logicalOperator, statements } = condition;
    const op = new LogicalOperator(logicalOperator);
    const logicalGroup = new LogicalGroupStatement(op, statements);
    return logicalGroup.evaluate();
  }

  if (isCondition(condition)) {
    const { left, operator, right } = condition;
    const op = operatorFactory(left, operator);
    const statement = new ConditionStatement(left, op, right);
    return statement.evaluate();
  }

  throw new Error('Invalid condition type.');
}

function operatorFactory(left: any, operator: string): Operator {
  if (isOperatorInEnum(operator, GenericOperation)) {
    return new GenericOperator(operator as GenericOperation);
  } else if (typeof left === 'number') {
    return new NumberOperator(operator as NumberOperation);
  } else if (typeof left === 'string') {
    return new StringOperator(operator as StringOperation);
  }
  throw new Error(`Unsupported data type: ${typeof left}`);
}

function isOperatorInEnum(operator: string, enumObject: any): boolean {
  return Object.values(enumObject).includes(operator);
}

function isLogicGroup(condition: any): condition is LogicGroup {
  return condition && typeof condition.logicalOperator !== 'undefined' && Array.isArray(condition.statements);
}

function isCondition(condition: any): condition is Expression {
  return condition && typeof condition.left !== 'undefined' && typeof condition.operator === 'string';
}
