import EditorModel from '../editor/model/Editor';
import { DataComponentTypes, DataResolver, DataResolverProps, ResolverFromProps } from './types';
import { DataCollectionStateMap } from './model/data_collection/types';
import { DataConditionType, DataCondition } from './model/conditional_variables/DataCondition';
import DataVariable, { DataVariableProps, DataVariableType } from './model/DataVariable';
import { ComponentDefinition, ComponentOptions } from '../dom_components/model/types';
import { serialize } from '../utils/mixins';
import { getSymbolMain } from '../dom_components/model/SymbolUtils';
import Component from '../dom_components/model/Component';

export const DEF_DATA_FIELD_ID = 'id';

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

export function valueOrResolve(variable: any, opts: { em: EditorModel; collectionsStateMap: DataCollectionStateMap }) {
  if (!isDataResolverProps(variable)) return variable;
  if (isDataVariable(variable)) DataVariable.resolveDataResolver(variable, opts);

  return getDataResolverInstanceValue(variable, opts);
}

export function getDataResolverInstance(
  resolverProps: DataResolverProps,
  options: { em: EditorModel; collectionsStateMap: DataCollectionStateMap },
): ResolverFromProps<typeof resolverProps> | undefined {
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
      options.em?.logWarning(`Unsupported resolver type: ${type}`);
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
  return (
    !!type &&
    [DataComponentTypes.collectionItem, DataComponentTypes.conditionTrue, DataComponentTypes.conditionFalse].includes(
      type as DataComponentTypes,
    )
  );
};

export function enumToArray(enumObj: any) {
  return Object.keys(enumObj)
    .filter((key) => isNaN(Number(key)))
    .map((key) => enumObj[key]);
}

function shouldSyncCollectionSymbol(component: Component): boolean {
  const componentCollectionMap = component.collectionsStateMap;
  if (!componentCollectionMap) return false;

  const parentCollectionIds = Object.keys(componentCollectionMap);
  if (!parentCollectionIds.length) return false;

  const mainSymbolComponent = getSymbolMain(component);

  if (!mainSymbolComponent || mainSymbolComponent === component) return false;

  const mainSymbolCollectionMap = mainSymbolComponent.collectionsStateMap;
  const mainSymbolParentIds = Object.keys(mainSymbolCollectionMap);

  const isSubsetOfOriginalCollections = mainSymbolParentIds.every((id) => parentCollectionIds.includes(id));

  return isSubsetOfOriginalCollections;
}

function getIdFromCollectionSymbol(component: Component): string {
  const mainSymbolComponent = getSymbolMain(component);
  return mainSymbolComponent ? mainSymbolComponent.getId() : '';
}

export function checkAndGetSyncableCollectionItemId(component: Component) {
  const shouldSync = shouldSyncCollectionSymbol(component);
  const itemId = shouldSync ? getIdFromCollectionSymbol(component) : null;
  return { shouldSync, itemId };
}
