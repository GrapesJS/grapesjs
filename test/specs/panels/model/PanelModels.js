import Button from 'panels/model/Button';
import Buttons from 'panels/model/Buttons';
import Panel from 'panels/model/Panel';

describe('Button', () => {
  var obj;

  beforeEach(() => {
    obj = new Button();
  });

  afterEach(() => {
    obj = null;
  });

  test('Has buttons instance', () => {
    expect(obj.has('buttons')).toEqual(true);
  });

  test('Has no buttons', () => {
    expect(obj.get('buttons').length).toEqual(0);
  });

  test('Init with other buttons inside correctly', () => {
    obj = new Button(null, {
      buttons: [{}],
    });
    expect(obj.get('buttons') instanceof Buttons).toEqual(true);
    expect(obj.get('buttons').length).toEqual(1);
  });

  test('Has a disable attribute with default value as false', () => {
    expect(obj.get('disable')).toEqual(false);
  });
});

describe('Buttons', () => {
  var obj;

  beforeEach(() => {
    obj = new Buttons();
  });

  afterEach(() => {
    obj = null;
  });

  test('Deactivates buttons', () => {
    obj.add({ active: true });
    obj.deactivateAll();
    expect(obj.at(0).get('active')).toEqual(false);
  });

  test('Deactivates buttons with context', () => {
    obj.add({ active: true });
    obj.deactivateAll('someContext');
    expect(obj.at(0).get('active')).toEqual(true);
  });

  test('Deactivates except one', () => {
    var btn = obj.add({ active: true });
    obj.deactivateAllExceptOne();
    expect(obj.at(0).get('active')).toEqual(false);
  });

  test('Deactivates except one with model', () => {
    var btn = obj.add({ active: true });
    obj.deactivateAllExceptOne(btn);
    expect(obj.at(0).get('active')).toEqual(true);
  });

  test('Disable all buttons', () => {
    obj.add({ disable: false });
    obj.disableAllButtons();
    expect(obj.at(0).get('disable')).toEqual(true);
  });

  test('Disables buttons with context', () => {
    obj.add({ disable: false, context: 'someContext' });
    obj.disableAllButtons('someContext');
    expect(obj.at(0).get('disable')).toEqual(true);
  });

  test('Disables except one', () => {
    var btn = obj.add({ disable: false });
    obj.disableAllButtonsExceptOne(btn);
    expect(obj.at(0).get('disable')).toEqual(false);
  });
});

describe('Panel', () => {
  var obj;

  beforeEach(() => {
    obj = new Panel();
  });

  afterEach(() => {
    obj = null;
  });

  test('Has buttons instance', () => {
    expect(obj.has('buttons')).toEqual(true);
    expect(obj.get('buttons') instanceof Buttons).toEqual(true);
  });

  test('Has no buttons', () => {
    expect(obj.get('buttons').length).toEqual(0);
  });

  test('Init with buttons inside correctly', () => {
    obj = new Panel(null, {
      buttons: [{}],
    });
    expect(obj.get('buttons') instanceof Buttons).toEqual(true);
    expect(obj.get('buttons').length).toEqual(1);
  });
});

describe('Panels', () => {
  var obj;

  beforeEach(() => {
    obj = new Panel();
  });

  afterEach(() => {
    obj = null;
  });
});
