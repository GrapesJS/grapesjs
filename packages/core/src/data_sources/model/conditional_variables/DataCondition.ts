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

export const DataConditionType = 'conditional-variable';
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
  private conditionResult: boolean;
  private condition: Condition;
  private em: EditorModel;
  private variableListeners: DynamicVariableListenerManager[] = [];
  private _onValueChange?: () => void;

  defaults() {
    return {
      type: DataConditionType,
      condition: false,
    };
  }

  constructor(
    condition: Expression | LogicGroup | boolean,
    private ifTrue: any,
    private ifFalse: any,
    opts: { em: EditorModel; onValueChange?: () => void },
  ) {
    if (!condition) {
      throw new MissingConditionError();
    }

    super();
    this.condition = new Condition(condition, { em: opts.em });
    this.em = opts.em;
    this.conditionResult = this.evaluate();
    this.listenToDataVariables();
    this._onValueChange = opts.onValueChange;
  }

  evaluate() {
    return this.condition.evaluate();
  }

  getDataValue(): any {
    return this.conditionResult ? evaluateVariable(this.ifTrue, this.em) : evaluateVariable(this.ifFalse, this.em);
  }

  reevaluate(): void {
    this.conditionResult = this.evaluate();
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
    if (isDataVariable(this.ifTrue)) dataVariables.push(this.ifTrue);
    if (isDataVariable(this.ifFalse)) dataVariables.push(this.ifFalse);

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

