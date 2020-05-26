import Sector from 'style_manager/model/Sector';
import Sectors from 'style_manager/model/Sectors';
import Property from 'style_manager/model/Property';
import PropertyInteger from 'style_manager/model/PropertyInteger';
import Properties from 'style_manager/model/Properties';
import Layer from 'style_manager/model/Layer';
import Layers from 'style_manager/model/Layers';
import PropertyFactory from 'style_manager/model/PropertyFactory';

describe('Sector', () => {
  var obj;
  var confToExt;

  beforeEach(() => {
    confToExt = {
      buildProps: ['display', 'float'],
      properties: [
        {
          property: 'display',
          type: 'radio'
        },
        {
          property: 'color',
          type: 'color'
        }
      ]
    };
    obj = new Sector();
  });

  afterEach(() => {
    obj = null;
  });

  test('Has id property', () => {
    expect(obj.has('id')).toEqual(true);
  });

  test('Has no properties', () => {
    expect(obj.get('properties').length).toEqual(0);
  });

  test('Init with properties', () => {
    obj = new Sector({
      properties: [{}, {}]
    });
    expect(obj.get('properties').length).toEqual(2);
  });

  test('Build properties', () => {
    var res = obj.buildProperties(['display', 'float']);
    expect(res.length).toEqual(2);
    expect(res[0]).toEqual({
      property: 'display',
      type: 'select',
      defaults: 'block',
      list: [
        { value: 'block' },
        { value: 'inline' },
        { value: 'inline-block' },
        { value: 'flex' },
        { value: 'none' }
      ]
    });
  });

  test('Extend properties', () => {
    obj = new Sector(confToExt);
    expect(obj.get('properties').length).toEqual(3);
    var prop0 = obj.get('properties').at(0);
    expect(prop0.get('type')).toEqual('radio');
    expect(prop0.get('defaults')).toEqual('block');
  });

  test('Do not extend properties', () => {
    confToExt.extendBuilded = 0;
    obj = new Sector(confToExt);
    expect(obj.get('properties').length).toEqual(3);
    var prop0 = obj.get('properties').at(0);
    expect(prop0.get('type')).toEqual('radio');
    expect(prop0.get('defaults')).toEqual('');
  });

  test('Extend composed properties', () => {
    obj = new Sector({
      buildProps: ['margin', 'float'],
      properties: [
        {
          property: 'margin',
          properties: [
            {
              name: 'Top',
              property: 'margin-top'
            },
            {
              property: 'margin-right'
            }
          ]
        }
      ]
    });
    var sectProps = obj.get('properties');
    expect(sectProps.length).toEqual(2);
    var prop0 = obj.get('properties').at(0);
    var propProps = prop0.get('properties');

    expect(propProps.length).toEqual(2);
    var propTop = propProps.at(0);
    expect(propTop.get('name')).toEqual('Top');
    expect(propTop.get('type')).toEqual('integer');
  });
});

describe('Sectors', () => {
  var obj;

  beforeEach(() => {
    obj = new Sectors();
  });

  afterEach(() => {
    obj = null;
  });

  test('Object exists', () => {
    expect(obj).toBeTruthy();
  });
});

describe('Property', () => {
  var obj;

  beforeEach(() => {
    obj = new Property();
  });

  afterEach(() => {
    obj = null;
  });

  test('Has property field', () => {
    expect(obj.has('property')).toEqual(true);
  });

  test('parseValue', () => {
    const result = { value: 'testValue' };
    expect(obj.parseValue('testValue')).toEqual(result);
  });

  test('parseValue with function but without functionName', () => {
    const result = { value: 'fn(testValue)' };
    expect(obj.parseValue('fn(testValue)')).toEqual(result);
  });

  test('parseValue with function and functionName', () => {
    obj = new Property({ functionName: 'fn' });
    const result = { value: 'testValue', functionName: 'fn' };
    expect(obj.parseValue('fn(testValue)')).toEqual(result);
    expect(obj.parseValue('fn(testValue')).toEqual(result);
  });

  test('Parse correctly a value with !important', () => {
    const result = { value: 'red', important: 1 };
    expect(obj.parseValue('red !important ')).toEqual(result);
  });

  test('getFullValue', () => {
    obj = new Property({ functionName: 'fn', value: 'red' });
    expect(obj.getFullValue()).toEqual('fn(red)');
    obj = new Property({ functionName: 'fn', value: '#123', important: 1 });
    expect(obj.getFullValue()).toEqual('fn(#123) !important');
  });
});

