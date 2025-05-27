import { isArray } from 'underscore';
import { ObjectAny } from '../../../common';
import Component, { keySymbol } from '../../../dom_components/model/Component';
import { ComponentAddType, ComponentDefinitionDefined, ComponentOptions } from '../../../dom_components/model/types';
import EditorModel from '../../../editor/model/Editor';
import { isObject, toLowerCase } from '../../../utils/mixins';
import DataResolverListener from '../DataResolverListener';
import DataSource from '../DataSource';
import DataVariable, { DataVariableProps, DataVariableType } from '../DataVariable';
import { isDataVariable } from '../../utils';
import { DataCollectionItemType, DataCollectionType, keyCollectionDefinition } from './constants';
import {
  ComponentDataCollectionProps,
  DataCollectionDataSource,
  DataCollectionProps,
  DataCollectionStateMap,
} from './types';
import { detachSymbolInstance, getSymbolInstances } from '../../../dom_components/model/SymbolUtils';
import { updateFromWatcher } from '../../../dom_components/model/ComponentDataResolverWatchers';
import { ModelDestroyOptions } from 'backbone';
import Components from '../../../dom_components/model/Components';

const AvoidStoreOptions = { avoidStore: true, partial: true };
type DataVariableMap = Record<string, DataVariableProps>;

export default class ComponentDataCollection extends Component {
  dataSourceWatcher?: DataResolverListener;

