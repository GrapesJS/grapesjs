const Modal = require('modal_dialog');
const ModalView = require('./view/ModalView');

describe('Modal dialog', () => {

  describe('Main', () => {

    var obj;

    beforeEach(() => {
      obj = new Modal().init();
    });

    afterEach(() => {
      obj = null;
    });

    it('Object exists', () => {
      expect(obj).toExist();
    });

    it('Is close by default', () => {
      expect(obj.isOpen()).toEqual(false);
    });

    it('Title is empty', () => {
      expect(obj.getTitle()).toEqual('');
    });

    it('Content is empty', () => {
      expect(obj.getContent()).toEqual('');
    });

    it('Set title', () => {
      obj.setTitle('Test');
      expect(obj.getTitle()).toEqual('Test');

    });

    it('Set content', () => {
      obj.setContent('Test');
      expect(obj.getContent()).toEqual('Test');
    });

    it('Set HTML content', () => {
      obj.setContent('<h1>Test</h1>');
      expect(obj.getContent()).toEqual('<h1>Test</h1>');
    });

    it('Open modal', () => {
      obj.open();
      expect(obj.isOpen()).toEqual(true);
    });

    it('Close modal', () => {
      obj.open();
      obj.close();
      expect(obj.isOpen()).toEqual(false);
    });

  });

  ModalView.run();

});
