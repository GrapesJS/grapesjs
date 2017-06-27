const SectorView = require('style_manager/view/SectorView');
const Sector = require('style_manager/model/Sector');

module.exports = {
  run : function(){

      describe('SectorView', function() {

        var $fixtures;
        var $fixture;
        var model;
        var view;

        before(function () {
          $fixtures  = $("#fixtures");
          $fixture   = $('<div class="sector-fixture"></div>');
        });

        beforeEach(function () {
          model = new Sector();
          view = new SectorView({
            model: model
          });
          $fixture.empty().appendTo($fixtures);
          $fixture.html(view.render().el);
        });

        afterEach(function () {
          view.remove();
        });

        after(function () {
          $fixture.remove();
        });

        it('Rendered correctly', function() {
          var sector = view.el;
          expect(sector.querySelector('.title')).toExist();
          var props = sector.querySelector('.properties');
          expect(props).toExist();
          expect(sector.classList.contains('open')).toEqual(true);
        });

        it('No properties', function() {
          var props = view.el.querySelector('.properties');
          expect(props.innerHTML).toEqual('<div class="clear"></div>');
        });

        it('Update on open', function() {
          var sector = view.el;
          var props = sector.querySelector('.properties');
          model.set('open', false);
          expect(sector.classList.contains('open')).toEqual(false);
          expect(props.style.display).toEqual('none');
        });

        it('Toggle on click', function() {
          var sector = view.el;
          view.$el.find('.title').click();
          expect(sector.classList.contains('open')).toEqual(false);
        });

        describe('Init with options', function() {

          beforeEach(function () {
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
              model: model
            });
            $fixture.empty().appendTo($fixtures);
            $fixture.html(view.render().el);
          });

          afterEach(function () {
            view.remove();
          });

          it('Rendered correctly2', function() {
            var sector = view.el;
            var props = sector.querySelector('.properties');
            expect(sector.querySelector('.title').innerHTML).toContain('TestName');
            expect(props).toExist();
            expect(sector.classList.contains('open')).toEqual(false);
            expect(props.style.display).toEqual('none');
          });

          it('Has properties', function() {
            var props = view.el.querySelector('.properties');
            expect(props.children.length).toEqual(4); // Last one is 'clear' element
          });

        });

    });
  }
};
