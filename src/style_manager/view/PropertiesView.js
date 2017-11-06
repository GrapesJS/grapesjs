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
    const coll = this.collection;
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset', this.render);
  },


  addTo(model) {
    this.add(model);
  },


  add(model, frag) {
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

    if (model.get('type') != 'composite') {
      view.customValue = this.customValue;
    }

    view.render();
    const el = view.el;

    if (frag) {
      frag.appendChild(el);
    } else {
      this.el.appendChild(el);
    }
  },


  render() {
    const fragment = document.createDocumentFragment();
    this.collection.each(model => this.add(model, fragment));
    this.$el.append(fragment);
    this.$el.attr('class', `${this.pfx}properties`);
    return this;
  }
});
