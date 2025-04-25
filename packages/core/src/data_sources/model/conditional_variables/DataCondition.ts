import { Model } from '../../../common';
import EditorModel from '../../../editor/model/Editor';
import { isDataVariable, valueOrResolve } from '../../utils';
import { DataCollectionStateMap } from '../data_collection/types';
import DataResolverListener from '../DataResolverListener';
import DataVariable, { DataVariableProps } from '../DataVariable';
import { ConditionProps, DataConditionEvaluator } from './DataConditionEvaluator';
import { BooleanOperation } from './operators/BooleanOperator';
import { StringOperation } from './operators/StringOperator';
import { DataConditionSimpleOperation } from './types';

export const DataConditionType = 'data-condition' as const;
export const DataConditionEvaluationChangedEvent = 'data-condition-evaluation-changed';
export const DataConditionOutputChangedEvent = 'data-condition-output-changed';

export interface ExpressionProps {
  left?: any;
  operator?: DataConditionSimpleOperation;
  right?: any;
}

export interface LogicGroupProps {
  logicalOperator: BooleanOperation;
  statements: ConditionProps[];
}

export interface DataConditionProps {
  type?: typeof DataConditionType;
  condition: ConditionProps;
  ifTrue?: any;
  ifFalse?: any;
}

type DataConditionOptions = {
  em: EditorModel;
  onValueChange?: () => void;
  collectionsStateMap?: DataCollectionStateMap;
};

export class DataCondition extends Model<DataConditionProps> {
  private em: EditorModel;
  private collectionsStateMap: DataCollectionStateMap = {};
  private resolverListeners: DataResolverListener[] = [];
  private _previousEvaluationResult: boolean | null = null;
  private _conditionEvaluator: DataConditionEvaluator;

  defaults() {
    return {
      type: DataConditionType,
      condition: {
        left: '',
        operator: StringOperation.equalsIgnoreCase,
        right: '',
      },
      ifTrue: {},
      ifFalse: {},
    };
  }

  constructor(props: DataConditionProps, opts: DataConditionOptions) {
    super(props, opts);
    this.em = opts.em;
    this.collectionsStateMap = opts.collectionsStateMap ?? {};

    const { condition = {} } = props;
    const instance = new DataConditionEvaluator({ condition }, { em: this.em });
    this._conditionEvaluator = instance;
    this.listenToDataVariables();
    this.listenToPropsChange();
  }

  getCondition(): ConditionProps {
    return this._conditionEvaluator.get('condition')!;
  }

  getIfTrue() {
    return this.get('ifTrue');
  }

  getIfFalse() {
    return this.get('ifFalse');
  }

  getOperations() {
    return this._conditionEvaluator.getOperations();
  }

  setCondition(condition: ConditionProps) {
    this.set('condition', condition);
    this._conditionEvaluator.set('condition', condition);
    this.trigger(DataConditionOutputChangedEvent, this.getDataValue());
  }

  setIfTrue(newIfTrue: any) {
    this.set('ifTrue', newIfTrue);
  }

  setIfFalse(newIfFalse: any) {
    this.set('ifFalse', newIfFalse);
  }

  isTrue(): boolean {
    return this._conditionEvaluator.evaluate();
  }

  getDataValue(skipDynamicValueResolution: boolean = false): any {
    const { em, collectionsStateMap } = this;
    const options = { em, collectionsStateMap };
    const ifTrue = this.getIfTrue();
    const ifFalse = this.getIfFalse();

    const isConditionTrue = this.isTrue();
    if (skipDynamicValueResolution) {
      return isConditionTrue ? ifTrue : ifFalse;
    }

    return isConditionTrue ? valueOrResolve(ifTrue, options) : valueOrResolve(ifFalse, options);
  }

  resolvesFromCollection() {
    return false;
  }

  updateCollectionsStateMap(collectionsStateMap: DataCollectionStateMap) {
    this.collectionsStateMap = collectionsStateMap;
    this._conditionEvaluator.updateCollectionStateMap(collectionsStateMap);
    this.listenToDataVariables();
    this.emitConditionEvaluationChange();
  }

  private listenToPropsChange() {
    this.on('change:condition', this.handleConditionChange.bind(this));
    this.on('change:condition change:ifTrue change:ifFalse', () => {
      this.listenToDataVariables();
    });
  }

  private handleConditionChange() {
    this.setCondition(this.get('condition')!);
  }

  private listenToDataVariables() {
    this.cleanupListeners();
    this.setupConditionDataVariableListeners();
    this.setupOutputDataVariableListeners();
  }

  private setupConditionDataVariableListeners() {
    this._conditionEvaluator.getDependentDataVariables().forEach((variable) => {
      this.addListener(variable, () => {
        this.emitConditionEvaluationChange();
      });
    });
  }

  private setupOutputDataVariableListeners() {
    const isConditionTrue = this.isTrue();
    this.setupOutputVariableListener(this.getIfTrue(), isConditionTrue);
    this.setupOutputVariableListener(this.getIfFalse(), !isConditionTrue);
  }

  private setupOutputVariableListener(outputVariable: any, isConditionTrue: boolean) {
    if (isDataVariable(outputVariable)) {
      this.addListener(outputVariable, () => {
        if (isConditionTrue) {
          this.trigger(DataConditionOutputChangedEvent, outputVariable);
        }
      });
    }
  }

  private addListener(variable: DataVariableProps, onUpdate: () => void) {
    const listener = new DataResolverListener({
      em: this.em,
      resolver: new DataVariable(variable, { em: this.em, collectionsStateMap: this.collectionsStateMap }),
      onUpdate,
    });

    this.resolverListeners.push(listener);
  }

  private emitConditionEvaluationChange() {
    const currentEvaluationResult = this.isTrue();
    if (this._previousEvaluationResult !== currentEvaluationResult) {
      this._previousEvaluationResult = currentEvaluationResult;
      this.trigger(DataConditionEvaluationChangedEvent, currentEvaluationResult);
      this.emitOutputValueChange();
    }
  }

  private emitOutputValueChange() {
    const currentOutputValue = this.getDataValue();
    this.trigger(DataConditionOutputChangedEvent, currentOutputValue);
  }

  private cleanupListeners() {
    this.resolverListeners.forEach((listener) => listener.destroy());
    this.resolverListeners = [];
  }

  toJSON(): DataConditionProps {
    const ifTrue = this.getIfTrue();
    const ifFalse = this.getIfFalse();

    return {
      type: DataConditionType,
      condition: this._conditionEvaluator.toJSON(),
      ifTrue,
      ifFalse,
    };
  }
}
