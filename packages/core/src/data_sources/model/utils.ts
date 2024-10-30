import EditorModel from '../../editor/model/Editor';
import { ConditionalVariableType } from './conditional_variables/DataCondition';
import DataVariable, { DataVariableType } from './DataVariable';

export function isDataVariable(variable: any) {
  return variable?.type === DataVariableType;
}

export function isDataCondition(variable: any) {
  return variable?.type === ConditionalVariableType;
}

export function evaluateVariable(variable: any, em: EditorModel) {
  return isDataVariable(variable) ? new DataVariable(variable, { em }).getDataValue() : variable;
}
