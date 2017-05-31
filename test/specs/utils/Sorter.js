define(function(require, exports, module){
  'use strict';
  var Sorter = require('undefined');

    module.exports = {
      run : function(){

        describe('Sorter', function() {
          var fixtures;
          var fixture;
          var obj;
          var parent;
          var plh;
          var html;

          before(function () {
            fixture = $('<div class="sorter-fixture"></div>').get(0);
          });

          beforeEach(function () {
            parent = document.createElement('div');
            parent.setAttribute('class', 'parent1');
            plh = document.createElement('div');
            document.body.appendChild(parent);
            obj = new Sorter({container: '.parent1'});
            document.body.appendChild(fixture);
            fixture.appendChild(parent);
            html = '<div id="el1" style="overflow: hidden;">'+
                      '<div id="el2">ba' +
                          '<p id="baa">baa</p>' +
                          '<span id="elspan">bab</span>' +
                          '<span id="bac" style="display:block;">bac</span>'+
                          '<div id="eldiv">eldiv</div>'+
                      '</div>' +
                  '</div>' +
                  '<div id="a">' +
                    '<div id="aa">aa' +
                        '<p id="aaa">aaa</p>' +
                        '<span id="aab">aab</span>' +
                        '<span id="aac" style="display:block;">aac</span>' +
                    '</div>' +
                    '<div id="ab" style="float: left;">ab</div>' +
                    '<div id="ac" style="position: absolute;">ac' +
                        '<div id="aca" style="float: left;">aca</div>' +
                        '<div id="acb">acb</div>' +
                    '</div>' +
                    '<div id="ad" style="overflow: hidden;">ad' +
                        '<p id="ada">ada</p>' +
                        '<span id="adb">adb</span>' +
                        '<span id="adc" style="display:block;">adc</span>' +
                    '</div>' +
                '</div>';
          });

          afterEach(function () {
            document.body.removeChild(fixture);
            delete obj;
            delete parent;
            delete html;
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

          it('isInFlow to overflow hidden', function(){
            parent.innerHTML = html;
            var el = parent.querySelector('#el1');
            obj.isInFlow(el).should.equal(false);
          });

          it('isInFlow inner to overflow', function(){
            parent.innerHTML = html;
            var el = parent.querySelector('#el2');
            if(!el){
              console.log('phantom issue');
              return;
            }
            obj.isInFlow(el).should.equal(true);
          });

          it('isInFlow for span', function(){
            parent.innerHTML = html;
            var el = parent.querySelector('#elspan');
            obj.isInFlow(el).should.equal(false);
          });

          it('isInFlow for div #a', function(){
            parent.innerHTML = html;
            var el = parent.querySelector('#a');
            if(!el){
              console.log('phantom issue');
              return;
            }
            obj.isInFlow(el).should.equal(true);
          });

          it('isInFlow for div #aa', function(){
            parent.innerHTML = html;
            var el = parent.querySelector('#aa');
            if(!el){
              console.log('phantom issue');
              return;
            }
            obj.isInFlow(el).should.equal(true);
          });

          it('isInFlow for p #aaa', function(){
            parent.innerHTML = html;
            var el = parent.querySelector('#aaa');
            if(!el){
              console.log('phantom issue');
              return;
            }
            obj.isInFlow(el).should.equal(true);
          });

          it('isInFlow for span #aab', function(){
            parent.innerHTML = html;
            var el = parent.querySelector('#aab');
            obj.isInFlow(el).should.equal(false);
          });

          it('isInFlow for span #aac with display block', function(){
            parent.innerHTML = html;
            var el = parent.querySelector('#aac');
            if(!el) // in phantom doesnt work
              return;
            obj.isInFlow(el).should.equal(true);
          });

          it('isInFlow for div #ab with float left', function(){
            parent.innerHTML = html;
            var el = parent.querySelector('#ab');
            obj.isInFlow(el).should.equal(false);
          });

          it('isInFlow for div #ac in absolute', function(){
            parent.innerHTML = html;
            var el = parent.querySelector('#ac');
            obj.isInFlow(el).should.equal(false);
          });

          it('isInFlow for div #acb inside absolute', function(){
            parent.innerHTML = html;
            var el = parent.querySelector('#acb');
            if(!el){
              console.log('phantom issue');
              return;
            }
            obj.isInFlow(el).should.equal(true);
          });

          it('isInFlow for div #ad overflow hidden', function(){
            parent.innerHTML = html;
            var el = parent.querySelector('#ad');
            obj.isInFlow(el).should.equal(false);
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

            var vertDims;
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

              vertDims = [
                [0, 0, 50, 100, true],
                [50, 0, 50, 100, true],
                [100, 0, 50, 100, true],
                [150, 0, 50, 70, true],
              ];
            });

            it('startSort inits correctly inits', function() {
              obj.startSort(el);
              obj.moved.should.equal(0);
              obj.plh.style.display.should.equal('none');
            });

            it('onMove', function() {
              var target = document.createElement('div');
              obj.startSort(el);
              obj.onMove({
                pageX: 0,
                pageY: 0,
                target: target
              });
              obj.moved.should.equal(1);
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

              beforeEach(function () {
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

            describe('movePlaceholder', function() {

              beforeEach(function () {
                vertDims = [
                  [0, 10, 50, 100, true],
                  [50, 20, 50, 70, true],
                  [100, 30, 50, 100, true],
                  [150, 40, 50, 70, true],
                ];
              });

              it('Vertical dimensions with before position', function() {
                var pos = {index: 2, method: 'before'};
                obj.movePlaceholder(plh, vertDims, pos);
                var style = plh.style;
                style.top.should.equal('100px');
                style.left.should.equal('30px');
                style.width.should.equal('100px');
              });

              it('Vertical dimensions with after position', function() {
                var pos = {index: 1, method: 'after'};
                obj.movePlaceholder(plh, vertDims, pos);
                var style = plh.style;
                style.top.should.equal('100px');
                style.left.should.equal('20px');
                style.width.should.equal('70px');
              });

            });

          });

        });

      }
    };

});