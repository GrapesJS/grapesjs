var BlockView = require('./BlockView');
var CategorizableView = require('domain_abstract/view/CategorizableView');

module.exports = CategorizableView.extend({

  categorizableView: BlockView,
  categorizableType: 'block',

  initialize(opts, config) {
    CategorizableView.prototype.initialize.apply(this, arguments);
    _.bindAll(this, 'getSorter', 'onDrag', 'onDrop');
    this.em = this.config.em;
    this.tac = 'test-tac';
    this.grabbingCls = this.ppfx + 'grabbing';

    if(this.em){
      this.config.getSorter = this.getSorter;
      this.canvas = this.em.get('Canvas');
    }
  },

  /**
   * Get sorter
   * @private
   */
  getSorter() {
    if(!this.em)
      return;
    if(!this.sorter){
      var utils = this.em.get('Utils');
      var canvas = this.canvas;
      this.sorter = new utils.Sorter({
        container: canvas.getBody(),
        placer: canvas.getPlacerEl(),
        containerSel: '*',
        itemSel: '*',
        pfx: this.ppfx,
        onStart: this.onDrag,
        onEndMove: this.onDrop,
        onMove: this.onMove,
        document: canvas.getFrameEl().contentDocument,
        direction: 'a',
        wmargin: 1,
        nested: 1,
        em: this.em,
        canvasRelative: 1,
      });
    }
    return this.sorter;
  },

  /**
   * Callback when block is on drag
   * @private
   */
  onDrag(e) {
    this.em.stopDefault();
    this.em.trigger('block:drag:start', e);
  },

  onMove(e) {
    this.em.trigger('block:drag:move', e);
  },

  /**
   * Callback when block is dropped
   * @private
   */
  onDrop(model) {
    const em = this.em;
    em.runDefault();

    if (model && model.get) {
      if(model.get('activeOnRender')) {
        model.trigger('active');
        model.set('activeOnRender', 0);
      }

      em.trigger('block:drag:stop', model);
    }
  },

});
