import DataVariable from '../../DataVariable';
import { Operator } from '.';

export enum GenericOperation {
  equals = 'equals',
  isTruthy = 'isTruthy',
  isFalsy = 'isFalsy',
  isDefined = 'isDefined',
  isNull = 'isNull',
  isUndefined = 'isUndefined',
  isArray = 'isArray',
  isObject = 'isObject',
  isString = 'isString',
  isNumber = 'isNumber',
  isBoolean = 'isBoolean',
  isDefaultValue = 'isDefaultValue', // For Datasource variables
}

export class GenericOperator extends Operator {
  constructor(private operator: GenericOperation) {
    super();
  }

  evaluate(left: any, right: any): boolean {
    switch (this.operator) {
      case 'equals':
        return left === right;
      case 'isTruthy':
        return !!left;
      case 'isFalsy':
        return !left;
      case 'isDefined':
        return left !== undefined && left !== null;
      case 'isNull':
        return left === null;
      case 'isUndefined':
        return left === undefined;
      case 'isArray':
        return Array.isArray(left);
      case 'isObject':
        return typeof left === 'object' && left !== null;
      case 'isString':
        return typeof left === 'string';
      case 'isNumber':
        return typeof left === 'number';
      case 'isBoolean':
        return typeof left === 'boolean';
      case 'isDefaultValue':
        return left instanceof DataVariable && left.get('default') === right;
      default:
        throw new Error(`Unsupported generic operator: ${this.operator}`);
    }
  }
}
