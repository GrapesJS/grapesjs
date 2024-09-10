import Selector from '../../../../src/selector_manager/model/Selector';
import Selectors from '../../../../src/selector_manager/model/Selectors';

describe('Selector', () => {
  let obj: Selector;
  const nameToEscape = '  @Te    sT:*[]!"£$%&/()=?^{}(). %/+#';
  const nameEscaped = '@Te-sT:*[]!"£$%&/()=?^{}().-%/+#';

  beforeEach(() => {
    obj = new Selector({ name: '' });
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
    expect(Selector.escapeName(nameToEscape)).toEqual(nameEscaped);
  });

  test('Name is corrected at instantiation', () => {
    obj = new Selector({ name: nameToEscape });
    expect(obj.get('name')).toEqual(nameEscaped);
  });
});

describe('Selectors', () => {
  let obj: Selectors;

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

  test('getFullName with combination of 2 classes', () => {
    obj.add([{ name: 'a' }, { name: 'b' }]);
    expect(
      obj.getFullName({
        combination: true,
        array: true,
      }),
    ).toEqual(['.a', '.a.b', '.b']);

    expect(obj.getFullName({ combination: true })).toEqual('.a,.a.b,.b');
    expect(obj.getFullName({ array: true })).toEqual(['.a', '.b']);
    expect(obj.getFullName()).toEqual('.a.b');
  });

  test('getFullName with combination of 3 classes', () => {
    obj.add([{ name: 'c' }, { name: 'b' }, { name: 'a' }]);
    expect(
      obj.getFullName({
        combination: true,
        array: true,
      }),
    ).toEqual(['.a', '.a.b', '.a.b.c', '.a.c', '.b', '.b.c', '.c']);
  });

  test('getFullName with combination of 4 classes', () => {
    obj.add([{ name: 'd' }, { name: 'c' }, { name: 'b' }, { name: 'a' }]);
    expect(
      obj.getFullName({
        combination: true,
        array: true,
      }),
    ).toEqual([
      '.a',
      '.a.b',
      '.a.b.c',
      '.a.b.c.d',
      '.a.b.d',
      '.a.c',
      '.a.c.d',
      '.a.d',
      '.b',
      '.b.c',
      '.b.c.d',
      '.b.d',
      '.c',
      '.c.d',
      '.d',
    ]);
  });
});
