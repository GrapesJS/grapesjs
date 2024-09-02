import Modal from 'modal_dialog';
import Editor from 'editor';

describe('Modal dialog', () => {
  describe('Main', () => {
    var em;
    var obj;

    beforeEach(() => {
      em = new Editor({});
      obj = new Modal(em);
    });

    afterEach(() => {
      obj = null;
    });

    test('Object exists', () => {
      expect(obj).toBeTruthy();
    });

    test('Is close by default', () => {
      expect(obj.isOpen()).toEqual(false);
    });

    test('Title is empty', () => {
      expect(obj.getTitle()).toEqual('');
    });

    test('Content is empty', () => {
      expect(obj.getContent()).toEqual('');
    });

    test('Set title', () => {
      obj.setTitle('Test');
      expect(obj.getTitle()).toEqual('Test');
    });

    test('Set content', () => {
      obj.setContent('Test');
      expect(obj.getContent()).toEqual('Test');
    });

    test('Set HTML content', () => {
      obj.setContent('<h1>Test</h1>');
      expect(obj.getContent()).toEqual('<h1>Test</h1>');
    });

    test('Open modal', () => {
      obj.open();
      expect(obj.isOpen()).toEqual(true);
    });

    test('Close modal', () => {
      obj.open();
      obj.close();
      expect(obj.isOpen()).toEqual(false);
    });
  });
});
