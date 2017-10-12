const ModalView = require('modal_dialog/view/ModalView');
const Modal = require('modal_dialog/model/Modal');

module.exports = {
  run() {
      describe('ModalView', () => {

        var model;
        var view;
        var editorModel;

        beforeEach(() => {
          model = new Modal();
          view = new ModalView({
            model
          });
          document.body.innerHTML = '<div id="fixtures"></div>';
          document.body.querySelector('#fixtures').appendChild(view.render().el);
        });

        afterEach(() => {
          view = null;
          model = null;
        });

        it("The content is not empty", () => {
          expect(view.el.innerHTML).toExist();
        });

        it("Get content", () => {
          expect(view.getContent()).toExist();
        });

        it("Update content", () => {
          model.set('content', 'test');
          expect(view.getContent().get(0).innerHTML).toEqual('test');
        });

        it("Get title", () => {
          expect(view.getTitle()).toExist();
        });

        it("Update title", () => {
          model.set('title', 'test');
          expect(view.getTitle().innerHTML).toEqual('test');
        });

        it("Close by default", () => {
          view.updateOpen();
          expect(view.el.style.display).toEqual('none');
        });

        it("Open dialog", () => {
          model.set('open', 1);
          expect(view.el.style.display).toEqual('');
        });

    });
  }
};
