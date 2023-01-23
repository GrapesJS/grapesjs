import { Collection } from '../../common';
import TypeableCollection from '../../domain_abstract/model/TypeableCollection';
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
import PropertyNumber from './PropertyNumber';
import PropertyNumberView from './../view/PropertyNumberView';
import PropertyView from './../view/PropertyView';

const TypeableCollectionExt = Collection.extend(TypeableCollection);

const Properties = TypeableCollectionExt.extend({
  extendViewApi: 1,

  init() {
    const { opts, em } = this;
    const sm = opts.module || em?.get('StyleManager');
    if (sm) {
      sm.__listenAdd(this, sm.events.propertyAdd);
      sm.__listenRemove(this, sm.events.propertyRemove);
    }
  },

  types: [
    {
      id: 'stack',
      model: PropertyStack,
      view: PropertyStackView,
      isType(value: any) {
        if (value && value.type == 'stack') {
          return value;
        }
      },
    },
    {
      id: 'composite',
      model: PropertyComposite,
      view: PropertyCompositeView,
      isType(value: any) {
        if (value && value.type == 'composite') {
          return value;
        }
      },
    },
    {
      id: 'file',
      model: Property,
      view: PropertyFileView,
      isType(value: any) {
        if (value && value.type == 'file') {
          return value;
        }
      },
    },
    {
      id: 'color',
      model: Property,
      view: PropertyColorView,
      isType(value: any) {
        if (value && value.type == 'color') {
          return value;
        }
      },
    },
    {
      id: 'select',
      model: PropertySelect,
      view: PropertySelectView,
      isType(value: any) {
        if (value && value.type == 'select') {
          return value;
        }
      },
    },
    {
      id: 'radio',
      model: PropertyRadio,
      view: PropertyRadioView,
      isType(value: any) {
        if (value && value.type == 'radio') {
          return value;
        }
      },
    },
    {
      id: 'slider',
      model: PropertySlider,
      view: PropertySliderView,
      isType(value: any) {
        if (value && value.type == 'slider') {
          return value;
        }
      },
    },
    {
      id: 'integer',
      model: PropertyNumber,
      view: PropertyNumberView,
      isType(value: any) {
        if (value && value.type == 'integer') {
          return value;
        }
      },
    },
    {
      id: 'number',
      model: PropertyNumber,
      view: PropertyNumberView,
      isType(value: any) {
        if (value && value.type == 'number') {
          return value;
        }
      },
    },
    {
      id: 'base',
      model: Property,
      view: PropertyView,
      isType(value: any) {
        value.type = 'base';
        return value;
      },
    },
  ],
});

export default Properties;
