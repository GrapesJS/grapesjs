import Selector from 'selector_manager/model/Selector';
import Selectors from 'selector_manager/model/Selectors';

describe('Selector', () => {
  var obj;

  beforeEach(() => {
    obj = new Selector();
  });

  afterEach(() => {
    obj = null;
  });

  test('Has name property', () => {
    expect(obj.has('name')).toEqual(true);
  });

  test('Has label property', () => {
    expect(obj.has('label')).toEqual(true);
  });

  test('Has active property', () => {
    expect(obj.has('active')).toEqual(true);
  });

  test('escapeName test', () => {
    expect(Selector.escapeName('@Te sT*')).toEqual('-Te-sT-');
  });

  test('Name is corrected at instantiation', () => {
    obj = new Selector({ name: '@Te sT*' });
    expect(obj.get('name')).toEqual('-Te-sT-');
  });
});

describe('Selectors', () => {
  var obj;

  beforeEach(() => {
    obj = new Selectors();
  });

  test('Creates collection item correctly', () => {
    var c = new Selectors();
    var m = c.add({});
    expect(m instanceof Selector).toEqual(true);
  });

  test('getFullString with single class', () => {
    obj.add({ name: 'test' });
    expect(obj.getFullString()).toEqual('.test');
  });

  test('getFullString with multiple classes', () => {
    obj.add([{ name: 'test' }, { name: 'test2' }]);
    expect(obj.getFullString()).toEqual('.test.test2');
  });

  test('getFullString with mixed selectors', () => {
    obj.add([{ name: 'test' }, { name: 'test2', type: Selector.TYPE_ID }]);
    expect(obj.getFullString()).toEqual('.test#test2');
  });
});
