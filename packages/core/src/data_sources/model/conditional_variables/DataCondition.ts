import { NumberOperation } from './operators/NumberOperator';
import { StringOperation } from './operators/StringOperations';
import { GenericOperation } from './operators/GenericOperator';
import { Model } from '../../../common';
import { LogicalOperation } from './operators/LogicalOperator';
import DynamicVariableListenerManager from '../DataVariableListenerManager';
import EditorModel from '../../../editor/model/Editor';
import { Condition } from './Condition';
import DataVariable from '../DataVariable';
import { evaluateVariable, isDataVariable } from '../utils';

export const ConditionalVariableType = 'conditional-variable';
export type Expression = {
  left: any;
  operator: GenericOperation | StringOperation | NumberOperation;
  right: any;
};

export type LogicGroup = {
  logicalOperator: LogicalOperation;
  statements: (Expression | LogicGroup | boolean)[];
};

export class DataCondition extends Model {
  lastEvaluationResult: boolean;
  private condition: Condition;
  private em: EditorModel;
  private variableListeners: DynamicVariableListenerManager[] = [];
  private _onValueChange?: () => void;

  defaults() {
    return {
      type: ConditionalVariableType,
      condition: false,
    };
  }

  constructor(
    condition: Expression | LogicGroup | boolean,
    private _ifTrue: any,
    private _ifFalse: any,
    opts: { em: EditorModel; onValueChange?: () => void },
  ) {
    if (typeof condition === 'undefined') {
      throw new MissingConditionError();
    }

    super();
    this.condition = new Condition(condition, { em: opts.em });
    this.em = opts.em;
    this.lastEvaluationResult = this.evaluate();
    this.listenToDataVariables();
    this._onValueChange = opts.onValueChange;
  }

  evaluate() {
    return this.condition.evaluate();
  }

  getDataValue(): any {
    return this.lastEvaluationResult
      ? evaluateVariable(this._ifTrue, this.em)
      : evaluateVariable(this._ifFalse, this.em);
  }

  reevaluate(): void {
    this.lastEvaluationResult = this.evaluate();
  }

  set ifFalse(newValue: any) {
    this._ifFalse = newValue;
  }

  set ifTrue(newValue: any) {
    this._ifTrue = newValue;
  }

  set onValueChange(newFunction: () => void) {
    this._onValueChange = newFunction;
    this.listenToDataVariables();
  }

  private listenToDataVariables() {
    if (!this.em || !this._onValueChange) return;

    // Clear previous listeners to avoid memory leaks
    this.cleanupListeners();

    const dataVariables = this.getDependentDataVariables();

    dataVariables.forEach((variable) => {
      const variableInstance = new DataVariable(variable, { em: this.em });
      const listener = new DynamicVariableListenerManager({
        model: this as any,
        em: this.em!,
        dataVariable: variableInstance,
        updateValueFromDataVariable: this._onValueChange!,
      });

      this.variableListeners.push(listener);
    });
  }

  getDependentDataVariables() {
    const dataVariables = this.condition.getDataVariables();
    if (isDataVariable(this._ifTrue)) dataVariables.push(this._ifTrue);
    if (isDataVariable(this._ifFalse)) dataVariables.push(this._ifFalse);

    return dataVariables;
  }

  private cleanupListeners() {
    this.variableListeners.forEach((listener) => listener.destroy());
    this.variableListeners = [];
  }
}
export class MissingConditionError extends Error {
  constructor() {
    super('No condition was provided to a conditional component.');
  }
}
