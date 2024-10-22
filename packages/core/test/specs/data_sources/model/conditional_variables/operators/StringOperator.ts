import {
  StringOperator,
  StringOperation,
} from '../../../../../../src/data_sources/model/conditional_variables/operators/StringOperations';

describe('StringOperator', () => {
  describe('Operator: contains', () => {
    test('should return true when left contains right', () => {
      const operator = new StringOperator(StringOperation.contains);
      expect(operator.evaluate('hello world', 'world')).toBe(true);
    });

    test('should return false when left does not contain right', () => {
      const operator = new StringOperator(StringOperation.contains);
      expect(operator.evaluate('hello world', 'moon')).toBe(false);
    });
  });

  describe('Operator: startsWith', () => {
    test('should return true when left starts with right', () => {
      const operator = new StringOperator(StringOperation.startsWith);
      expect(operator.evaluate('hello world', 'hello')).toBe(true);
    });

    test('should return false when left does not start with right', () => {
      const operator = new StringOperator(StringOperation.startsWith);
      expect(operator.evaluate('hello world', 'world')).toBe(false);
    });
  });

  describe('Operator: endsWith', () => {
    test('should return true when left ends with right', () => {
      const operator = new StringOperator(StringOperation.endsWith);
      expect(operator.evaluate('hello world', 'world')).toBe(true);
    });

    test('should return false when left does not end with right', () => {
      const operator = new StringOperator(StringOperation.endsWith);
      expect(operator.evaluate('hello world', 'hello')).toBe(false);
    });
  });

  describe('Operator: matchesRegex', () => {
    test('should return true when left matches the regex right', () => {
      const operator = new StringOperator(StringOperation.matchesRegex);
      expect(operator.evaluate('hello world', '^hello')).toBe(true);
    });

    test('should return false when left does not match the regex right', () => {
      const operator = new StringOperator(StringOperation.matchesRegex);
      expect(operator.evaluate('hello world', '^world')).toBe(false);
    });
  });

  describe('Edge Case Tests', () => {
    test('should return false for contains with empty right string', () => {
      const operator = new StringOperator(StringOperation.contains);
      expect(operator.evaluate('hello world', '')).toBe(true); // Empty string is included in any string
    });

    test('should return true for startsWith with empty right string', () => {
      const operator = new StringOperator(StringOperation.startsWith);
      expect(operator.evaluate('hello world', '')).toBe(true); // Any string starts with an empty string
    });

    test('should return true for endsWith with empty right string', () => {
      const operator = new StringOperator(StringOperation.endsWith);
      expect(operator.evaluate('hello world', '')).toBe(true); // Any string ends with an empty string
    });

    test('should throw error for invalid regex', () => {
      const operator = new StringOperator(StringOperation.matchesRegex);
      expect(() => operator.evaluate('hello world', '[')).toThrow();
    });

    test('should throw error for unsupported operator', () => {
      const operator = new StringOperator('unsupported' as StringOperation);
      expect(() => operator.evaluate('test', 'test')).toThrow('Unsupported string operator: unsupported');
    });
  });
});
