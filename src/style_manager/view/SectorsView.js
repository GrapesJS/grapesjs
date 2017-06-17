var Backbone = require('backbone');
var SectorView = require('./SectorView');

module.exports = Backbone.View.extend({

  initialize(o) {
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix || '';
    this.target = o.target || {};

    // The taget that will emit events for properties
    this.propTarget   = {};
    _.extend(this.propTarget, Backbone.Events);
    this.listenTo( this.collection, 'add', this.addTo);
    this.listenTo( this.collection, 'reset', this.render);
    this.listenTo( this.target, 'change:selectedComponent targetClassAdded targetClassRemoved targetClassUpdated ' +
      'targetStateUpdated targetStyleUpdated change:device', this.targetUpdated);

  },

  /**
   * Add to collection
   * @param {Object} model Model
   * @return {Object}
   * @private
   * */
  addTo(model) {
    this.addToCollection(model);
  },

  /**
   * Fired when target is updated
   * @private
   */
  targetUpdated() {
    var em = this.target;
    var el = em.get('selectedComponent');

    if(!el)
      return;

    const config = em.get('Config');
    var previewMode = config.devicePreviewMode;
    var classes = el.get('classes');
    var pt = this.propTarget;
    var device = em.getDeviceModel();
    var state = !previewMode ? el.get('state') : '';
    var widthMedia = device && device.get('widthMedia');
    var mediaText = device && !previewMode && widthMedia ?
      `(${config.mediaCondition}: ${widthMedia})` : '';
    pt.helper = null;

    if(classes.length){
      var cssC = em.get('CssComposer');
      var valid = _.filter(classes.models, item => item.get('active'));
      var iContainer = cssC.get(valid, state, mediaText);

      if(!iContainer){
        iContainer = cssC.add(valid, state, mediaText);
        // Get styles from the component
        iContainer.set('style', el.get('style'));
        //cssC.addRule(iContainer);
        el.set('style', {});
      }else{
        // Ensure to clean element
        //if(classes.length == 1)
          //el.set('style', {});
      }

      // If the state is not empty, there should be a helper rule in play
      // The helper rule will get the same style of the iContainer
      if(state){
        var clm = em.get('SelectorManager');
        var helperClass = clm.add('hc-state');
        var helperRule = cssC.get([helperClass]);
        if(!helperRule)
          helperRule = cssC.add([helperClass]);
        else{
          // I will make it last again, otherwise it could be overridden
          cssC.getAll().remove(helperRule);
          cssC.getAll().add(helperRule);
        }
        helperRule.set('style', iContainer.get('style'));
        pt.helper = helperRule;
      }

      pt.model = iContainer;
      pt.trigger('update');
      return;
    }

    pt.model = el;
    pt.trigger('update');
  },


  /**
   * Add new object to collection
   * @param {Object} model Model
   * @param  {Object} fragmentEl collection
   * @return {Object} Object created
   * @private
   * */
  addToCollection(model, fragmentEl) {
    var fragment = fragmentEl || null;
    var viewObject = SectorView;

    var view = new viewObject({
      model,
      id: this.pfx + model.get('name').replace(' ','_').toLowerCase(),
      name: model.get('name'),
      properties: model.get('properties'),
      target: this.target,
      propTarget: this.propTarget,
      config: this.config,
    });
    var rendered = view.render().el;

    if(fragment){
      fragment.appendChild(rendered);
    }else{
      this.$el.append(rendered);
    }

    return rendered;
  },

  render() {
    var fragment = document.createDocumentFragment();
    this.$el.empty();

    this.collection.each(function(model){
      this.addToCollection(model, fragment);
    }, this);

    this.$el.attr('id', this.pfx + 'sectors');
    this.$el.append(fragment);
    return this;
  }
});
