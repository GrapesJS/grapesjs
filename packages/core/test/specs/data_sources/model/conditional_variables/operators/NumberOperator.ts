import {
  NumberOperator,
  NumberOperation,
} from '../../../../../../src/data_sources/model/conditional_variables/operators/NumberOperator';

describe('NumberOperator', () => {
  describe('Operator: greaterThan', () => {
    test('should return true when left is greater than right', () => {
      const operator = new NumberOperator(NumberOperation.greaterThan);
      expect(operator.evaluate(5, 3)).toBe(true);
    });

    test('should return false when left is not greater than right', () => {
      const operator = new NumberOperator(NumberOperation.greaterThan);
      expect(operator.evaluate(2, 3)).toBe(false);
    });
  });

  describe('Operator: lessThan', () => {
    test('should return true when left is less than right', () => {
      const operator = new NumberOperator(NumberOperation.lessThan);
      expect(operator.evaluate(2, 3)).toBe(true);
    });

    test('should return false when left is not less than right', () => {
      const operator = new NumberOperator(NumberOperation.lessThan);
      expect(operator.evaluate(5, 3)).toBe(false);
    });
  });

  describe('Operator: greaterThanOrEqual', () => {
    test('should return true when left is greater than or equal to right', () => {
      const operator = new NumberOperator(NumberOperation.greaterThanOrEqual);
      expect(operator.evaluate(3, 3)).toBe(true);
    });

    test('should return false when left is not greater than or equal to right', () => {
      const operator = new NumberOperator(NumberOperation.greaterThanOrEqual);
      expect(operator.evaluate(2, 3)).toBe(false);
    });
  });

  describe('Operator: lessThanOrEqual', () => {
    test('should return true when left is less than or equal to right', () => {
      const operator = new NumberOperator(NumberOperation.lessThanOrEqual);
      expect(operator.evaluate(3, 3)).toBe(true);
    });

    test('should return false when left is not less than or equal to right', () => {
      const operator = new NumberOperator(NumberOperation.lessThanOrEqual);
      expect(operator.evaluate(5, 3)).toBe(false);
    });
  });

  describe('Operator: equals', () => {
    test('should return true when numbers are equal', () => {
      const operator = new NumberOperator(NumberOperation.equals);
      expect(operator.evaluate(4, 4)).toBe(true);
    });

    test('should return false when numbers are not equal', () => {
      const operator = new NumberOperator(NumberOperation.equals);
      expect(operator.evaluate(4, 5)).toBe(false);
    });
  });

  describe('Operator: notEquals', () => {
    test('should return true when numbers are not equal', () => {
      const operator = new NumberOperator(NumberOperation.notEquals);
      expect(operator.evaluate(4, 5)).toBe(true);
    });

    test('should return false when numbers are equal', () => {
      const operator = new NumberOperator(NumberOperation.notEquals);
      expect(operator.evaluate(4, 4)).toBe(false);
    });
  });

  describe('Edge Case Tests', () => {
    test('should handle boundary values correctly', () => {
      const operator = new NumberOperator(NumberOperation.lessThan);
      expect(operator.evaluate(Number.MIN_VALUE, 1)).toBe(true);
    });

    test('should return false for NaN comparisons', () => {
      const operator = new NumberOperator(NumberOperation.equals);
      expect(operator.evaluate(NaN, NaN)).toBe(false);
    });

    test('should throw error for unsupported operator', () => {
      const operator = new NumberOperator('unsupported' as NumberOperation);
      expect(() => operator.evaluate(1, 2)).toThrow('Unsupported number operator: unsupported');
    });
  });
});
