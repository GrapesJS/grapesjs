import { all, isArray, isNumber, isUndefined } from 'underscore';
import ComponentWithCollectionsState from '../../data_sources/model/ComponentWithCollectionsState';
import DataResolverListener from '../../data_sources/model/DataResolverListener';
import { DataVariableProps } from '../../data_sources/model/DataVariable';
import { DataCollectionStateMap, DataCollectionStateType } from '../../data_sources/model/data_collection/types';
import { DataCollectionKeys } from '../../data_sources/types';
import { attrToString } from '../../utils/dom';
import Component from './Component';
import ComponentHead, { type as typeHead } from './ComponentHead';
import Components from './Components';
import { ComponentOptions, ComponentProperties, ToHTMLOptions } from './types';

type ResolverCurrentItemType = string | number;

export default class ComponentWrapper extends ComponentWithCollectionsState<DataVariableProps> {
  dataSourceWatcher?: DataResolverListener;
  private _resolverCurrentItem: ResolverCurrentItemType = 0;
  private _isWatchingCollectionStateMap = false;

  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      dataResolver: null,
      tagName: 'body',
      removable: false,
      copyable: false,
      draggable: false,
      components: [],
      traits: [],
      doctype: '',
      head: null,
      docEl: null,
      stylable: [
        'background',
        'background-color',
        'background-image',
        'background-repeat',
        'background-attachment',
        'background-position',
        'background-size',
      ],
    };
  }

  constructor(props: ComponentProperties = {}, opt: ComponentOptions) {
    super(props, opt);

    const hasDataResolver = this.dataResolverProps;
    if (hasDataResolver) {
      this.onDataSourceChange();
      this.syncComponentsCollectionState();
    }
  }

  preInit() {
    const { opt, attributes: props } = this;
    const cmp = this.em?.Components;
    const CmpHead = cmp?.getType(typeHead)?.model;
    const CmpDef = cmp?.getType('default').model;
    if (CmpHead) {
      const { head, docEl } = props;
      this.set(
        {
          head: head && head instanceof Component ? head : new CmpHead({ ...head }, opt),
          docEl: docEl && docEl instanceof Component ? docEl : new CmpDef({ tagName: 'html', ...docEl }, opt),
        },
        { silent: true },
      );
    }
  }

  get head(): ComponentHead {
    return this.get('head');
  }

  get docEl(): Component {
    return this.get('docEl');
  }

  get doctype(): string {
    return this.attributes.doctype || '';
  }

  clone(opt?: { symbol?: boolean | undefined; symbolInv?: boolean | undefined }): this {
    const result = super.clone(opt);
    result.set('head', this.get('head').clone(opt));
    result.set('docEl', this.get('docEl').clone(opt));

    return result;
  }

  toHTML(opts: ToHTMLOptions = {}) {
    const { doctype } = this;
    const asDoc = !isUndefined(opts.asDocument) ? opts.asDocument : !!doctype;
    const { head, docEl } = this;
    const body = super.toHTML(opts);
    const headStr = (asDoc && head?.toHTML(opts)) || '';
    const docElAttr = (asDoc && attrToString(docEl?.getAttrToHTML())) || '';
    const docElAttrStr = docElAttr ? ` ${docElAttr}` : '';
    return asDoc ? `${doctype}<html${docElAttrStr}>${headStr}${body}</html>` : body;
  }

  onCollectionsStateMapUpdate(collectionsStateMap: DataCollectionStateMap) {
    const { head } = this;
    super.onCollectionsStateMapUpdate(collectionsStateMap);
    head.onCollectionsStateMapUpdate(collectionsStateMap);
  }

  syncComponentsCollectionState() {
    super.syncComponentsCollectionState();
    this.head.syncComponentsCollectionState();
  }

  syncOnComponentChange(model: Component, collection: Components, opts: any) {
    const collectionsStateMap: any = this.getCollectionsStateMap();

    this.collectionsStateMap = collectionsStateMap;
    super.syncOnComponentChange(model, collection, opts);
    this.onCollectionsStateMapUpdate(collectionsStateMap);
  }

  get resolverCurrentItem(): ResolverCurrentItemType | undefined {
    return this._resolverCurrentItem;
  }

  set resolverCurrentItem(value: ResolverCurrentItemType) {
    this._resolverCurrentItem = value;
    this.onCollectionsStateMapUpdate(this.getCollectionsStateMap());
  }

  setResolverCurrentItem(value: ResolverCurrentItemType) {
    this.resolverCurrentItem = value;
  }

  getCollectionsState() {
    const collectionId = `${DataCollectionKeys.rootData}`;
    const { dataResolverPath, resolverCurrentItem } = this;
    const result = { collectionId };
    if (!dataResolverPath) return result;

    let prevItem: Record<string, any> | undefined;
    let currentItem: Record<string, any> | undefined;
    let nextItem: Record<string, any> | undefined;

    const allItems: Record<string, any> | Record<string, any>[] = this.getDataSourceItems();
    const allItemsArray = isArray(allItems) ? allItems : Object.values(allItems || {});
    let currentIndex = resolverCurrentItem;

    if (isNumber(resolverCurrentItem)) {
      currentItem = allItemsArray[resolverCurrentItem];
      prevItem = allItemsArray[resolverCurrentItem - 1];
      nextItem = allItemsArray[resolverCurrentItem + 1];
    } else {
      const entries = Object.entries(allItems).map(([id, value]) => ({ id, ...value }));
      const idx = entries.findIndex((it) => it?.id === resolverCurrentItem);
      currentIndex = idx;
      currentItem = allItemsArray[idx];
      prevItem = allItemsArray[idx - 1];
      nextItem = allItemsArray[idx + 1];
    }

    return {
      ...result,
      prevItem,
      nextItem,
      [DataCollectionStateType.currentItem]: currentItem,
      [DataCollectionStateType.currentIndex]: currentIndex,
      [DataCollectionStateType.totalItems]: allItemsArray.length,
    };
  }

  protected onDataSourceChange() {
    this.onCollectionsStateMapUpdate(this.getCollectionsStateMap());
  }

  protected listenToPropsChange() {
    this.on(`change:dataResolver`, (_, value) => {
      const hasResolver = !isUndefined(value);

      if (hasResolver && !this._isWatchingCollectionStateMap) {
        this._isWatchingCollectionStateMap = true;
        this.syncComponentsCollectionState();
        this.onCollectionsStateMapUpdate(this.getCollectionsStateMap());
        this.listenToDataSource();
      } else if (!hasResolver && this._isWatchingCollectionStateMap) {
        this._isWatchingCollectionStateMap = false;
        this.stopSyncComponentCollectionState();
      }
    });

    this.listenToDataSource();
  }

  private getCollectionsStateMap(): DataCollectionStateMap {
    if (!this.dataResolverPath) return {};

    return {
      [DataCollectionKeys.rootData]: this.getCollectionsState(),
    } as DataCollectionStateMap;
  }

  __postAdd() {
    const um = this.em?.UndoManager;
    !this.__hasUm && um?.add(this);
    return super.__postAdd();
  }

  __postRemove() {
    const um = this.em?.UndoManager;
    um?.remove(this);
    return super.__postRemove();
  }

  static isComponent() {
    return false;
  }
}