describe('PropertyInteger', () => {
  var obj;

  beforeEach(() => {
    obj = new PropertyInteger({ units: ['px', 'deg'] });
  });

  afterEach(() => {
    obj = null;
  });

  test('parseValue with units', () => {
    const result = { value: 20, unit: 'px' };
    expect(obj.parseValue('20px')).toEqual(result);
  });

  test('parse input value with function', () => {
    obj = new PropertyInteger({
      units: ['px', 'deg'],
      functionName: 'test'
    });
    const result = { value: 55, unit: 'deg', functionName: 'test' };
    expect(obj.parseValue('test(55deg)')).toEqual(result);
  });

  test('parse input value with min', () => {
    obj = new PropertyInteger({ units: ['px'], min: 10 });
    const result = { value: 10, unit: 'px' };
    expect(obj.parseValue('1px')).toEqual(result);
    expect(obj.parseValue('15px')).toEqual({ value: 15, unit: 'px' });
  });

  test('parse input value with max', () => {
    obj = new PropertyInteger({ units: ['px'], max: 100 });
    const result = { value: 100, unit: 'px' };
    expect(obj.parseValue('200px')).toEqual(result);
    expect(obj.parseValue('95px')).toEqual({ value: 95, unit: 'px' });
  });
});

describe('Properties', () => {
  var obj;

  beforeEach(() => {
    obj = new Properties();
  });

  afterEach(() => {
    obj = null;
  });

  test('Object exists', () => {
    expect(obj).toBeTruthy();
  });
});

describe('Layer', () => {
  var obj;
  var properties = [
    { value: 'val1', property: 'prop1' },
    { value: 'val2', property: 'prop2' },
    { value: 'val3', property: 'prop3', functionName: 'test' }
  ];

  beforeEach(() => {
    obj = new Layer();
  });

  afterEach(() => {
    obj = null;
  });

  test('Has index property', () => {
    expect(obj.has('index')).toEqual(true);
  });

  test('Is not active', () => {
    expect(obj.get('active')).toEqual(false);
  });

  test('Has no properties', () => {
    expect(obj.get('properties').length).toEqual(0);
  });

  test('Get correct values from properties', () => {
    obj = new Layer({
      properties
    });
    expect(obj.getFullValue()).toEqual('val1 val2 test(val3)');
  });

  test('Get correct value from properties', () => {
    obj = new Layer({ properties });
    expect(obj.getPropertyValue()).toEqual('');
    expect(obj.getPropertyValue('no-prop')).toEqual('');
    expect(obj.getPropertyValue('prop3')).toEqual('test(val3)');
  });
});

describe('Layers', () => {
  var obj;
  var properties = [
    { value: 'val1', property: 'prop1' },
    { value: 'val2', property: 'prop2' },
    { value: 'val3', property: 'prop3', functionName: 'test' }
  ];

  beforeEach(() => {
    obj = new Layers();
  });

  afterEach(() => {
    obj = null;
  });

  test('Object exists', () => {
    expect(obj).toBeTruthy();
  });

  test('Init index on add', () => {
    var model = obj.add({});
    expect(model.get('index')).toEqual(1);
  });

  test('Increment index', () => {
    var model = obj.add({});
    var model2 = obj.add({});
    expect(model2.get('index')).toEqual(2);
  });

  test('Cache index', () => {
    var model = obj.add({});
    var model2 = obj.add({});
    obj.remove(model2);
    var model3 = obj.add({});
    expect(model3.get('index')).toEqual(3);
  });

  test('Reset index on reset', () => {
    var model = obj.add({});
    var model2 = obj.add({});
    obj.reset();
    expect(obj.idx).toEqual(1);
  });

  test('getFullValue from layers', () => {
    obj = new Layers([{ properties }, { properties }, { properties }]);
    expect(obj.getFullValue()).toEqual(
      'val1 val2 test(val3), val1 val2 test(val3), val1 val2 test(val3)'
    );
  });

  test('getPropertyValues from layers', () => {
    obj = new Layers([{ properties }, { properties }, { properties }]);
    expect(obj.getPropertyValues('prop3')).toEqual(
      'test(val3), test(val3), test(val3)'
    );
  });
});

