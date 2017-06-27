const SectorView = require('style_manager/view/SectorView');
const Sector = require('style_manager/model/Sector');

module.exports = {
  run() {

      describe('SectorView', () => {

        var $fixtures;
        var $fixture;
        var model;
        var view;

        before(() => {
          $fixtures  = $("#fixtures");
          $fixture   = $('<div class="sector-fixture"></div>');
        });

        beforeEach(() => {
          model = new Sector();
          view = new SectorView({
            model
          });
          $fixture.empty().appendTo($fixtures);
          $fixture.html(view.render().el);
        });

        afterEach(() => {
          view.remove();
        });

        after(() => {
          $fixture.remove();
        });

        it('Rendered correctly', () => {
          var sector = view.el;
          expect(sector.querySelector('.title')).toExist();
          var props = sector.querySelector('.properties');
          expect(props).toExist();
          expect(sector.classList.contains('open')).toEqual(true);
        });

        it('No properties', () => {
          var props = view.el.querySelector('.properties');
          expect(props.innerHTML).toEqual('<div class="clear"></div>');
        });

        it('Update on open', () => {
          var sector = view.el;
          var props = sector.querySelector('.properties');
          model.set('open', false);
          expect(sector.classList.contains('open')).toEqual(false);
          expect(props.style.display).toEqual('none');
        });

        it('Toggle on click', () => {
          var sector = view.el;
          view.$el.find('.title').click();
          expect(sector.classList.contains('open')).toEqual(false);
        });

        describe('Init with options', () => {

          beforeEach(() => {
            model = new Sector({
              open: false,
              name: 'TestName',
              properties: [
                {type:'integer'},
                {type:'integer'},
                {type:'integer'},
              ]
            });
            view = new SectorView({
              model
            });
            $fixture.empty().appendTo($fixtures);
            $fixture.html(view.render().el);
          });

          afterEach(() => {
            view.remove();
          });

          it('Rendered correctly2', () => {
            var sector = view.el;
            var props = sector.querySelector('.properties');
            expect(sector.querySelector('.title').innerHTML).toContain('TestName');
            expect(props).toExist();
            expect(sector.classList.contains('open')).toEqual(false);
            expect(props.style.display).toEqual('none');
          });

          it('Has properties', () => {
            var props = view.el.querySelector('.properties');
            expect(props.children.length).toEqual(4); // Last one is 'clear' element
          });

        });

    });
  }
};
