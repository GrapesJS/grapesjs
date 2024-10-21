import {
  GenericOperator,
  GenericOperation,
} from '../../../../../../src/data_sources/model/conditional_variables/operators/GenericOperator';

describe('GenericOperator', () => {
  describe('Operator: equals', () => {
    test('should return true when values are equal', () => {
      const operator = new GenericOperator(GenericOperation.equals);
      expect(operator.evaluate(5, 5)).toBe(true);
    });

    test('should return false when values are not equal', () => {
      const operator = new GenericOperator(GenericOperation.equals);
      expect(operator.evaluate(5, 10)).toBe(false);
    });
  });

  describe('Operator: isTruthy', () => {
    test('should return true for truthy value', () => {
      const operator = new GenericOperator(GenericOperation.isTruthy);
      expect(operator.evaluate('non-empty', null)).toBe(true);
    });

    test('should return false for falsy value', () => {
      const operator = new GenericOperator(GenericOperation.isTruthy);
      expect(operator.evaluate('', null)).toBe(false);
    });
  });

  describe('Operator: isFalsy', () => {
    test('should return true for falsy value', () => {
      const operator = new GenericOperator(GenericOperation.isFalsy);
      expect(operator.evaluate(0, null)).toBe(true);
    });

    test('should return false for truthy value', () => {
      const operator = new GenericOperator(GenericOperation.isFalsy);
      expect(operator.evaluate(1, null)).toBe(false);
    });
  });

  describe('Operator: isDefined', () => {
    test('should return true for defined value', () => {
      const operator = new GenericOperator(GenericOperation.isDefined);
      expect(operator.evaluate(10, null)).toBe(true);
    });

    test('should return false for undefined value', () => {
      const operator = new GenericOperator(GenericOperation.isDefined);
      expect(operator.evaluate(undefined, null)).toBe(false);
    });
  });

  describe('Operator: isNull', () => {
    test('should return true for null value', () => {
      const operator = new GenericOperator(GenericOperation.isNull);
      expect(operator.evaluate(null, null)).toBe(true);
    });

    test('should return false for non-null value', () => {
      const operator = new GenericOperator(GenericOperation.isNull);
      expect(operator.evaluate(0, null)).toBe(false);
    });
  });

  describe('Operator: isUndefined', () => {
    test('should return true for undefined value', () => {
      const operator = new GenericOperator(GenericOperation.isUndefined);
      expect(operator.evaluate(undefined, null)).toBe(true);
    });

    test('should return false for defined value', () => {
      const operator = new GenericOperator(GenericOperation.isUndefined);
      expect(operator.evaluate(0, null)).toBe(false);
    });
  });

  describe('Operator: isArray', () => {
    test('should return true for array', () => {
      const operator = new GenericOperator(GenericOperation.isArray);
      expect(operator.evaluate([1, 2, 3], null)).toBe(true);
    });

    test('should return false for non-array', () => {
      const operator = new GenericOperator(GenericOperation.isArray);
      expect(operator.evaluate('not an array', null)).toBe(false);
    });
  });

  describe('Operator: isObject', () => {
    test('should return true for object', () => {
      const operator = new GenericOperator(GenericOperation.isObject);
      expect(operator.evaluate({ key: 'value' }, null)).toBe(true);
    });

    test('should return false for non-object', () => {
      const operator = new GenericOperator(GenericOperation.isObject);
      expect(operator.evaluate(42, null)).toBe(false);
    });
  });

  describe('Operator: isString', () => {
    test('should return true for string', () => {
      const operator = new GenericOperator(GenericOperation.isString);
      expect(operator.evaluate('Hello', null)).toBe(true);
    });

    test('should return false for non-string', () => {
      const operator = new GenericOperator(GenericOperation.isString);
      expect(operator.evaluate(42, null)).toBe(false);
    });
  });

  describe('Operator: isNumber', () => {
    test('should return true for number', () => {
      const operator = new GenericOperator(GenericOperation.isNumber);
      expect(operator.evaluate(42, null)).toBe(true);
    });

    test('should return false for non-number', () => {
      const operator = new GenericOperator(GenericOperation.isNumber);
      expect(operator.evaluate('not a number', null)).toBe(false);
    });
  });

  describe('Operator: isBoolean', () => {
    test('should return true for boolean', () => {
      const operator = new GenericOperator(GenericOperation.isBoolean);
      expect(operator.evaluate(true, null)).toBe(true);
    });

    test('should return false for non-boolean', () => {
      const operator = new GenericOperator(GenericOperation.isBoolean);
      expect(operator.evaluate(1, null)).toBe(false);
    });
  });

  describe('Edge Case Tests', () => {
    test('should handle null as input gracefully', () => {
      const operator = new GenericOperator(GenericOperation.isNull);
      expect(operator.evaluate(null, null)).toBe(true);
    });

    test('should throw error for unsupported operator', () => {
      const operator = new GenericOperator('unsupported' as GenericOperation);
      expect(() => operator.evaluate(1, 2)).toThrow('Unsupported generic operator: unsupported');
    });
  });
});
