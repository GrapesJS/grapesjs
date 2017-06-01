var Backbone = require('backbone');
var PropertyView = require('./PropertyView');
var PropertyIntegerView = require('./PropertyIntegerView');
var PropertyRadioView = require('./PropertyRadioView');
var PropertySelectView = require('./PropertySelectView');
var PropertyColorView = require('./PropertyColorView');
var PropertyFileView = require('./PropertyFileView');
var PropertyCompositeView = require('./PropertyCompositeView');
var PropertyStackView = require('./PropertyStackView');

module.exports = Backbone.View.extend({

  initialize(o) {
    this.config     = o.config || {};
    this.pfx       = this.config.stylePrefix || '';
    this.target      = o.target || {};
    this.propTarget = o.propTarget || {};
    this.onChange    = o.onChange || {};
    this.onInputRender  = o.onInputRender || {};
    this.customValue  = o.customValue || {};
  },

  render() {
    var fragment = document.createDocumentFragment();

    this.collection.each(function(model){
      var objView  = PropertyView;

      switch(model.get('type')){
        case 'integer':
          objView  = PropertyIntegerView;   break;
        case 'radio':
          objView  = PropertyRadioView;  break;
        case 'select':
          objView  = PropertySelectView;  break;
        case 'color':
          objView  = PropertyColorView;  break;
        case 'file':
          objView  = PropertyFileView;    break;
        case 'composite':
          objView  = PropertyCompositeView;break;
        case 'stack':
          objView  = PropertyStackView;  break;
      }

      var view = new objView({
        model,
        name: model.get('name'),
        id: this.pfx + model.get('property'),
        target: this.target,
        propTarget: this.propTarget,
        onChange: this.onChange,
        onInputRender: this.onInputRender,
        config: this.config,
      });

      if(model.get('type') != 'composite'){
        view.customValue = this.customValue;
      }

      fragment.appendChild(view.render().el);
    },this);

    this.$el.append(fragment);
    this.$el.append($('<div>', {class: "clear"}));
    this.$el.attr('class', this.pfx + 'properties');
    return this;
  }
});
