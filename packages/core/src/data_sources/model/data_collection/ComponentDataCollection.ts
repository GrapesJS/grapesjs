import { isArray } from 'underscore';
import { ObjectAny } from '../../../common';
import Component, { keySymbol } from '../../../dom_components/model/Component';
import { keyDataValues, updateFromWatcher } from '../../../dom_components/model/ModelDataResolverWatchers';
import { detachSymbolInstance, getSymbolInstances } from '../../../dom_components/model/SymbolUtils';
import { ComponentAddType, ComponentDefinitionDefined, ComponentOptions } from '../../../dom_components/model/types';
import EditorModel from '../../../editor/model/Editor';
import { toLowerCase } from '../../../utils/mixins';
import { DataComponentTypes } from '../../types';
import ComponentWithCollectionsState, { DataVariableMap } from '../ComponentWithCollectionsState';
import DataResolverListener from '../DataResolverListener';
import { DataVariableProps } from '../DataVariable';
import { keyCollectionDefinition } from './constants';
import {
  ComponentDataCollectionProps,
  DataCollectionDataSource,
  DataCollectionProps,
  DataCollectionStateMap,
} from './types';

const AvoidStoreOptions = { avoidStore: true, partial: true };

export default class ComponentDataCollection extends ComponentWithCollectionsState<DataCollectionProps> {
  dataSourceWatcher?: DataResolverListener;

  get defaults(): ComponentDefinitionDefined {
    return {
      // @ts-ignore
      ...super.defaults,
      droppable: false,
      dataResolver: {},
      type: DataComponentTypes.collection,
      components: [
        {
          type: DataComponentTypes.collectionItem,
        },
      ],
    };
  }

  constructor(props: ComponentDataCollectionProps, opt: ComponentOptions) {
    if (opt.forCloning) {
      return super(props as any, opt) as unknown as ComponentDataCollection;
    }

    const newProps = { ...props, droppable: false } as any;
    const cmp: ComponentDataCollection = super(newProps, opt) as unknown as ComponentDataCollection;
    this.rebuildChildrenFromCollection = this.rebuildChildrenFromCollection.bind(this);
    this.listenToPropsChange();
    this.rebuildChildrenFromCollection();

    return cmp;
  }

  getItemsCount() {
    const items = this.getDataSourceItems();
    const itemsCount = getLength(items);

    const startIndex = Math.max(0, this.getConfigStartIndex() ?? 0);
    const configEndIndex = this.getConfigEndIndex() ?? Number.MAX_VALUE;
    const endIndex = Math.min(itemsCount - 1, configEndIndex);

    const count = endIndex - startIndex + 1;
    return Math.max(0, count);
  }

  getConfigStartIndex() {
    return this.dataResolver.startIndex;
  }

  getConfigEndIndex() {
    return this.dataResolver.endIndex;
  }

  getDataSource(): DataCollectionDataSource {
    return this.dataResolver?.dataSource;
  }

  getCollectionId(): string {
    return this.dataResolver?.collectionId;
  }

  getCollectionItemComponents() {
    return this.firstChild.components();
  }

  setCollectionId(collectionId: string) {
    this.updateCollectionConfig({ collectionId });
  }

  setStartIndex(startIndex: number): void {
    if (startIndex < 0) {
      this.em.logError('Start index should be greater than or equal to 0');
      return;
    }

    this.updateCollectionConfig({ startIndex });
  }

  setEndIndex(endIndex: number): void {
    this.updateCollectionConfig({ endIndex });
  }

  setDataSource(dataSource: DataCollectionDataSource) {
    this.set(keyCollectionDefinition, {
      ...this.dataResolver,
      dataSource,
    });
  }

  setCollectionItemComponents(content: ComponentAddType) {
    this.firstChild.components(content);
  }

  onCollectionsStateMapUpdate(collectionsStateMap: DataCollectionStateMap) {
    super.onCollectionsStateMapUpdate(collectionsStateMap);

    const items = this.getDataSourceItems();
    const { startIndex } = this.resolveCollectionConfig(items);
    const cmps = this.components();
    cmps.forEach((cmp, index) => {
      const key = this.getItemKey(items, startIndex + index);
      const collectionsStateMap = this.getCollectionsStateMapForItem(items, key);
      cmp.onCollectionsStateMapUpdate(collectionsStateMap);
    });
  }

  protected stopSyncComponentCollectionState() {
    this.stopListening(this.components(), 'add remove reset', this.syncOnComponentChange);
    this.onCollectionsStateMapUpdate({});
  }

  protected setCollectionStateMapAndPropagate(cmp: Component, collectionsStateMap: DataCollectionStateMap) {
    cmp.setSymbolOverride(['locked', 'layerable', keyDataValues]);
    cmp.syncComponentsCollectionState();
    cmp.onCollectionsStateMapUpdate(collectionsStateMap);
  }

  protected onDataSourceChange() {
    this.rebuildChildrenFromCollection();
  }

  protected listenToPropsChange() {
    this.on(`change:${keyCollectionDefinition}`, () => {
      this.rebuildChildrenFromCollection();
      this.listenToDataSource();
    });

    this.listenToDataSource();
  }

  protected get dataSourceProps(): DataVariableProps | undefined {
    return this.dataResolver.dataSource;
  }

  protected get dataResolver(): DataCollectionProps {
    return this.get(keyCollectionDefinition) || {};
  }

  private get firstChild() {
    return this.components().at(0);
  }

  private updateCollectionConfig(updates: Partial<DataCollectionProps>): void {
    this.set(keyCollectionDefinition, {
      ...this.dataResolver,
      ...updates,
    });
  }

