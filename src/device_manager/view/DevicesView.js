define(['backbone', 'text!./../template/devices.html'],
function(Backbone, devicesTemplate) {

  return Backbone.View.extend({

    template: _.template(devicesTemplate),

    events: {
      'change': 'updateDevice'
    },

    initialize: function(o) {
      this.config = o.config || {};
      this.ppfx = this.config.pStylePrefix || '';
      this.events['click .' + this.ppfx + 'add-trasp'] = this.startAdd;
      this.delegateEvents();
    },

    /**
     * Start adding new device
     * @return {[type]} [description]
     */
    startAdd: function(){
      console.log('start new device');
    },

    /**
     * Update device of the editor
     * @private
     */
    updateDevice: function(){
      var em = this.config.em;
      if(em){
        var devEl = this.devicesEl;
        var val = devEl ? devEl.val() : '';
        em.set('device', val);
      }
    },

    /**
     * Return devices options
     * @return {string} String of options
     * @private
     */
    getOptions: function(){
      var result = '';
      this.collection.each(function(device){
        var name = device.get('name');
        result += '<option value="' + name+ '">' + name + '</option>';
      });
      return result;
    },

    render: function() {
      var pfx = this.ppfx;
      this.$el.html(this.template({ ppfx: pfx }));
      this.devicesEl = this.$el.find('.' + pfx + 'devices');
      this.devicesEl.append(this.getOptions());
      this.el.className = pfx + 'devices-c';
      return this;
    },

  });
});