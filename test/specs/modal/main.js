var modulePath = './../../../test/specs/modal';

define([ 'ModalDialog',
        modulePath + '/view/ModalView',
         ],
  function(Modal, ModalView) {

    describe('Modal dialog', function() {

      describe('Main', function() {

        var obj;

        beforeEach(function () {
          obj = new Modal().init();
        });

        afterEach(function () {
          delete obj;
        });

        it('Object exists', function() {
          obj.should.be.exist;
        });

        it('Is close by default', function() {
          obj.isOpen().should.equal(false);
        });

        it('Title is empty', function() {
          obj.getTitle().should.equal('');
        });

        it('Content is empty', function() {
          obj.getContent().should.equal('');
        });

        it('Set title', function() {
          obj.setTitle('Test');
          obj.getTitle().should.equal('Test');
        });

        it('Set content', function() {
          obj.setContent('Test');
          obj.getContent().should.equal('Test');
        });

        it('Set HTML content', function() {
          obj.setContent('<h1>Test</h1>');
          obj.getContent().should.equal('<h1>Test</h1>');
        });

        it('Open modal', function() {
          obj.open();
          obj.isOpen().should.equal(true);
        });

        it('Close modal', function() {
          obj.open();
          obj.close();
          obj.isOpen().should.equal(false);
        });

      });

      ModalView.run();

    });
});