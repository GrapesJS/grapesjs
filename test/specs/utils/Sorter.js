var path = 'Utils/';
define([path + 'Sorter',],
  function(Sorter) {

    return {
      run : function(){

        describe('Sorter', function() {
          var obj;
          var parent;

          beforeEach(function () {
            parent = document.createElement('div');
            parent.setAttribute('class', 'parent1');
            document.body.appendChild(parent);
            obj = new Sorter({container: '.parent1'});
          });

          afterEach(function () {
            delete obj;
          });

          it('matches class', function() {
            var el = document.createElement('div');
            el.setAttribute('class', 'test test2');
            parent.appendChild(el);
            obj.matches(el, '.test').should.equal(true);
            obj.matches(el, '.test2').should.equal(true);
            obj.matches(el, '.test3').should.equal(false);
          });

          it('matches id', function() {
            var el = document.createElement('div');
            el.setAttribute('id', 'test2');
            parent.appendChild(el);
            obj.matches(el, '#test2').should.equal(true);
            obj.matches(el, '.test2').should.equal(false);
            obj.matches(el, '#test').should.equal(false);
          });

          it('matches tag', function() {
            var el = document.createElement('span');
            parent.appendChild(el);
            obj.matches(el, 'span').should.equal(true);
            obj.matches(el, 'div').should.equal(false);
            obj.matches(el, '*').should.equal(true);
          });

          it('Creates placeholder', function() {
            obj.createPlaceholder().className.should.equal('placeholder');
          });

          describe('Closest method', function() {
            var parent2;
            var parent3;

            beforeEach(function () {
              parent2 = document.createElement('span');
              parent2.setAttribute('class', 'parent2');
              parent3 = document.createElement('div');
              parent3.setAttribute('class', 'parent3');
              parent.appendChild(parent2);
              parent2.appendChild(parent3);
            });

            it('Closest by class', function() {
              var el = document.createElement('div');
              parent3.appendChild(el);
              obj.closest(el, '.parent2').should.deep.equal(parent2);
              obj.closest(el, '.parent3').should.deep.equal(parent3);
              obj.closest(el, '.parent1').should.deep.equal(parent);
            });

            it('Closest by tag', function() {
              var el = document.createElement('div');
              el.setAttribute('class', 'el');
              parent3.appendChild(el);
              obj.closest(el, 'span').should.deep.equal(parent2);
              obj.closest(el, 'div').should.deep.equal(parent3);
              obj.closest(el, '*').should.deep.equal(parent3);
            });

          });

          describe('With elements', function() {

            var parent2;
            var parent3;
            var sib1;
            var sib2;
            var sib3;
            var sib4;
            var el;

            beforeEach(function () {
              parent2 = document.createElement('span');
              parent2.setAttribute('class', 'parent2');
              parent3 = document.createElement('div');
              parent3.setAttribute('class', 'parent3');
              parent.appendChild(parent2);
              parent2.appendChild(parent3);
              el = document.createElement('div');
              el.setAttribute('class', 'el');
              parent3.appendChild(el);

              sib1 = document.createElement('div');
              sib2 = document.createElement('div');
              sib3 = document.createElement('div');
              sib4 = document.createElement('div');
              sib1.style.width = '100px';
              sib1.style.height = '50px';
              sib2.style.width = '100px';
              sib2.style.height = '50px';
              sib3.style.width = '100px';
              sib3.style.height = '50px';
              sib3.style.float = 'left';
              sib4.style.width = '70px';
              sib4.style.height = '50px';
              sib4.style.float = 'left';
              el.appendChild(sib1);
              el.appendChild(sib2);
              el.appendChild(sib3);
              el.appendChild(sib4);
            });

            it('startSort inits correctly inits', function() {
              obj.startSort(el);
              obj.plh.style.display.should.equal('none');
            });

            it.skip('onMove', function() {
              obj.startSort(el);
              obj.onMove({
                pageX: 0,
                pageY: 0,
              });
              obj.plh.style.display.should.equal('block');
            });

            it('getDim from element', function() {
              var subPos = obj.offset(sib1);
              var top = subPos.top;
              var left = subPos.left;
              var result = [top, left, 50, 100];
              obj.getDim(sib1).should.deep.equal(result);
            });

            it('getChildrenDim from element', function() {
              el.style.position = 'absolute';
              el.style.top = '0';
              var ch = obj.getChildrenDim(el);
              ch = ch.map(function(v){
                return v.slice(0, 5);
              });
              var subPos = obj.offset(sib1);
              var top = subPos.top;
              var left = subPos.left;
              var result = [
                [top, left, 50, 100, true],
                [top + 50, left + 0, 50, 100, true],
                [top + 100, left + 0, 50, 100, true],
                [top + 100, left + 100, 50, 70, true],
              ];
              ch.should.deep.equal(result);
            });

            it('nearBorders', function() {
              obj.borderOffset = 10;
              var dim = [0, 0, 100, 200];
              obj.nearBorders(dim, 20, 15).should.equal(false);
              obj.nearBorders(dim, 3, 4).should.equal(true);
              obj.nearBorders(dim, 500, 500).should.equal(true);
            });

            it('dimsFromTarget', function() {
              var child1 = document.createElement('div');
              var child2 = document.createElement('div');
              child1.style.width = '30px';
              child1.style.height = '30px';
              child2.style.width = '30px';
              child2.style.height = '20px';
              sib3.appendChild(child1);
              sib3.appendChild(child2);

              var subPos = obj.offset(sib1);
              var top = subPos.top;
              var left = subPos.left;
              var topSib3 = top + 100;
              var leftSib3 = left + 0;
              var resultParent = [
                [top, left, 50, 100, true],
                [top + 50, left + 0, 50, 100, true],
                [topSib3, leftSib3, 50, 100, true],
                [top + 100, left + 100, 50, 70, true],
              ];
              var resultChildren = [
                [topSib3, leftSib3, 30, 30, true],
                [topSib3 + 30, left + 0, 20, 30, true],
              ];

              var dims = obj.dimsFromTarget(sib3);
              dims = dims.map(function(v){
                return v.slice(0, 5);
              });
              dims.should.deep.equal(resultParent);

              // Inside target
              var dims = obj.dimsFromTarget(sib3, leftSib3 + 15, topSib3 + 15);
              dims = dims.map(function(v){
                return v.slice(0, 5);
              });
              dims.should.deep.equal(resultChildren);

              // Exactly on border
              var bOffset = obj.borderOffset;
              var dims = obj.dimsFromTarget(sib3, leftSib3 + bOffset, topSib3 + bOffset);
              dims = dims.map(function(v){
                return v.slice(0, 5);
              });
              dims.should.deep.equal(resultChildren);

              // Slightly near border
              var dims = obj.dimsFromTarget(sib3, leftSib3 + bOffset - 3, topSib3 + bOffset);
              dims = dims.map(function(v){
                return v.slice(0, 5);
              });
              dims.should.deep.equal(resultParent);
            });


            describe('findPosition', function() {

              var dimsTree;

              beforeEach(function () {
                vertDims = [
                  [0, 0, 50, 100, true],
                  [50, 0, 50, 100, true],
                  [100, 0, 50, 100, true],
                  [150, 0, 50, 70, true],
                ];
              });

              it('Vertical dimensions', function() {
                var result = {index: 0, method: 'before'};
                obj.findPosition(vertDims, -10, -10).should.deep.equal(result);
                obj.findPosition(vertDims, 0, 0).should.deep.equal(result);
                obj.findPosition(vertDims, 10, 10).should.deep.equal(result);

                var result = {index: 1, method: 'before'};
                obj.findPosition(vertDims, 10, 30).should.deep.equal(result);
                obj.findPosition(vertDims, 10, 70).should.deep.equal(result);

                var result = {index: 2, method: 'before'};
                obj.findPosition(vertDims, 10, 76).should.deep.equal(result);

                var result = {index: 3, method: 'before'};
                obj.findPosition(vertDims, 100, 140).should.deep.equal(result);
                obj.findPosition(vertDims, 100, 160).should.deep.equal(result);

                var result = {index: 3, method: 'after'};
                obj.findPosition(vertDims, 1000, 1000).should.deep.equal(result);
              });

            });

            it.skip('movePlaceholder', function() {
            });

            it.skip('move', function() {
              obj.move(el).should.equal('test');
            });

          });

        });

      }
    };

});