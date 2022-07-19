import PanelManager from '..';
import { Collection } from '../../abstract';
import Button from './Button';

export default class Buttons extends Collection<Button> {
  constructor(module: PanelManager, models: Button[]) {
    super(module, models, Button);
  }
  /**
   * Deactivate all buttons, except one passed
   * @param  {Object}  except  Model to ignore
   * @param  {Boolean}  r     Recursive flag
   *
   * @return  void
   * */
  deactivateAllExceptOne(except: Button, r: boolean) {
    this.forEach((model, index) => {
      if (model !== except) {
        model.set('active', false);
        if (r && model.get('buttons').length) model.get('buttons').deactivateAllExceptOne(except, r);
      }
    });
  }

  /**
   * Deactivate all buttons
   * @param  {String}  ctx Context string
   *
   * @return  void
   * */
  deactivateAll(ctx?: string, sender?: any) {
    const context = ctx || '';
    this.forEach(model => {
      if (model.get('context') == context && model !== sender) {
        //@ts-ignore
        model.set('active', false, { fromCollection: true });
      }
    });
  }

  /**
   * Disables all buttons
   * @param  {String}  ctx Context string
   *
   * @return  void
   * */
  disableAllButtons(ctx?: string) {
    var context = ctx || '';
    this.forEach((model, index) => {
      if (model.get('context') == context) {
        model.set('disable', true);
      }
    });
  }

  /**
   * Disables all buttons, except one passed
   * @param  {Object}  except  Model to ignore
   * @param  {Boolean}  r     Recursive flag
   *
   * @return  void
   * */
  disableAllButtonsExceptOne(except: Button, r: boolean) {
    this.forEach((model, index) => {
      if (model !== except) {
        model.set('disable', true);
        if (r && model.get('buttons').length) model.get('buttons').disableAllButtonsExceptOne(except, r);
      }
    });
  }
}

Buttons.prototype.model = Button;
