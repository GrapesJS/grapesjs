import Trait from './Trait';
import TraitModifier from './TraitModifier';

interface JSInputData {
  render(params?: any): string;
  type: 'variable' | 'function';
  resultType: 'string' | 'list' | 'object';
}

export function jsVariable<TraitValueType = any>(overrideValue: string): JSInputData {
  return {
    type: 'variable',
    resultType: 'string',
    render() {
      return overrideValue;
    },
  };
}

export function jsFunction<TraitValueType = any>(overrideValue: (value: TraitValueType) => string): JSInputData {
  return {
    type: 'function',
    resultType: 'list',
    render(value) {
      return overrideValue(value);
    },
  };
}

export function jsModifier<TraitValueType = any>(
  overrideValue: JSInputData
): (value: TraitValueType) => { _js: JSInputData } & TraitValueType {
  return value => ({ ...value, _js: overrideValue });
}
