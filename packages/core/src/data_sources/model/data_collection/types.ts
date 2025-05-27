import { DataCollectionType, keyCollectionDefinition } from './constants';
import { ComponentDefinition } from '../../../dom_components/model/types';
import { DataVariableProps } from '../DataVariable';

export type DataCollectionDataSource = DataVariableProps;

export enum DataCollectionStateType {
  currentIndex = 'currentIndex',
  startIndex = 'startIndex',
  currentItem = 'currentItem',
  currentKey = 'currentKey',
  endIndex = 'endIndex',
  collectionId = 'collectionId',
  totalItems = 'totalItems',
  remainingItems = 'remainingItems',
}

export interface DataCollectionState {
  [DataCollectionStateType.currentIndex]: number;
  [DataCollectionStateType.startIndex]: number;
  [DataCollectionStateType.currentItem]: DataVariableProps;
  [DataCollectionStateType.currentKey]: string | number;
  [DataCollectionStateType.endIndex]: number;
  [DataCollectionStateType.collectionId]: string;
  [DataCollectionStateType.totalItems]: number;
  [DataCollectionStateType.remainingItems]: number;
}

export interface DataCollectionStateMap {
  [key: string]: DataCollectionState;
}

export interface ComponentDataCollectionProps extends ComponentDefinition {
  type: typeof DataCollectionType;
  [keyCollectionDefinition]: DataCollectionProps;
}

export interface DataCollectionProps {
  collectionId: string;
  startIndex?: number;
  endIndex?: number;
  dataSource: DataCollectionDataSource;
}
