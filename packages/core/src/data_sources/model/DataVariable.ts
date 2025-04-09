import { Model } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { isDataVariable } from '../utils';
import { DataCollectionStateMap, DataCollectionState, DataCollectionStateType } from './data_collection/types';

export const DataVariableType = 'data-variable' as const;

export interface DataVariableProps {
  type?: typeof DataVariableType;
  path?: string;
  defaultValue?: string;
  collectionId?: string;
  variableType?: DataCollectionStateType;
}

export default class DataVariable extends Model<DataVariableProps> {
  private em: EditorModel;
  private collectionsStateMap: DataCollectionStateMap;

  defaults(): DataVariableProps {
    return {
      type: DataVariableType,
      defaultValue: '',
      path: '',
      collectionId: undefined,
      variableType: undefined,
    };
  }

  constructor(props: DataVariableProps, options: { em: EditorModel; collectionsStateMap: DataCollectionStateMap }) {
    super(props, options);
    this.em = options.em;
    this.collectionsStateMap = options.collectionsStateMap;
  }

  get path(): string {
    return this.get('path') ?? '';
  }

  get defaultValue(): string {
    return this.get('defaultValue') ?? '';
  }

  get collectionId(): string | undefined {
    return this.get('collectionId');
  }

  get variableType(): DataCollectionStateType | undefined {
    return this.get('variableType');
  }

  getDataValue() {
    if (this.resolvesFromCollection()) {
      const valueOrDataVariableProps = this.resolveCollectionVariable();
      if (!isDataVariable(valueOrDataVariableProps)) return valueOrDataVariableProps;
      const { path = '' } = valueOrDataVariableProps;

      return this.resolveDataSourcePath(path);
    }

    return this.resolveDataSourcePath(this.path);
  }

  resolvesFromCollection(): boolean {
    return !!this.collectionId;
  }

  updateCollectionsStateMap(collectionsStateMap: DataCollectionStateMap): void {
    this.collectionsStateMap = collectionsStateMap;
    this.trigger('change');
  }

  getResolverPath(): string | false {
    if (this.resolvesFromCollection()) {
      const value = this.resolveCollectionVariable();
      if (!isDataVariable(value)) return false;

      return value.path ?? '';
    }

    return this.path;
  }

  toJSON(options?: any): DataVariableProps & { type: typeof DataVariableType } {
    const defaults = this.defaults();
    const json = super.toJSON(options);
    const filteredJson = Object.fromEntries(
      Object.entries(json).filter(([key, value]) => value !== defaults[key as keyof DataVariableProps]),
    ) as Partial<DataVariableProps>;

    return {
      ...filteredJson,
      type: DataVariableType,
    };
  }

  private resolveDataSourcePath(path: string) {
    return this.em.DataSources.getValue(path, this.defaultValue);
  }

  private resolveCollectionVariable(): unknown {
    const { collectionId = '', variableType, path, defaultValue = '' } = this.attributes;
    if (!this.collectionsStateMap) return defaultValue;

    const collectionItem = this.collectionsStateMap[collectionId];
    if (!collectionItem) return defaultValue;

    if (!variableType) {
      this.em.logError(`Missing collection variable type for collection: ${collectionId}`);
      return defaultValue;
    }

    return variableType === 'currentItem'
      ? this.resolveCurrentItem(collectionItem, path, collectionId)
      : collectionItem[variableType];
  }

  private resolveCurrentItem(
    collectionItem: DataCollectionState,
    path: string | undefined,
    collectionId: string,
  ): unknown {
    const currentItem = collectionItem.currentItem;
    if (!currentItem) {
      this.em.logError(`Current item is missing for collection: ${collectionId}`);
      return '';
    }

    if (currentItem.type === DataVariableType) {
      const resolvedPath = currentItem.path ? `${currentItem.path}.${path}` : path;
      return { type: DataVariableType, path: resolvedPath };
    }

    if (path && !(currentItem as any)[path]) {
      this.em.logError(`Path not found in current item: ${path} for collection: ${collectionId}`);
      return '';
    }

    return path ? (currentItem as any)[path] : currentItem;
  }
}
