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
  asPlainText?: boolean;
}

interface DataVariableOptions {
  em: EditorModel;
  collectionsStateMap: DataCollectionStateMap;
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
      asPlainText: undefined,
    };
  }

  constructor(props: DataVariableProps, options: DataVariableOptions) {
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
      return isDataVariable(value) ? (value.path ?? '') : false;
    }
    return this.path;
  }

  toJSON(options?: any): DataVariableProps & { type: typeof DataVariableType } {
    const defaults = this.defaults();
    const json = super.toJSON(options);
    const filteredJson = Object.fromEntries(
      Object.entries(json).filter(([key, value]) => value !== defaults[key as keyof DataVariableProps]),
    ) as Partial<DataVariableProps>;
    return { ...filteredJson, type: DataVariableType };
  }

  getDataValue() {
    const opts = {
      em: this.em,
      collectionsStateMap: this.collectionsStateMap,
    };

    return DataVariable.resolveDataResolver(
      {
        path: this.path,
        defaultValue: this.defaultValue,
        collectionId: this.collectionId,
        variableType: this.variableType,
      },
      opts,
    );
  }

  static resolveDataSourceVariable(
    props: {
      path?: string;
      defaultValue?: string;
    },
    opts: {
      em: EditorModel;
    },
  ) {
    return opts.em.DataSources.getValue(props.path ?? '', props.defaultValue ?? '');
  }

  static resolveDataResolver(
    props: {
      path?: string;
      defaultValue?: string;
      collectionId?: string;
      variableType?: DataCollectionStateType;
    },
    opts: DataVariableOptions,
  ) {
    if (props.collectionId) {
      const value = DataVariable.resolveCollectionVariable(props, opts);
      if (!isDataVariable(value)) return value;
      return DataVariable.resolveDataSourceVariable(
        { path: value.path ?? '', defaultValue: props.defaultValue ?? '' },
        { em: opts.em },
      );
    }
    return DataVariable.resolveDataSourceVariable(
      { path: props.path ?? '', defaultValue: props.defaultValue ?? '' },
      { em: opts.em },
    );
  }

  private resolveCollectionVariable(): unknown {
    const { em, collectionsStateMap } = this;
    return DataVariable.resolveCollectionVariable(this.attributes, { em, collectionsStateMap });
  }

  static resolveCollectionVariable(
    dataResolverProps: {
      collectionId?: string;
      variableType?: DataCollectionStateType;
      path?: string;
      defaultValue?: string;
    },
    opts: DataVariableOptions,
  ): unknown {
    const { collectionId = '', variableType, path, defaultValue = '' } = dataResolverProps;
    const { em, collectionsStateMap } = opts;

    if (!collectionsStateMap) return defaultValue;

    const collectionItem = collectionsStateMap[collectionId];
    if (!collectionItem) return defaultValue;

    if (!variableType) {
      em.logError(`Missing collection variable type for collection: ${collectionId}`);
      return defaultValue;
    }

    return variableType === 'currentItem'
      ? DataVariable.resolveCurrentItem(collectionItem, path, collectionId, em)
      : collectionItem[variableType];
  }

  private static resolveCurrentItem(
    collectionItem: DataCollectionState,
    path: string | undefined,
    collectionId: string,
    em: EditorModel,
  ): unknown {
    const currentItem = collectionItem.currentItem;
    if (!currentItem) {
      em.logError(`Current item is missing for collection: ${collectionId}`);
      return '';
    }

    if (currentItem.type === DataVariableType) {
      const resolvedPath = currentItem.path ? `${currentItem.path}.${path}` : path;
      return { type: DataVariableType, path: resolvedPath };
    }

    if (path && !(currentItem as any)[path]) {
      em.logError(`Path not found in current item: ${path} for collection: ${collectionId}`);
      return '';
    }

    return path ? (currentItem as any)[path] : currentItem;
  }
}
