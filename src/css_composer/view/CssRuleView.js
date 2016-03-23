define(['backbone'],
  function (Backbone) {
  /**
   * @class CssRuleView
   * */
  return Backbone.View.extend({

    tagName: 'style',

    initialize: function(o) {
      this.config = o.config || {};
      this.listenTo(this.model, 'change:style', this.render);
    },

    /**
     * Returns string of selectors
     *
     * @return {String}
     */
    renderSelectors: function(){
      var sel = [];
      this.model.get('selectors').each(function(m){
        sel.push('.' + m.get('name'));
      });
      return sel.join('');
    },

    /**
     * Returns string of properties
     *
     * @return {String}
     */
    renderProperties: function(){
      var sel = [],
        props = this.model.get('style');
      for (var prop in props){
        sel.push(prop + ':' + props[prop] + ';');
      }
      return sel.join('');
    },

    render : function(){
      var block = '',
          o = '';
      if(!this.selStr)
        this.selStr = this.renderSelectors();
      var prpStr = this.renderProperties();
      if(this.selStr)
        block = prpStr !== '' ? '{' + prpStr + '}' : '';
      o = this.selStr && block ? this.selStr + block : '';
      this.$el.html(o);
      return this;
    },

  });
});
