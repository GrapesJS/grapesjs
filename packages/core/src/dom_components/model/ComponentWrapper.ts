import { isUndefined } from 'underscore';
import { attrToString } from '../../utils/dom';
import Component from './Component';
import ComponentHead, { type as typeHead } from './ComponentHead';
import { ComponentOptions, ComponentProperties, ToHTMLOptions } from './types';
import Components from './Components';
import DataResolverListener from '../../data_sources/model/DataResolverListener';
import { DataVariableProps } from '../../data_sources/model/DataVariable';
import { DataCollectionStateMap } from '../../data_sources/model/data_collection/types';
import ComponentWithCollectionsState, {
  DataSourceRecords,
} from '../../data_sources/model/ComponentWithCollectionsState';
import { keyRootData } from '../constants';

type ResolverCurrentItemType = string | number;

export default class ComponentWrapper extends ComponentWithCollectionsState<DataVariableProps> {
  dataSourceWatcher?: DataResolverListener;
  private _resolverCurrentItem?: ResolverCurrentItemType;
  private _isWatchingCollectionStateMap = false;

  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
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
    const { dataResolverPath: dataSourcePath, resolverCurrentItem } = this;

    if (!dataSourcePath) {
      return {};
    }

    const allItems = this.getDataSourceItems();
    const selectedItems = !isUndefined(resolverCurrentItem)
      ? allItems[resolverCurrentItem as keyof DataSourceRecords]
      : allItems;

    return {
      [keyRootData]: selectedItems,
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
