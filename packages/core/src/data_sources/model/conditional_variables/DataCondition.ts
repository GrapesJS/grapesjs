import { Model } from '../../../common';
import EditorModel from '../../../editor/model/Editor';
import DataVariable, { DataVariableProps } from '../DataVariable';
import DataResolverListener from '../DataResolverListener';
import { resolveDynamicValue, isDataVariable } from '../../utils';
import { DataConditionEvaluator, ConditionProps } from './DataConditionEvaluator';
import { AnyTypeOperation } from './operators/AnyTypeOperator';
import { BooleanOperation } from './operators/BooleanOperator';
import { NumberOperation } from './operators/NumberOperator';
import { StringOperation } from './operators/StringOperator';
import { isUndefined } from 'underscore';
import { DataCollectionStateMap } from '../data_collection/types';

export const DataConditionType = 'data-condition' as const;
export const DataConditionEvaluationChangedEvent = 'data-condition-evaluation-changed';
export const DataConditionOutputChangedEvent = 'data-condition-output-changed';

export interface ExpressionProps {
  left?: any;
  operator?: AnyTypeOperation | StringOperation | NumberOperation;
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

  constructor(props: DataConditionProps, opts: { em: EditorModel; onValueChange?: () => void }) {
    if (isUndefined(props.condition)) {
      opts.em.logError('No condition was provided to a conditional component.');
    }

    super(props, opts);
    this.em = opts.em;

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

  setCondition(condition: ConditionProps) {
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
    const ifTrue = this.getIfTrue();
    const ifFalse = this.getIfFalse();

    const isConditionTrue = this.isTrue();
    if (skipDynamicValueResolution) {
      return isConditionTrue ? ifTrue : ifFalse;
    }

    return isConditionTrue ? resolveDynamicValue(ifTrue, this.em) : resolveDynamicValue(ifFalse, this.em);
  }

  resolvesFromCollection() {
    return false;
  }

  updateCollectionsStateMap(collectionsStateMap: DataCollectionStateMap) {
    this.collectionsStateMap = collectionsStateMap;
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
