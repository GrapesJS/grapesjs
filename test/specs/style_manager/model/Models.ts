import Sector from '../../../../src/style_manager/model/Sector';
import Property from '../../../../src/style_manager/model/Property';
import PropertyNumber from '../../../../src/style_manager/model/PropertyNumber';
import Editor from '../../../../src/editor/model/Editor';

describe('Sector', () => {
  let em: Editor;
  let sm: Editor['Styles'];
  let obj: Sector;
  let confToExt: any;

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
    em = new Editor({
      styleManager: {
        sectors: [{ id: 'sector-1', name: 's' }],
      },
    });
    sm = em.Styles;
    sm.onLoad();
    obj = sm.getSector('sector-1');
  });

  afterEach(() => {
    em.destroy();
  });

  test('Has id property', () => {
    expect(obj.has('id')).toEqual(true);
  });

  test('Has no properties', () => {
    expect(obj.get('properties')!.length).toEqual(0);
  });

  test('Init with properties', () => {
    obj = new Sector({
      name: 'test',
      properties: [{ property: '1' }, { property: '2' }],
    });
    expect(obj.getProperties().length).toEqual(2);
  });

  test('Build properties', () => {
    var res = obj.buildProperties(['display', 'float']);
    expect(res.length).toEqual(2);
    expect(res[0]).toEqual({
      property: 'display',
      type: 'select',
      default: 'block',
      options: [{ id: 'block' }, { id: 'inline' }, { id: 'inline-block' }, { id: 'flex' }, { id: 'none' }],
    });
  });

  test('Extend properties', () => {
    obj = sm.addSector('test', confToExt);
    expect(obj.getProperties().length).toEqual(3);
    var prop0 = obj.getProperties()[0];
    expect(prop0.get('type')).toEqual('radio');
    expect(prop0.get('default')).toEqual('block');
  });

  test('Do not extend properties', () => {
    confToExt.extendBuilded = 0;
    obj = sm.addSector('test', confToExt);
    expect(obj.getProperties().length).toEqual(3);
    var prop0 = obj.getProperties()[0];
    expect(prop0.get('type')).toEqual('radio');
    expect(prop0.get('defaults')).toEqual('');
  });

  test('Extend composed properties', () => {
    obj = sm.addSector('test', {
      buildProps: ['margin', 'float'],
      properties: [
        {
          property: 'margin',
          // @ts-ignore
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
    var sectProps = obj.getProperties();
    expect(sectProps.length).toEqual(2);
    var prop0 = obj.getProperties()[0];
    var propProps = prop0.get('properties' as any);

    expect(propProps.length).toEqual(2);
    var propTop = propProps.at(0);
    expect(propTop.get('name')).toEqual('Top');
    expect(propTop.get('type')).toEqual('number');
  });
});

describe('Property', () => {
  let obj: Property;

  beforeEach(() => {
    obj = new Property();
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
    obj = new Property({ functionName: 'fn', property: 'test' });
    const result = { value: 'testValue', functionName: 'fn' };
    expect(obj.parseValue('fn(testValue)')).toEqual(result);
    expect(obj.parseValue('fn(testValue')).toEqual(result);
  });

  test('Parse correctly a value with !important', () => {
    const result = { value: 'red', important: true };
    expect(obj.parseValue('red !important ')).toEqual(result);
  });

  test('getFullValue', () => {
    obj = new Property({ functionName: 'fn', value: 'red', property: 'test' });
    expect(obj.getFullValue()).toEqual('fn(red)');
    obj = new Property({ functionName: 'fn', value: '#123', important: true, property: 'test' });
    expect(obj.getFullValue()).toEqual('fn(#123) !important');
  });
});

describe('PropertyNumber', () => {
  let obj: PropertyNumber;

  beforeEach(() => {
    obj = new PropertyNumber({ units: ['px', 'deg'], property: 'test' });
  });

  test('parseValue with units', () => {
    const result = { value: 20, unit: 'px' };
    expect(obj.parseValue('20px')).toEqual(result);
  });

  test('parse input value with function', () => {
    obj = new PropertyNumber({
      units: ['px', 'deg'],
      functionName: 'test',
      property: 'test',
    });
    const result = { value: 55, unit: 'deg', functionName: 'test' };
    expect(obj.parseValue('test(55deg)')).toEqual(result);
  });

  test('parse input value with min', () => {
    obj = new PropertyNumber({ units: ['px'], min: 10, property: 'test' });
    const result = { value: 10, unit: 'px' };
    expect(obj.parseValue('1px')).toEqual(result);
    expect(obj.parseValue('15px')).toEqual({ value: 15, unit: 'px' });
  });

  test('parse input value with max', () => {
    obj = new PropertyNumber({ units: ['px'], max: 100, property: 'test' });
    const result = { value: 100, unit: 'px' };
    expect(obj.parseValue('200px')).toEqual(result);
    expect(obj.parseValue('95px')).toEqual({ value: 95, unit: 'px' });
  });
});
