define(['backbone', './PropertiesView', 'text!./../templates/sector.html'],
  function (Backbone, PropertiesView, sectorTemplate) {
  /**
   * @class SectorView
   * */
  return Backbone.View.extend({

    template: _.template(sectorTemplate),

    events:{},

    initialize: function(o) {
      this.config = o.config || {};
      this.pfx = this.config.stylePrefix || '';
      this.target = o.target || {};
      this.propTarget = o.propTarget || {};
      this.open = this.model.get('open');
      this.caretR = 'fa-caret-right';
      this.caretD = 'fa-caret-down';
      this.listenTo(this.model, 'change:open', this.updateOpen);
      this.listenTo(this.model, 'updateVisibility', this.updateVisibility);
      this.events['click .' + this.pfx + 'title']  = 'toggle';
      this.delegateEvents();
    },

    /**
     * If all properties are hidden this will hide the sector
     */
    updateVisibility: function () {
      var show;
      this.model.get('properties').each(function(prop) {
        if (prop.get('visible'))
          show = 1;
      });
      this.el.style.display = show ? 'block' : 'none';
    },

    /**
     * Update visibility
     */
    updateOpen: function()
    {
      if(this.model.get('open'))
        this.show();
      else
        this.hide();
    },

    /**
     * Show the content of the sector
     * */
    show : function()
    {
      this.$el.addClass(this.pfx + "open");
      this.$el.find('.' + this.pfx + 'properties').show();
      this.$caret.removeClass(this.caretR).addClass(this.caretD);
    },

    /**
     * Hide the content of the sector
     * */
    hide : function()
    {
      this.$el.removeClass(this.pfx + "open");
      this.$el.find('.' + this.pfx + 'properties').hide();
      this.$caret.removeClass(this.caretD).addClass(this.caretR);
    },

    /**
     * Toggle visibility
     * */
    toggle: function()
    {
      var v = this.model.get('open') ? 0 : 1;
      this.model.set('open', v);
    },

    render : function()
    {
      this.$el.html(this.template({
        pfx: this.pfx,
        label: this.model.get('name'),
      }));
      this.$caret  = this.$el.find('#' + this.pfx + 'caret');
      this.renderProperties();
      this.$el.attr('class', this.pfx + 'sector no-select');
      this.updateOpen();
      return this;
    },

    renderProperties: function()
    {
      var objs = this.model.get('properties');

      if(objs){
        var view = new PropertiesView({
          collection: objs,
          target: this.target,
          propTarget: this.propTarget,
          config: this.config,
        });
        this.$el.append(view.render().el);
      }
    },
  });
});
