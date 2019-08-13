import Backbone from 'backbone';
import TypeableCollection from 'domain_abstract/model/TypeableCollection';
import Property from './Property';
import PropertyStack from './PropertyStack';
import PropertyStackView from './../view/PropertyStackView';
import PropertyComposite from './PropertyComposite';
import PropertyCompositeView from './../view/PropertyCompositeView';
import PropertyFileView from './../view/PropertyFileView';
import PropertyColorView from './../view/PropertyColorView';
import PropertySelect from './PropertySelect';
import PropertySelectView from './../view/PropertySelectView';
import PropertyRadio from './PropertyRadio';
import PropertyRadioView from './../view/PropertyRadioView';
import PropertySlider from './PropertySlider';
import PropertySliderView from './../view/PropertySliderView';
import PropertyInteger from './PropertyInteger';
import PropertyIntegerView from './../view/PropertyIntegerView';
import PropertyView from './../view/PropertyView';

export default Backbone.Collection.extend(TypeableCollection).extend({
  types: [
    {
      id: 'stack',
      model: PropertyStack,
      view: PropertyStackView,
      isType(value) {
        if (value && value.type == 'stack') {
          return value;
        }
      }
    },
    {
      id: 'composite',
      model: PropertyComposite,
      view: PropertyCompositeView,
      isType(value) {
        if (value && value.type == 'composite') {
          return value;
        }
      }
    },
    {
      id: 'file',
      model: Property,
      view: PropertyFileView,
      isType(value) {
        if (value && value.type == 'file') {
          return value;
        }
      }
    },
    {
      id: 'color',
      model: Property,
      view: PropertyColorView,
      isType(value) {
        if (value && value.type == 'color') {
          return value;
        }
      }
    },
    {
      id: 'select',
      model: PropertySelect,
      view: PropertySelectView,
      isType(value) {
        if (value && value.type == 'select') {
          return value;
        }
      }
    },
    {
      id: 'radio',
      model: PropertyRadio,
      view: PropertyRadioView,
      isType(value) {
        if (value && value.type == 'radio') {
          return value;
        }
      }
    },
    {
      id: 'slider',
      model: PropertySlider,
      view: PropertySliderView,
      isType(value) {
        if (value && value.type == 'slider') {
          return value;
        }
      }
    },
    {
      id: 'integer',
      model: PropertyInteger,
      view: PropertyIntegerView,
      isType(value) {
        if (value && value.type == 'integer') {
          return value;
        }
      }
    },
    {
      id: 'base',
      model: Property,
      view: PropertyView,
      isType(value) {
        value.type = 'base';
        return value;
      }
    }
  ],

  deepClone() {
    const collection = this.clone();
    collection.reset(
      collection.map(model => {
        const cloned = model.clone();
        cloned.typeView = model.typeView;
        return cloned;
      })
    );
    return collection;
  },

  /**
   * Parse a value and return an array splitted by properties
   * @param  {string} value
   * @return {Array}
   * @return
   */
  parseValue(value) {
    const properties = [];
    const values = value.split(' ');
    values.forEach((value, i) => {
      const property = this.at(i);
      if (!property) return;
      properties.push({ ...property.attributes, ...{ value } });
    });
    return properties;
  },

  getFullValue() {
    let result = '';
    this.each(model => (result += `${model.getFullValue()} `));
    return result.trim();
  }
});
