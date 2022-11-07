import { Model } from '../../common';

export default class ToolbarButton extends Model {
  defaults() {
    return {
      command: '',
      attributes: {},
    };
  }
}
