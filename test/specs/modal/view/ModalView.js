var path = 'ModalDialog/view/';
define([path + 'ModalView', 'ModalDialog/model/Modal'],
  function(ModalView, Modal) {

    return {
      run : function(){
          describe('ModalView', function() {

            var $fixtures;
            var $fixture;
            var model;
            var view;
            var editorModel;

            before(function () {
              $fixtures = $("#fixtures");
              $fixture= $('<div class="modal-fixture"></div>');
            });

            beforeEach(function () {
              model = new Modal();
              view = new ModalView({
                model: model
              });
              $fixture.empty().appendTo($fixtures);
              $fixture.html(view.render().el);
            });

            afterEach(function () {
              delete view;
              delete model;
            });

            after(function () {
              $fixture.remove();
            });

            it("The content is not empty", function (){
              view.el.innerHTML.should.be.not.empty;
            });

            it("Get content", function (){
              view.getContent().should.be.ok;
            });

            it("Update content", function (){
              model.set('content', 'test');
              view.getContent().get(0).innerHTML.should.equal('test');
            });

            it("Get title", function (){
              view.getTitle().should.be.ok;
            });

            it("Update title", function (){
              model.set('title', 'test');
              view.getTitle().innerHTML.should.equal('test');
            });

            it("Close by default", function (){
              view.updateOpen();
              view.el.style.display.should.equal('none');
            });

            it("Open dialog", function (){
              model.set('open', 1);
              view.el.style.display.should.equal('');
            });

        });
      }
    };

});