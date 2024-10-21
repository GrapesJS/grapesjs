import {
  LogicalOperator,
  LogicalOperation,
} from '../../../../../../src/data_sources/model/conditional_variables/operators/LogicalOperator';

describe('LogicalOperator', () => {
  describe('Operator: and', () => {
    test('should return true when all statements are true', () => {
      const operator = new LogicalOperator(LogicalOperation.and);
      expect(operator.evaluate([true, true, true])).toBe(true);
    });

    test('should return false when at least one statement is false', () => {
      const operator = new LogicalOperator(LogicalOperation.and);
      expect(operator.evaluate([true, false, true])).toBe(false);
    });
  });

  describe('Operator: or', () => {
    test('should return true when at least one statement is true', () => {
      const operator = new LogicalOperator(LogicalOperation.or);
      expect(operator.evaluate([false, true, false])).toBe(true);
    });

    test('should return false when all statements are false', () => {
      const operator = new LogicalOperator(LogicalOperation.or);
      expect(operator.evaluate([false, false, false])).toBe(false);
    });
  });

  describe('Operator: xor', () => {
    test('should return true when exactly one statement is true', () => {
      const operator = new LogicalOperator(LogicalOperation.xor);
      expect(operator.evaluate([true, false, false])).toBe(true);
    });

    test('should return false when more than one statement is true', () => {
      const operator = new LogicalOperator(LogicalOperation.xor);
      expect(operator.evaluate([true, true, false])).toBe(false);
    });

    test('should return false when no statement is true', () => {
      const operator = new LogicalOperator(LogicalOperation.xor);
      expect(operator.evaluate([false, false, false])).toBe(false);
    });
  });

  describe('Edge Case Tests', () => {
    test('should return false for xor with all false inputs', () => {
      const operator = new LogicalOperator(LogicalOperation.xor);
      expect(operator.evaluate([false, false])).toBe(false);
    });

    test('should throw error for unsupported operator', () => {
      const operator = new LogicalOperator('unsupported' as LogicalOperation);
      expect(() => operator.evaluate([true, false])).toThrow('Unsupported logical operator: unsupported');
    });
  });
});