describe('PropertyFactory', () => {
  var obj;

  beforeEach(() => {
    obj = new PropertyFactory();
  });

  afterEach(() => {
    obj = null;
  });

  test('Object exists', () => {
    expect(obj).toBeTruthy();
  });

  test('Build single prop', () => {
    expect(obj.build('float')).toEqual([
      {
        property: 'float',
        type: 'radio',
        defaults: 'none',
        list: [{ value: 'none' }, { value: 'left' }, { value: 'right' }]
      }
    ]);
  });

  test('Build display', () => {
    expect(obj.build('display')).toEqual([
      {
        property: 'display',
        type: 'select',
        defaults: 'block',
        list: [
          { value: 'block' },
          { value: 'inline' },
          { value: 'inline-block' },
          { value: 'flex' },
          { value: 'none' }
        ]
      }
    ]);
  });

  test('Build flex-direction', () => {
    expect(obj.build('flex-direction')).toEqual([
      {
        property: 'flex-direction',
        type: 'select',
        defaults: 'row',
        list: [
          { value: 'row' },
          { value: 'row-reverse' },
          { value: 'column' },
          { value: 'column-reverse' }
        ],
        requires: { display: ['flex'] }
      }
    ]);
  });

  test('Build flex-wrap', () => {
    expect(obj.build('flex-wrap')).toEqual([
      {
        property: 'flex-wrap',
        type: 'select',
        defaults: 'nowrap',
        list: [
          { value: 'nowrap' },
          { value: 'wrap' },
          { value: 'wrap-reverse' }
        ],
        requires: { display: ['flex'] }
      }
    ]);
  });

  test('Build justify-content', () => {
    expect(obj.build('justify-content')).toEqual([
      {
        property: 'justify-content',
        type: 'select',
        defaults: 'flex-start',
        list: [
          { value: 'flex-start' },
          { value: 'flex-end' },
          { value: 'center' },
          { value: 'space-between' },
          { value: 'space-around' },
          { value: 'space-evenly' }
        ],
        requires: { display: ['flex'] }
      }
    ]);
  });

  test('Build align-items', () => {
    expect(obj.build('align-items')).toEqual([
      {
        property: 'align-items',
        type: 'select',
        defaults: 'stretch',
        list: [
          { value: 'flex-start' },
          { value: 'flex-end' },
          { value: 'center' },
          { value: 'baseline' },
          { value: 'stretch' }
        ],
        requires: { display: ['flex'] }
      }
    ]);
  });

  test('Build align-content', () => {
    expect(obj.build('align-content')).toEqual([
      {
        property: 'align-content',
        type: 'select',
        defaults: 'stretch',
        list: [
          { value: 'flex-start' },
          { value: 'flex-end' },
          { value: 'center' },
          { value: 'space-between' },
          { value: 'space-around' },
          { value: 'stretch' }
        ],
        requires: { display: ['flex'] }
      }
    ]);
  });

  test('Build align-self', () => {
    expect(obj.build('align-self')).toEqual([
      {
        property: 'align-self',
        type: 'select',
        defaults: 'auto',
        list: [
          { value: 'auto' },
          { value: 'flex-start' },
          { value: 'flex-end' },
          { value: 'center' },
          { value: 'baseline' },
          { value: 'stretch' }
        ],
        requiresParent: { display: ['flex'] }
      }
    ]);
  });

  test('Build position', () => {
    expect(obj.build('position')).toEqual([
      {
        property: 'position',
        type: 'radio',
        defaults: 'static',
        list: [
          { value: 'static' },
          { value: 'relative' },
          { value: 'absolute' },
          { value: 'fixed' }
        ]
      }
    ]);
  });

  test('Build left, right', () => {
    var res = {
      type: 'integer',
      units: ['px', '%', 'vw'],
      defaults: 'auto',
      fixedValues: ['initial', 'inherit', 'auto']
    };
    res.property = 'right';
    expect(obj.build('right')).toEqual([res]);
    res.property = 'left';
    expect(obj.build('left')).toEqual([res]);
  });

  test('Build top, bottom', () => {
    var res = {
      type: 'integer',
      units: ['px', '%', 'vh'],
      defaults: 'auto',
      fixedValues: ['initial', 'inherit', 'auto']
    };
    res.property = 'top';
    expect(obj.build('top')).toEqual([res]);
    res.property = 'bottom';
    expect(obj.build('bottom')).toEqual([res]);
  });

  test('Build width family', () => {
    var res = {
      type: 'integer',
      units: ['px', '%', 'vw'],
      defaults: 'auto',
      fixedValues: ['initial', 'inherit', 'auto'],
      min: 0
    };
    res.property = 'width';
    expect(obj.build('width')).toEqual([res]);
    res.property = 'min-width';
    expect(obj.build('min-width')).toEqual([res]);
    res.property = 'max-width';
    expect(obj.build('max-width')).toEqual([res]);
  });

  test('Build flex-basis', () => {
    var res = {
      type: 'integer',
      units: ['px', '%', 'vw', 'vh'],
      defaults: 'auto',
      fixedValues: ['initial', 'inherit', 'auto'],
      requiresParent: { display: ['flex'] },
      min: 0
    };
    res.property = 'flex-basis';
    expect(obj.build('flex-basis')).toEqual([res]);
  });

  test('Build height family', () => {
    var res = {
      type: 'integer',
      units: ['px', '%', 'vh'],
      defaults: 'auto',
      fixedValues: ['initial', 'inherit', 'auto'],
      min: 0
    };
    res.property = 'height';
    expect(obj.build('height')).toEqual([res]);
    res.property = 'min-height';
    expect(obj.build('min-height')).toEqual([res]);
    res.property = 'max-height';
    expect(obj.build('max-height')).toEqual([res]);
  });

  test('Build margin', () => {
    var res = {
      property: 'margin',
      type: 'composite',
      properties: [
        {
          fixedValues: ['initial', 'inherit', 'auto'],
          property: 'margin-top',
          type: 'integer',
          units: ['px', '%', 'vh'],
          defaults: 0
        },
        {
          fixedValues: ['initial', 'inherit', 'auto'],
          property: 'margin-right',
          type: 'integer',
          units: ['px', '%', 'vw'],
          defaults: 0
        },
        {
          fixedValues: ['initial', 'inherit', 'auto'],
          property: 'margin-bottom',
          type: 'integer',
          units: ['px', '%', 'vh'],
          defaults: 0
        },
        {
          fixedValues: ['initial', 'inherit', 'auto'],
          property: 'margin-left',
          type: 'integer',
          units: ['px', '%', 'vw'],
          defaults: 0
        }
      ]
    };
    expect(obj.build('margin')).toEqual([res]);
  });

  test('Build padding', () => {
    var res = {
      property: 'padding',
      type: 'composite',
      properties: [
        {
          property: 'padding-top',
          fixedValues: ['initial', 'inherit', 'auto'],
          type: 'integer',
          units: ['px', '%', 'vh'],
          defaults: 0,
          min: 0
        },
        {
          property: 'padding-right',
          fixedValues: ['initial', 'inherit', 'auto'],
          type: 'integer',
          units: ['px', '%', 'vw'],
          defaults: 0,
          min: 0
        },
        {
          property: 'padding-bottom',
          fixedValues: ['initial', 'inherit', 'auto'],
          type: 'integer',
          units: ['px', '%', 'vh'],
          defaults: 0,
          min: 0
        },
        {
          property: 'padding-left',
          fixedValues: ['initial', 'inherit', 'auto'],
          type: 'integer',
          units: ['px', '%', 'vw'],
          defaults: 0,
          min: 0
        }
      ]
    };
    expect(obj.build('padding')).toEqual([res]);
  });

  test('Build font-family', () => {
    var ss = ', sans-serif';
    var ms = ', monospace';
    var res = {
      property: 'font-family',
      type: 'select',
      defaults: 'Arial, Helvetica' + ss,
      list: [
        { name: 'Arial', value: 'Arial, Helvetica' + ss },
        { name: 'Arial Black', value: 'Arial Black, Gadget' + ss },
        { name: 'Brush Script MT', value: 'Brush Script MT' + ss },
        { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' + ss },
        { name: 'Courier New', value: 'Courier New, Courier' + ms },
        { name: 'Georgia', value: 'Georgia, serif' },
        { name: 'Helvetica', value: 'Helvetica, serif' },
        { name: 'Impact', value: 'Impact, Charcoal' + ss },
        {
          name: 'Lucida Sans Unicode',
          value: 'Lucida Sans Unicode, Lucida Grande' + ss
        },
        { name: 'Tahoma', value: 'Tahoma, Geneva' + ss },
        { name: 'Times New Roman', value: 'Times New Roman, Times, serif' },
        { name: 'Trebuchet MS', value: 'Trebuchet MS, Helvetica' + ss },
        { name: 'Verdana', value: 'Verdana, Geneva' + ss }
      ]
    };
    expect(obj.build('font-family')).toEqual([res]);
  });

  test('Build font-size', () => {
    var res = {
      type: 'integer',
      units: ['px', 'em', 'rem', '%'],
      defaults: 'medium',
      min: 0,
      fixedValues: [
        'medium',
        'xx-small',
        'x-small',
        'small',
        'large',
        'x-large',
        'xx-large',
        'smaller',
        'larger',
        'length',
        'initial',
        'inherit'
      ]
    };
    res.property = 'font-size';
    expect(obj.build('font-size')).toEqual([res]);
  });

  test('Build letter-spacing', () => {
    var res = {
      type: 'integer',
      units: ['px', 'em', 'rem', '%'],
      defaults: 'normal',
      fixedValues: ['normal', 'initial', 'inherit']
    };
    res.property = 'letter-spacing';
    expect(obj.build('letter-spacing')).toEqual([res]);
  });

  test('Build font-weight', () => {
    var res = {
      type: 'select',
      defaults: '400',
      list: [
        { value: '100', name: 'Thin' },
        { value: '200', name: 'Extra-Light' },
        { value: '300', name: 'Light' },
        { value: '400', name: 'Normal' },
        { value: '500', name: 'Medium' },
        { value: '600', name: 'Semi-Bold' },
        { value: '700', name: 'Bold' },
        { value: '800', name: 'Extra-Bold' },
        { value: '900', name: 'Ultra-Bold' }
      ]
    };
    res.property = 'font-weight';
    expect(obj.build('font-weight')).toEqual([res]);
  });

  test('Build color', () => {
    var res = {
      property: 'color',
      type: 'color',
      defaults: 'black'
    };
    expect(obj.build('color')).toEqual([res]);
  });

  test('Build line-height', () => {
    var res = {
      type: 'integer',
      units: ['px', 'em', 'rem', '%'],
      defaults: 'normal',
      fixedValues: ['normal', 'initial', 'inherit']
    };
    res.property = 'line-height';
    expect(obj.build('line-height')).toEqual([res]);
  });

  test('Build text-align', () => {
    var res = {
      type: 'radio',
      defaults: 'left',
      list: [
        { value: 'left' },
        { value: 'center' },
        { value: 'right' },
        { value: 'justify' }
      ]
    };
    res.property = 'text-align';
    expect(obj.build('text-align')).toEqual([res]);
  });

  test('Build text-shadow', () => {
    var res = {
      type: 'stack',
      preview: true,
      defaults: 'none',
      properties: [
        {
          property: 'text-shadow-h',
          type: 'integer',
          units: ['px', '%'],
          defaults: 0
        },
        {
          property: 'text-shadow-v',
          type: 'integer',
          units: ['px', '%'],
          defaults: 0
        },
        {
          property: 'text-shadow-blur',
          type: 'integer',
          units: ['px', '%'],
          defaults: 0,
          min: 0
        },
        {
          property: 'text-shadow-color',
          type: 'color',
          defaults: 'black'
        }
      ]
    };
    res.property = 'text-shadow';
    expect(obj.build('text-shadow')).toEqual([res]);
  });

  test('Build border-radius-c', () => {
    var res = {
      type: 'integer',
      units: ['px', '%'],
      defaults: 0,
      min: 0
    };
    res.property = 'border-radius';
    expect(obj.build('border-radius-c')).toEqual([res]);
  });

  test('Build border-radius', () => {
    var res = {
      property: 'border-radius',
      type: 'composite',
      properties: [
        {
          property: 'border-top-left-radius',
          type: 'integer',
          units: ['px', '%'],
          defaults: '0px',
          min: 0
        },
        {
          property: 'border-top-right-radius',
          type: 'integer',
          units: ['px', '%'],
          min: 0,
          defaults: '0px'
        },
        {
          property: 'border-bottom-right-radius',
          type: 'integer',
          units: ['px', '%'],
          min: 0,
          defaults: '0px'
        },
        {
          property: 'border-bottom-left-radius',
          type: 'integer',
          units: ['px', '%'],
          min: 0,
          defaults: '0px'
        }
      ]
    };
    res.property = 'border-radius';
    expect(obj.build('border-radius')).toEqual([res]);
  });

  test('Build background-color', () => {
    var res = {
      type: 'color',
      defaults: 'none'
    };
    res.property = 'background-color';
    expect(obj.build('background-color')).toEqual([res]);
  });

  test('Build border', () => {
    var res = {
      property: 'border',
      type: 'composite',
      properties: [
        {
          property: 'border-width',
          type: 'integer',
          units: ['px', 'em'],
          defaults: 'medium',
          min: 0
        },
        {
          property: 'border-style',
          type: 'select',
          defaults: 'solid',
          list: [
            { value: 'none' },
            { value: 'solid' },
            { value: 'dotted' },
            { value: 'dashed' },
            { value: 'double' },
            { value: 'groove' },
            { value: 'ridge' },
            { value: 'inset' },
            { value: 'outset' }
          ]
        },
        {
          property: 'border-color',
          type: 'color',
          defaults: 'black'
        }
      ]
    };
    expect(obj.build('border')).toEqual([res]);
  });

  test('Build box-shadow', () => {
    var res = {
      property: 'box-shadow',
      type: 'stack',
      preview: true,
      properties: [
        {
          property: 'box-shadow-h',
          type: 'integer',
          units: ['px', '%'],
          defaults: 0
        },
        {
          property: 'box-shadow-v',
          type: 'integer',
          units: ['px', '%'],
          defaults: 0
        },
        {
          property: 'box-shadow-blur',
          type: 'integer',
          units: ['px'],
          defaults: '5px',
          min: 0
        },
        {
          property: 'box-shadow-spread',
          type: 'integer',
          units: ['px'],
          defaults: 0
        },
        {
          property: 'box-shadow-color',
          type: 'color',
          defaults: 'black'
        },
        {
          property: 'box-shadow-type',
          type: 'select',
          defaults: '',
          list: [
            { value: '', name: 'Outside' },
            { value: 'inset', name: 'Inside' }
          ]
        }
      ]
    };
    expect(obj.build('box-shadow')).toEqual([res]);
  });

  test('Build background', () => {
    var res = {
      property: 'background',
      type: 'stack',
      preview: true,
      detached: true,
      properties: [
        {
          property: 'background-image',
          type: 'file',
          functionName: 'url'
        },
        {
          property: 'background-repeat',
          type: 'select',
          defaults: 'repeat',
          list: [
            { value: 'repeat' },
            { value: 'repeat-x' },
            { value: 'repeat-y' },
            { value: 'no-repeat' }
          ]
        },
        {
          property: 'background-position',
          type: 'select',
          defaults: 'left top',
          list: [
            { value: 'left top' },
            { value: 'left center' },
            { value: 'left bottom' },
            { value: 'right top' },
            { value: 'right center' },
            { value: 'right bottom' },
            { value: 'center top' },
            { value: 'center center' },
            { value: 'center bottom' }
          ]
        },
        {
          property: 'background-attachment',
          type: 'select',
          defaults: 'scroll',
          list: [{ value: 'scroll' }, { value: 'fixed' }, { value: 'local' }]
        },
        {
          property: 'background-size',
          type: 'select',
          defaults: 'auto',
          list: [{ value: 'auto' }, { value: 'cover' }, { value: 'contain' }]
        }
      ]
    };
    expect(obj.build('background')).toEqual([res]);
  });

  test('Build transition', () => {
    var res = {
      property: 'transition',
      type: 'stack',
      properties: [
        {
          property: 'transition-property',
          type: 'select',
          defaults: 'width',
          list: [
            { value: 'all' },
            { value: 'width' },
            { value: 'height' },
            { value: 'background-color' },
            { value: 'transform' },
            { value: 'box-shadow' },
            { value: 'opacity' }
          ]
        },
        {
          property: 'transition-duration',
          type: 'integer',
          units: ['s'],
          defaults: '2',
          min: 0
        },
        {
          property: 'transition-timing-function',
          type: 'select',
          defaults: 'ease',
          list: [
            { value: 'linear' },
            { value: 'ease' },
            { value: 'ease-in' },
            { value: 'ease-out' },
            { value: 'ease-in-out' }
          ]
        }
      ]
    };
    expect(obj.build('transition')).toEqual([res]);
  });

  test('Build perspective', () => {
    var res = {
      property: 'perspective',
      type: 'integer',
      units: ['px'],
      defaults: 0,
      min: 0
    };
    expect(obj.build('perspective')).toEqual([res]);
  });

  test('Build transform', () => {
    var res = {
      property: 'transform',
      type: 'composite',
      properties: [
        {
          property: 'transform-rotate-x',
          type: 'integer',
          units: ['deg'],
          defaults: 0,
          functionName: 'rotateX'
        },
        {
          property: 'transform-rotate-y',
          type: 'integer',
          units: ['deg'],
          defaults: 0,
          functionName: 'rotateY'
        },
        {
          property: 'transform-rotate-z',
          type: 'integer',
          units: ['deg'],
          defaults: 0,
          functionName: 'rotateZ'
        },
        {
          property: 'transform-scale-x',
          type: 'integer',
          defaults: 1,
          functionName: 'scaleX'
        },
        {
          property: 'transform-scale-y',
          type: 'integer',
          defaults: 1,
          functionName: 'scaleY'
        },
        {
          property: 'transform-scale-z',
          type: 'integer',
          defaults: 1,
          functionName: 'scaleZ'
        }
      ]
    };
    expect(obj.build('transform')).toEqual([res]);
  });

  test('Build cursor', () => {
    var res = {
      type: 'select',
      property: 'cursor',
      defaults: 'auto',
      list: [
        { value: 'auto' },
        { value: 'pointer' },
        { value: 'copy' },
        { value: 'crosshair' },
        { value: 'grab' },
        { value: 'grabbing' },
        { value: 'help' },
        { value: 'move' },
        { value: 'text' }
      ]
    };
    expect(obj.build('cursor')).toEqual([res]);
  });

  test('Build overflow', () => {
    var res = {
      type: 'select',
      property: 'overflow',
      defaults: 'visible',
      list: [
        { value: 'visible' },
        { value: 'hidden' },
        { value: 'scroll' },
        { value: 'auto' }
      ]
    };
    expect(obj.build('overflow')).toEqual([res]);
  });

  test('Build overflow-x', () => {
    var res = {
      type: 'select',
      property: 'overflow-x',
      defaults: 'visible',
      list: [
        { value: 'visible' },
        { value: 'hidden' },
        { value: 'scroll' },
        { value: 'auto' }
      ]
    };
    expect(obj.build('overflow-x')).toEqual([res]);
  });

  test('Build overflow-y', () => {
    var res = {
      type: 'select',
      property: 'overflow-y',
      defaults: 'visible',
      list: [
        { value: 'visible' },
        { value: 'hidden' },
        { value: 'scroll' },
        { value: 'auto' }
      ]
    };
    expect(obj.build('overflow-y')).toEqual([res]);
  });
});
