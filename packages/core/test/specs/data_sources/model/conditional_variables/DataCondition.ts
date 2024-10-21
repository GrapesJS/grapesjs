import {
  DataCondition,
  Expression,
  LogicGroup,
} from '../../../../../src/data_sources/model/conditional_variables/DataCondition';
import { GenericOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/GenericOperator';
import { LogicalOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/LogicalOperator';
import { NumberOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/NumberOperator';
import { StringOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/StringOperations';

describe('DataCondition', () => {
  describe('Basic Functionality Tests', () => {
    test('should evaluate a simple boolean condition', () => {
      const condition = true;
      const dataCondition = new DataCondition(condition, 'Yes', 'No');

      expect(dataCondition.getDataValue()).toBe('Yes');
    });

    test('should return ifFalse when condition evaluates to false', () => {
      const condition = false;
      const dataCondition = new DataCondition(condition, 'Yes', 'No');

      expect(dataCondition.getDataValue()).toBe('No');
    });
  });

  describe('Operator Tests', () => {
    test('should evaluate using GenericOperation operators', () => {
      const condition: Expression = { left: 5, operator: GenericOperation.equals, right: 5 };
      const dataCondition = new DataCondition(condition, 'Equal', 'Not Equal');

      expect(dataCondition.getDataValue()).toBe('Equal');
    });

    test('equals (false)', () => {
      const condition: Expression = {
        left: 'hello',
        operator: GenericOperation.equals,
        right: 'world',
      };
      const dataCondition = new DataCondition(condition, 'true', 'false');
      expect(dataCondition.evaluate()).toBe(false);
    });

    test('should evaluate using StringOperation operators', () => {
      const condition: Expression = { left: 'apple', operator: StringOperation.contains, right: 'app' };
      const dataCondition = new DataCondition(condition, 'Contains', "Doesn't contain");

      expect(dataCondition.getDataValue()).toBe('Contains');
    });

    test('should evaluate using NumberOperation operators', () => {
      const condition: Expression = { left: 10, operator: NumberOperation.lessThan, right: 15 };
      const dataCondition = new DataCondition(condition, 'Valid', 'Invalid');

      expect(dataCondition.getDataValue()).toBe('Valid');
    });

    test('should evaluate using LogicalOperation operators', () => {
      const logicGroup: LogicGroup = {
        logicalOperator: LogicalOperation.and,
        statements: [
          { left: true, operator: GenericOperation.equals, right: true },
          { left: 5, operator: NumberOperation.greaterThan, right: 3 },
        ],
      };

      const dataCondition = new DataCondition(logicGroup, 'Pass', 'Fail');
      expect(dataCondition.getDataValue()).toBe('Pass');
    });
  });

  describe('Edge Case Tests', () => {
    test('should throw error for invalid condition type', () => {
      const invalidCondition: any = { randomField: 'randomValue' };
      expect(() => new DataCondition(invalidCondition, 'Yes', 'No')).toThrow('Invalid condition type.');
    });

    test('should evaluate complex nested conditions', () => {
      const nestedLogicGroup: LogicGroup = {
        logicalOperator: LogicalOperation.or,
        statements: [
          {
            logicalOperator: LogicalOperation.and,
            statements: [
              { left: 1, operator: NumberOperation.lessThan, right: 5 },
              { left: 'test', operator: GenericOperation.equals, right: 'test' },
            ],
          },
          { left: 10, operator: NumberOperation.greaterThan, right: 100 },
        ],
      };

      const dataCondition = new DataCondition(nestedLogicGroup, 'Nested Pass', 'Nested Fail');
      expect(dataCondition.getDataValue()).toBe('Nested Pass');
    });
  });

  describe('LogicalGroup Tests', () => {
    test('should correctly handle AND logical operator', () => {
      const logicGroup: LogicGroup = {
        logicalOperator: LogicalOperation.and,
        statements: [
          { left: true, operator: GenericOperation.equals, right: true },
          { left: 5, operator: NumberOperation.greaterThan, right: 3 },
        ],
      };

      const dataCondition = new DataCondition(logicGroup, 'All true', 'One or more false');
      expect(dataCondition.getDataValue()).toBe('All true');
    });

    test('should correctly handle OR logical operator', () => {
      const logicGroup: LogicGroup = {
        logicalOperator: LogicalOperation.or,
        statements: [
          { left: true, operator: GenericOperation.equals, right: false },
          { left: 5, operator: NumberOperation.greaterThan, right: 3 },
        ],
      };

      const dataCondition = new DataCondition(logicGroup, 'At least one true', 'All false');
      expect(dataCondition.getDataValue()).toBe('At least one true');
    });

    test('should correctly handle XOR logical operator', () => {
      const logicGroup: LogicGroup = {
        logicalOperator: LogicalOperation.xor,
        statements: [
          { left: true, operator: GenericOperation.equals, right: true },
          { left: 5, operator: NumberOperation.lessThan, right: 3 },
          { left: false, operator: GenericOperation.equals, right: true },
        ],
      };

      const dataCondition = new DataCondition(logicGroup, 'Exactly one true', 'Multiple true or all false');
      expect(dataCondition.getDataValue()).toBe('Exactly one true');
    });

    test('should handle nested logical groups', () => {
      const logicGroup: LogicGroup = {
        logicalOperator: LogicalOperation.and,
        statements: [
          { left: true, operator: GenericOperation.equals, right: true },
          {
            logicalOperator: LogicalOperation.or,
            statements: [
              { left: 5, operator: NumberOperation.greaterThan, right: 3 },
              { left: false, operator: GenericOperation.equals, right: true },
            ],
          },
        ],
      };

      const dataCondition = new DataCondition(logicGroup, 'All true', 'One or more false');
      expect(dataCondition.getDataValue()).toBe('All true');
    });

    test('should handle groups with false conditions', () => {
      const logicGroup: LogicGroup = {
        logicalOperator: LogicalOperation.and,
        statements: [
          { left: true, operator: GenericOperation.equals, right: true },
          { left: false, operator: GenericOperation.equals, right: true },
          { left: 5, operator: NumberOperation.greaterThan, right: 3 },
        ],
      };

      const dataCondition = new DataCondition(logicGroup, 'All true', 'One or more false');
      expect(dataCondition.getDataValue()).toBe('One or more false');
    });
  });
});
