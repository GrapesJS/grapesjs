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
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix || '';
    this.target = o.target || {};
    this.propTarget = o.propTarget || {};
    this.onChange = o.onChange;
    this.onInputRender = o.onInputRender || {};
    this.customValue = o.customValue || {};
  },

  render() {
    var fragment = document.createDocumentFragment();

    this.collection.each((model) => {
      var view = new model.typeView({
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

      view.render();
      fragment.appendChild(view.el);
    });

    this.$el.append(fragment);
    this.$el.append($('<div>', {class: "clear"}));
    this.$el.attr('class', this.pfx + 'properties');
    return this;
  }
});
