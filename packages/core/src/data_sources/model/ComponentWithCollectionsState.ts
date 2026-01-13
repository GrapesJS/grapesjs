import { DataCollectionStateMap } from '../../data_sources/model/data_collection/types';
import DataResolverListener from '../../data_sources/model/DataResolverListener';
import DataVariable, { DataVariableProps, DataVariableType } from '../../data_sources/model/DataVariable';
import Components from '../../dom_components/model/Components';
import Component from '../../dom_components/model/Component';
import { ObjectAny } from '../../common';
import DataSource from './DataSource';
import { isArray } from 'underscore';

export type DataVariableMap = Record<string, DataVariableProps>;

export type DataSourceRecords = DataVariableProps[] | DataVariableMap;

export default class ComponentWithCollectionsState<DataResolverType> extends Component {
  collectionsStateMap: DataCollectionStateMap = {};
  dataSourceWatcher?: DataResolverListener;

  constructor(props: any, opt: any) {
    super(props, opt);
    this.listenToPropsChange();
  }

  onCollectionsStateMapUpdate(collectionsStateMap: DataCollectionStateMap) {
    this.collectionsStateMap = collectionsStateMap;
    this.dataResolverWatchers?.onCollectionsStateMapUpdate?.();

    this.components().forEach((cmp) => {
      cmp.onCollectionsStateMapUpdate?.(collectionsStateMap);
    });
  }

  syncOnComponentChange(model: Component, collection: Components, opts: any) {
    const prev = this.collectionsStateMap;
    this.collectionsStateMap = {};
    super.syncOnComponentChange(model, collection, opts);
    this.collectionsStateMap = prev;
    this.onCollectionsStateMapUpdate(prev);
  }

  setDataResolver(dataResolver: DataResolverType | undefined) {
    return this.set('dataResolver', dataResolver);
  }

  getDataResolver() {
    return this.dataResolverProps;
  }

  get dataResolverProps(): DataResolverType | undefined {
    return this.get('dataResolver');
  }

  protected listenToDataSource() {
    const path = this.dataResolverPath;
    if (!path) return;

    const { em, collectionsStateMap } = this;
    this.dataSourceWatcher?.destroy();
    this.dataSourceWatcher = new DataResolverListener({
      em,
      resolver: new DataVariable({ type: DataVariableType, path }, { em, collectionsStateMap }),
      onUpdate: () => this.onDataSourceChange(),
    });
  }

  protected listenToPropsChange() {
    this.on(`change:dataResolver`, () => {
      this.listenToDataSource();
    });

    this.listenToDataSource();
  }

  protected get dataSourceProps(): DataVariableProps | undefined {
    return this.get('dataResolver');
  }

  protected get dataResolverPath(): string | undefined {
    return this.dataSourceProps?.path;
  }

  protected onDataSourceChange() {
    this.onCollectionsStateMapUpdate(this.collectionsStateMap);
  }

  getDataSourceItems(): DataSourceRecords {
    const { dataSourceProps } = this;
    if (!dataSourceProps) return [];

    const items = this.listDataSourceItems(dataSourceProps);
    if (items && isArray(items)) {
      return items;
    }

    const clone = { ...items };
    return clone;
  }

  protected listDataSourceItems(dataSource: DataSource | DataVariableProps): DataSourceRecords {
    const path = dataSource instanceof DataSource ? dataSource.get('id')! : dataSource.path;
    if (!path) return [];
    let value = this.em.DataSources.getValue(path, []);

    const isDatasourceId = path.split('.').length === 1;
    if (isDatasourceId) {
      value = Object.entries(value).map(([_, value]) => value);
    }

    return value;
  }

  protected getItemKey(items: DataVariableProps[] | { [x: string]: DataVariableProps }, index: number) {
    return isArray(items) ? index : Object.keys(items)[index];
  }

  private removePropsListeners() {
    this.off(`change:dataResolver`);
    this.dataSourceWatcher?.destroy();
    this.dataSourceWatcher = undefined;
  }

  destroy(options?: ObjectAny): false | JQueryXHR {
    this.removePropsListeners();
    return super.destroy(options);
  }
}
