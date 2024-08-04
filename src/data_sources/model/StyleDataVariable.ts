import { Model, ObjectAny } from '../../common';
export const type = 'data-variable-css';

interface StyleDataVariableProps extends ObjectAny {
  type: string;
  path: string;
  value: string;
}

export default class StyleDataVariable<T extends StyleDataVariableProps = StyleDataVariableProps> extends Model<T> {
  constructor(props: T, opts = {}) {
    super(props, opts);
  }
}
