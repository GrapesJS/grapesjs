import { template } from 'underscore';
import Backbone from 'backbone';

const $ = Backbone.$;

export default Backbone.View.extend({
  template: template(`<div> </div>`),

  events: {
    change: 'handleChange'
  },

  initialize(o = {}) {
    console.log('Trait Search initialized');
    this.traits = o.traits ? o.traits : [];
    this.tv = o.traitsView;
    this.inputEl = $('<input type="text">');
  },

  handleChange(e) {
    e.stopPropagation();
    console.log(e);
    console.log(this.traits);
    const inputEl = this.inputEl.get(0);
    const value = inputEl.value;
    var index = 1;
    this.traits.models.forEach(element => {
      self = this;
      if (!new String(element.attributes['name']).includes(value)) {
        element.attributes.visible = false;
      } else {
        element.attributes.visible = true;
      }

      if (index >= self.traits.models.length) {
        self.tv.trigger('updateComps', self.traits);
      } else {
        index++;
      }
    });
  },

  render() {
    const { em, el, $el, model } = this;
    el.innerHTML = this.template({
      pfx: ''
    });
    el.children[0].append(this.inputEl.get(0));
    return this;
  }
});