  private rebuildChildrenFromCollection() {
    const items = this.getDataSourceItems();
    const { totalItems } = this.resolveCollectionConfig(items);

    if (totalItems === this.components().length) {
      this.onCollectionsStateMapUpdate(this.collectionsStateMap);
      return;
    }

    const collectionItems = this.getCollectionItems(items as any);
    this.components().reset(collectionItems, updateFromWatcher as any);
  }

  private getCollectionItems(items?: any[]) {
    const firstChild = this.ensureFirstChild();
    const displayStyle = firstChild.getStyle()['display'];
    const isDisplayNoneOrMissing = !displayStyle || displayStyle === 'none';
    const resolvedDisplay = isDisplayNoneOrMissing ? '' : displayStyle;

    // TODO: Move to component view
    firstChild.addStyle({ display: 'none' }, AvoidStoreOptions);
    const components: Component[] = [firstChild];

    const result = validateCollectionDef(this.dataResolver, this.em);
    if (!result) {
      return components;
    }

    const collectionId = this.collectionId;
    const dataItems = items ?? this.getDataSourceItems();
    const { startIndex, endIndex } = this.resolveCollectionConfig(dataItems);

    const isDuplicatedId = this.hasDuplicateCollectionId();
    if (isDuplicatedId) {
      this.em.logError(
        `The collection ID "${collectionId}" already exists in the parent collection state. Overriding it is not allowed.`,
      );
      return components;
    }

    for (let index = startIndex; index <= endIndex; index++) {
      const isFirstItem = index === startIndex;
      const key = this.getItemKey(dataItems, index);
      const collectionsStateMap = this.getCollectionsStateMapForItem(dataItems, key);

      if (isFirstItem) {
        getSymbolInstances(firstChild)?.forEach((cmp) => detachSymbolInstance(cmp));
        this.setCollectionStateMapAndPropagate(firstChild, collectionsStateMap);
        // TODO: Move to component view
        firstChild.addStyle({ display: resolvedDisplay }, AvoidStoreOptions);
        continue;
      }

      const instance = firstChild.clone({ symbol: true, symbolInv: true });
      instance.set({ locked: true, layerable: false }, AvoidStoreOptions);
      this.setCollectionStateMapAndPropagate(instance, collectionsStateMap);
      components.push(instance);
    }

    return components;
  }

  private getCollectionsStateMapForItem(items: DataVariableProps[] | DataVariableMap, key: number | string) {
    const { startIndex, endIndex, totalItems } = this.resolveCollectionConfig(items);
    const collectionId = this.collectionId;
    let item: DataVariableProps = (items as any)[key];
    const parentCollectionStateMap = this.collectionsStateMap;

    const numericKey = typeof key === 'string' ? Object.keys(items).indexOf(key) : key;
    const offset = numericKey - startIndex;
    const remainingItems = totalItems - (1 + offset);
    const collectionState = {
      collectionId,
      currentIndex: numericKey,
      currentItem: item,
      currentKey: key,
      startIndex,
      endIndex,
      totalItems,
      remainingItems,
    };

    const collectionsStateMap: DataCollectionStateMap = {
      ...parentCollectionStateMap,
      [collectionId]: collectionState,
    };

    return collectionsStateMap;
  }

  private hasDuplicateCollectionId() {
    const collectionId = this.collectionId;
    const parentCollectionStateMap = this.collectionsStateMap;

    return !!parentCollectionStateMap[collectionId];
  }

  private resolveCollectionConfig(items: DataVariableProps[] | DataVariableMap) {
    const isArray = Array.isArray(items);
    const actualItemCount = isArray ? items.length : Object.keys(items).length;

    const startIndex = this.getConfigStartIndex() ?? 0;
    const configEndIndex = this.getConfigEndIndex() ?? Number.MAX_VALUE;
    const endIndex = Math.min(actualItemCount - 1, configEndIndex);

    let totalItems = 0;
    if (actualItemCount > 0) {
      totalItems = Math.max(0, endIndex - startIndex + 1);
    }

    return { startIndex, endIndex, totalItems, isArray };
  }

  private ensureFirstChild() {
    const dataConditionItemModel = this.em.Components.getType(DataComponentTypes.collectionItem)!.model;
    return this.firstChild || new dataConditionItemModel({ type: DataComponentTypes.collectionItem }, this.opt);
  }

  private get collectionId() {
    return this.dataResolverProps?.collectionId ?? '';
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === DataComponentTypes.collection;
  }

  toJSON(opts?: ObjectAny) {
    const json = super.toJSON.call(this, opts) as ComponentDataCollectionProps;
    delete json.droppable;
    delete json[keySymbol];

    const firstChild = this.firstChild as any;
    return { ...json, components: [firstChild] };
  }
}

function getLength(items: DataVariableProps[] | object) {
  return isArray(items) ? items.length : Object.keys(items).length;
}

function logErrorIfMissing(property: any, propertyPath: string, em: EditorModel) {
  if (!property) {
    em.logError(`The "${propertyPath}" property is required in the collection definition.`);
    return false;
  }
  return true;
}

function validateCollectionDef(dataResolver: DataCollectionProps, em: EditorModel) {
  const validations = [
    { property: dataResolver?.collectionId, propertyPath: 'dataResolver.collectionId' },
    { property: dataResolver?.dataSource, propertyPath: 'dataResolver.dataSource' },
  ];

  for (const { propertyPath } of validations) {
    if (!logErrorIfMissing(dataResolver, propertyPath, em)) {
      return [];
    }
  }

  const startIndex = dataResolver?.startIndex;

  if (startIndex !== undefined && (startIndex < 0 || !Number.isInteger(startIndex))) {
    em.logError(`Invalid startIndex: ${startIndex}. It must be a non-negative integer.`);
  }

  return true;
}
