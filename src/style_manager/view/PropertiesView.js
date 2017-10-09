const PropertyView = require('./PropertyView');
const PropertyIntegerView = require('./PropertyIntegerView');
const PropertyRadioView = require('./PropertyRadioView');
const PropertySelectView = require('./PropertySelectView');
const PropertyColorView = require('./PropertyColorView');
const PropertyFileView = require('./PropertyFileView');
const PropertyCompositeView = require('./PropertyCompositeView');
const PropertyStackView = require('./PropertyStackView');

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
    this.$el.attr('class', this.pfx + 'properties');
    return this;
  }
});
