import TypeableCollection from 'domain_abstract/model/TypeableCollection';
const Property = require('./Property');

module.exports = require('backbone')
  .Collection.extend(TypeableCollection)
  .extend({
    types: [
      {
        id: 'stack',
        model: require('./PropertyStack'),
        view: require('./../view/PropertyStackView'),
        isType(value) {
          if (value && value.type == 'stack') {
            return value;
          }
        }
      },
      {
        id: 'composite',
        model: require('./PropertyComposite'),
        view: require('./../view/PropertyCompositeView'),
        isType(value) {
          if (value && value.type == 'composite') {
            return value;
          }
        }
      },
      {
        id: 'file',
        model: Property,
        view: require('./../view/PropertyFileView'),
        isType(value) {
          if (value && value.type == 'file') {
            return value;
          }
        }
      },
      {
        id: 'color',
        model: Property,
        view: require('./../view/PropertyColorView'),
        isType(value) {
          if (value && value.type == 'color') {
            return value;
          }
        }
      },
      {
        id: 'select',
        model: require('./PropertyRadio'),
        view: require('./../view/PropertySelectView'),
        isType(value) {
          if (value && value.type == 'select') {
            return value;
          }
        }
      },
      {
        id: 'radio',
        model: require('./PropertyRadio'),
        view: require('./../view/PropertyRadioView'),
        isType(value) {
          if (value && value.type == 'radio') {
            return value;
          }
        }
      },
      {
        id: 'slider',
        model: require('./PropertySlider'),
        view: require('./../view/PropertySliderView'),
        isType(value) {
          if (value && value.type == 'slider') {
            return value;
          }
        }
      },
      {
        id: 'integer',
        model: require('./PropertyInteger'),
        view: require('./../view/PropertyIntegerView'),
        isType(value) {
          if (value && value.type == 'integer') {
            return value;
          }
        }
      },
      {
        id: 'base',
        model: Property,
        view: require('./../view/PropertyView'),
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
