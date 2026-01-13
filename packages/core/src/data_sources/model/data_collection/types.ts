import { ObjectAny } from '../../../common';
import { ComponentDefinition } from '../../../dom_components/model/types';
import { DataComponentTypes } from '../../types';
import { DataVariableProps } from '../DataVariable';
import { keyCollectionDefinition } from './constants';

export type DataCollectionDataSource = DataVariableProps;

export enum DataCollectionStateType {
  currentIndex = 'currentIndex',
  startIndex = 'startIndex',
  prevItem = 'prevItem',
  currentItem = 'currentItem',
  nextItem = 'nextItem',
  currentKey = 'currentKey',
  endIndex = 'endIndex',
  collectionId = 'collectionId',
  totalItems = 'totalItems',
  remainingItems = 'remainingItems',
}

export interface DataCollectionState {
  [DataCollectionStateType.currentIndex]: number;
  [DataCollectionStateType.startIndex]: number;
  [DataCollectionStateType.prevItem]?: DataVariableProps;
  [DataCollectionStateType.currentItem]: DataVariableProps;
  [DataCollectionStateType.nextItem]?: DataVariableProps;
  [DataCollectionStateType.currentKey]: string | number;
  [DataCollectionStateType.endIndex]: number;
  [DataCollectionStateType.collectionId]: string;
  [DataCollectionStateType.totalItems]: number;
  [DataCollectionStateType.remainingItems]: number;
}

export type RootDataType = Array<ObjectAny> | ObjectAny;

export interface DataCollectionStateMap {
  [key: string]: DataCollectionState | RootDataType | undefined;
  rootData?: RootDataType;
}

export interface ComponentDataCollectionProps extends ComponentDefinition {
  type: `${DataComponentTypes.collection}`;
  [keyCollectionDefinition]: DataCollectionProps;
}

export interface DataCollectionProps {
  collectionId: string;
  startIndex?: number;
  endIndex?: number;
  dataSource: DataCollectionDataSource;
}