  get defaults(): ComponentDefinitionDefined {
    return {
      // @ts-ignore
      ...super.defaults,
      droppable: false,
      dataResolver: {},
      type: DataCollectionType,
      components: [
        {
          type: DataCollectionItemType,
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

  getDataResolver() {
    return this.get('dataResolver');
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

  setDataResolver(props: DataCollectionProps) {
    return this.set('dataResolver', props);
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

  private get firstChild() {
    return this.components().at(0);
  }

  private updateCollectionConfig(updates: Partial<DataCollectionProps>): void {
    this.set(keyCollectionDefinition, {
      ...this.dataResolver,
      ...updates,
    });
  }

  private getDataSourceItems() {
    const items = getDataSourceItems(this.dataResolver.dataSource, this.em);
    if (isArray(items)) {
      return items;
    }

    const clone = { ...items };
    delete clone['__p'];
    return clone;
  }

  private get dataResolver() {
    return (this.get(keyCollectionDefinition) || {}) as DataCollectionProps;
  }

  private get collectionDataSource() {
    return this.dataResolver.dataSource;
  }

  private listenToDataSource() {
    const { em } = this;
    const path = this.collectionDataSource?.path;
    if (!path) return;
    this.dataSourceWatcher = new DataResolverListener({
      em,
      resolver: new DataVariable(
        { type: DataVariableType, path },
        { em, collectionsStateMap: this.collectionsStateMap },
      ),
      onUpdate: this.rebuildChildrenFromCollection,
    });
  }

  private rebuildChildrenFromCollection() {
    this.components().reset(this.getCollectionItems(), updateFromWatcher as any);
  }

  private getCollectionItems() {
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
    const items = this.getDataSourceItems();
    const { startIndex, endIndex } = this.resolveCollectionConfig(items);

    const isDuplicatedId = this.hasDuplicateCollectionId();
    if (isDuplicatedId) {
      this.em.logError(
        `The collection ID "${collectionId}" already exists in the parent collection state. Overriding it is not allowed.`,
      );

      return components;
    }

    for (let index = startIndex; index <= endIndex; index++) {
      const isFirstItem = index === startIndex;
      const key = isArray(items) ? index : Object.keys(items)[index];
      const collectionsStateMap = this.getCollectionsStateMapForItem(items, key);

      if (isFirstItem) {
        getSymbolInstances(firstChild)?.forEach((cmp) => detachSymbolInstance(cmp));

        setCollectionStateMapAndPropagate(firstChild, collectionsStateMap);
        // TODO: Move to component view
        firstChild.addStyle({ display: resolvedDisplay }, AvoidStoreOptions);

        continue;
      }

      const instance = firstChild!.clone({ symbol: true, symbolInv: true });
      instance.set({ locked: true, layerable: false }, AvoidStoreOptions);
      setCollectionStateMapAndPropagate(instance, collectionsStateMap);
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
    const dataConditionItemModel = this.em.Components.getType(DataCollectionItemType)!.model;

    return (
      this.firstChild ||
      new dataConditionItemModel(
        {
          type: DataCollectionItemType,
        },
        this.opt,
      )
    );
  }

  private listenToPropsChange() {
    this.on(`change:${keyCollectionDefinition}`, () => {
      this.rebuildChildrenFromCollection();
      this.listenToDataSource();
    });
    this.listenToDataSource();
  }

  private removePropsListeners() {
    this.off(`change:${keyCollectionDefinition}`);
    this.dataSourceWatcher?.destroy();
  }

  onCollectionsStateMapUpdate(collectionsStateMap: DataCollectionStateMap) {
    this.collectionsStateMap = collectionsStateMap;
    this.dataResolverWatchers.onCollectionsStateMapUpdate();

    const items = this.getDataSourceItems();
    const { startIndex } = this.resolveCollectionConfig(items);
    const cmps = this.components();
    cmps.forEach((cmp, index) => {
      const collectionsStateMap = this.getCollectionsStateMapForItem(items, startIndex + index);
      cmp.onCollectionsStateMapUpdate(collectionsStateMap);
    });
  }

  stopSyncComponentCollectionState() {
    this.stopListening(this.components(), 'add remove reset', this.syncOnComponentChange);
    this.onCollectionsStateMapUpdate({});
  }

  syncOnComponentChange(model: Component, collection: Components, opts: any) {
    const collectionsStateMap = this.collectionsStateMap;
    // Avoid assigning wrong collectionsStateMap value to children components
    this.collectionsStateMap = {};

    super.syncOnComponentChange(model, collection, opts);
    this.collectionsStateMap = collectionsStateMap;
    this.onCollectionsStateMapUpdate(collectionsStateMap);
  }

  private get collectionId() {
    return this.getDataResolver().collectionId as string;
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === DataCollectionType;
  }

  toJSON(opts?: ObjectAny) {
    const json = super.toJSON.call(this, opts) as ComponentDataCollectionProps;
    delete json.droppable;
    delete json[keySymbol];
    delete json.attributes?.id;

    const firstChild = this.firstChild as any;
    return { ...json, components: [firstChild] };
  }

  destroy(options?: ModelDestroyOptions | undefined): false | JQueryXHR {
    this.removePropsListeners();
    return super.destroy(options);
  }
}

function getLength(items: DataVariableProps[] | object) {
  return isArray(items) ? items.length : Object.keys(items).length;
}

function setCollectionStateMapAndPropagate(cmp: Component, collectionsStateMap: DataCollectionStateMap) {
  cmp.setSymbolOverride(['locked', 'layerable']);
  cmp.syncComponentsCollectionState();
  cmp.onCollectionsStateMapUpdate(collectionsStateMap);
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

function getDataSourceItems(
  dataSource: DataCollectionDataSource,
  em: EditorModel,
): DataVariableProps[] | DataVariableMap {
  switch (true) {
    case isObject(dataSource) && dataSource instanceof DataSource: {
      const id = dataSource.get('id')!;
      return listDataSourceVariables(id, em);
    }
    case isDataVariable(dataSource): {
      const path = dataSource.path;
      if (!path) return [];
      const isDataSourceId = path.split('.').length === 1;
      if (isDataSourceId) {
        return listDataSourceVariables(path, em);
      } else {
        return em.DataSources.getValue(path, []);
      }
    }
    default:
      return [];
  }
}

function listDataSourceVariables(dataSource_id: string, em: EditorModel): DataVariableProps[] {
  const records = em.DataSources.getValue(dataSource_id, []);
  const keys = Object.keys(records);

  return keys.map((key) => ({
    type: DataVariableType,
    path: dataSource_id + '.' + key,
  }));
}
