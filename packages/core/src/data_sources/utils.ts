import EditorModel from '../editor/model/Editor';
import { DataResolver, DataResolverProps } from './types';
import { DataCollectionStateMap } from './model/data_collection/types';
import { DataCollectionItemType } from './model/data_collection/constants';
import { DataConditionType, DataCondition } from './model/conditional_variables/DataCondition';
import DataVariable, { DataVariableProps, DataVariableType } from './model/DataVariable';
import Component from '../dom_components/model/Component';
import { ComponentDefinition, ComponentOptions } from '../dom_components/model/types';
import { serialize } from '../utils/mixins';
import { DataConditionIfFalseType, DataConditionIfTrueType } from './model/conditional_variables/constants';

export function isDataResolverProps(value: any): value is DataResolverProps {
  return typeof value === 'object' && [DataVariableType, DataConditionType].includes(value?.type);
}

export function isDataResolver(value: any): value is DataResolver {
  return value instanceof DataVariable || value instanceof DataCondition;
}

export function isDataVariable(variable: any): variable is DataVariableProps {
  return variable?.type === DataVariableType;
}

export function isDataCondition(variable: any) {
  return variable?.type === DataConditionType;
}

export function resolveDynamicValue(variable: any, em: EditorModel) {
  return isDataResolverProps(variable)
    ? getDataResolverInstanceValue(variable, { em, collectionsStateMap: {} })
    : variable;
}

export function getDataResolverInstance(
  resolverProps: DataResolverProps,
  options: { em: EditorModel; collectionsStateMap: DataCollectionStateMap },
) {
  const { type } = resolverProps;
  let resolver: DataResolver;

  switch (type) {
    case DataVariableType:
      resolver = new DataVariable(resolverProps, options);
      break;
    case DataConditionType: {
      resolver = new DataCondition(resolverProps, options);
      break;
    }
    default:
      options.em?.logError(`Unsupported dynamic type: ${type}`);
      return;
  }

  return resolver;
}

export function getDataResolverInstanceValue(
  resolverProps: DataResolverProps,
  options: {
    em: EditorModel;
    collectionsStateMap: DataCollectionStateMap;
  },
) {
  const resolver = getDataResolverInstance(resolverProps, options);

  return resolver?.getDataValue();
}

export const ensureComponentInstance = (
  cmp: Component | ComponentDefinition | undefined,
  opt: ComponentOptions,
): Component => {
  if (cmp instanceof Component) return cmp;

  const componentType = (cmp?.type as string) ?? 'default';
  const defaultModel = opt.em.Components.getType('default');
  const type = opt.em.Components.getType(componentType) ?? defaultModel;
  const Model = type.model;

  return new Model(serialize(cmp ?? {}), opt);
};

export const isComponentDataOutputType = (type: string | undefined) => {
  return !!type && [DataCollectionItemType, DataConditionIfTrueType, DataConditionIfFalseType].includes(type);
};
