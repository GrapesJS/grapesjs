import { CommandFunction } from '../../commands/view/CommandAbstract';
import { Model, ObjectAny } from '../../common';

export interface ToolbarButtonProps {
  /**
   * Command name.
   */
  command: CommandFunction | string;

  /**
   * Button label.
   */
  label?: string;

  id?: string;
  attributes?: ObjectAny;
  events?: ObjectAny;
}

export default class ToolbarButton extends Model<ToolbarButtonProps> {
  defaults() {
    return {
      command: '',
      attributes: {},
    };
  }
}
