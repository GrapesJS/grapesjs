import Backbone from 'backbone';
import Button from './Button';

export default Backbone.Collection.extend({
  model: Button,

  /**
   * Deactivate all buttons, except one passed
   * @param  {Object}  except  Model to ignore
   * @param  {Boolean}  r     Recursive flag
   *
   * @return  void
   * */
  deactivateAllExceptOne(except, r) {
    this.forEach((model, index) => {
      if (model !== except) {
        model.set('active', false);
        if (r && model.get('buttons').length)
          model.get('buttons').deactivateAllExceptOne(except, r);
      }
    });
  },

  /**
   * Deactivate all buttons
   * @param  {String}  ctx Context string
   *
   * @return  void
   * */
  deactivateAll(ctx, sender) {
    const context = ctx || '';
    this.forEach(model => {
      if (model.get('context') == context && model !== sender) {
        model.set('active', false, { silent: 1 });
        model.trigger('updateActive', { fromCollection: 1 });
      }
    });
  },

  /**
   * Disables all buttons
   * @param  {String}  ctx Context string
   *
   * @return  void
   * */
  disableAllButtons(ctx) {
    var context = ctx || '';
    this.forEach((model, index) => {
      if (model.get('context') == context) {
        model.set('disable', true);
      }
    });
  },

  /**
   * Disables all buttons, except one passed
   * @param  {Object}  except  Model to ignore
   * @param  {Boolean}  r     Recursive flag
   *
   * @return  void
   * */
  disableAllButtonsExceptOne(except, r) {
    this.forEach((model, index) => {
      if (model !== except) {
        model.set('disable', true);
        if (r && model.get('buttons').length)
          model.get('buttons').disableAllButtonsExceptOne(except, r);
      }
    });
  }
});
