import Sector from 'style_manager/model/Sector';
import Property from 'style_manager/model/Property';
import PropertyNumber from 'style_manager/model/PropertyNumber';
import Properties from 'style_manager/model/Properties';
import Layer from 'style_manager/model/Layer';
import Layers from 'style_manager/model/Layers';

describe('Sector', () => {
  var obj;
  var confToExt;

  beforeEach(() => {
    confToExt = {
      buildProps: ['display', 'float'],
      properties: [
        {
          property: 'display',
          type: 'radio',
        },
        {
          property: 'color',
          type: 'color',
        },
      ],
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
      properties: [{}, {}],
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
      list: [{ value: 'block' }, { value: 'inline' }, { value: 'inline-block' }, { value: 'flex' }, { value: 'none' }],
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
              property: 'margin-top',
            },
            {
              property: 'margin-right',
            },
          ],
        },
      ],
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

describe('PropertyNumber', () => {
  var obj;

  beforeEach(() => {
    obj = new PropertyNumber({ units: ['px', 'deg'] });
  });

  afterEach(() => {
    obj = null;
  });

  test('parseValue with units', () => {
    const result = { value: 20, unit: 'px' };
    expect(obj.parseValue('20px')).toEqual(result);
  });

  test('parse input value with function', () => {
    obj = new PropertyNumber({
      units: ['px', 'deg'],
      functionName: 'test',
    });
    const result = { value: 55, unit: 'deg', functionName: 'test' };
    expect(obj.parseValue('test(55deg)')).toEqual(result);
  });

  test('parse input value with min', () => {
    obj = new PropertyNumber({ units: ['px'], min: 10 });
    const result = { value: 10, unit: 'px' };
    expect(obj.parseValue('1px')).toEqual(result);
    expect(obj.parseValue('15px')).toEqual({ value: 15, unit: 'px' });
  });

  test('parse input value with max', () => {
    obj = new PropertyNumber({ units: ['px'], max: 100 });
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
    { value: 'val3', property: 'prop3', functionName: 'test' },
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
      properties,
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
    { value: 'val3', property: 'prop3', functionName: 'test' },
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
    expect(obj.getFullValue()).toEqual('val1 val2 test(val3), val1 val2 test(val3), val1 val2 test(val3)');
  });

  test('getPropertyValues from layers', () => {
    obj = new Layers([{ properties }, { properties }, { properties }]);
    expect(obj.getPropertyValues('prop3')).toEqual('test(val3), test(val3), test(val3)');
  });
});
