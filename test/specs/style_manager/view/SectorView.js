var path = 'StyleManager/view/';
define([path + 'SectorView', 'StyleManager/model/Sector'],
  function(SectorView, Sector) {

    return {
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
              sector.should.be.ok;
              sector.querySelector('.title').should.be.ok;
              var props = sector.querySelector('.properties');
              props.should.be.ok;
              sector.classList.contains('open').should.equal(true);
            });

            it('No properties', function() {
              var props = view.el.querySelector('.properties');
              props.innerHTML.should.equal('<div class="clear"></div>');
            });

            it('Update on open', function() {
              var sector = view.el;
              var props = sector.querySelector('.properties');
              model.set('open', false);
              sector.classList.contains('open').should.equal(false);
              props.style.display.should.equal('none');
            });

            it('Toggle on click', function() {
              var sector = view.el;
              view.$el.find('.title').click();
              sector.classList.contains('open').should.equal(false);
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
                sector.querySelector('.title').innerHTML.should.contain('TestName');
                props.should.be.ok;
                sector.classList.contains('open').should.equal(false);
                props.style.display.should.equal('none');
              });

              it('Has properties', function() {
                var props = view.el.querySelector('.properties');
                props.children.length.should.equal(4); // Last one is 'clear' element
              });

            });

        });
      }
    };

});
