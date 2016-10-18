var path = 'Panels/model/';
define([path + 'Button',
        path + 'Buttons',
        path + 'Panel',
        path + 'Panels'],
	function(Button, Buttons, Panel, Panels) {

    return {
      run : function(){
        describe('Button', function() {

          var obj;

          beforeEach(function () {
            obj = new Button();
          });

          afterEach(function () {
            delete obj;
          });

          it('Has buttons instance', function() {
            obj.has('buttons').should.equal(true);
          });

          it('Has no buttons', function() {
            obj.get('buttons').length.should.equal(0);
          });

          it('Init with other buttons inside correctly', function() {
            obj = new Button({
              buttons: [{}]
            });
            obj.get('buttons').should.be.instanceOf(Buttons);
            obj.get('buttons').length.should.equal(1);
          });

        });

        describe('Buttons', function() {
          var obj;

          beforeEach(function () {
            obj = new Buttons();
          });

          afterEach(function () {
            delete obj;
          });

          it('Deactivates buttons', function() {
            obj.add({ active: true });
            obj.deactivateAll();
            obj.at(0).get('active').should.equal(false);
          });

          it('Deactivates buttons with context', function() {
            obj.add({ active: true });
            obj.deactivateAll('someContext');
            obj.at(0).get('active').should.equal(true);
          });

          it('Deactivates except one', function() {
            var btn = obj.add({ active: true });
            obj.deactivateAllExceptOne();
            obj.at(0).get('active').should.equal(false);
          });

          it('Deactivates except one with model', function() {
            var btn = obj.add({ active: true });
            obj.deactivateAllExceptOne(btn);
            obj.at(0).get('active').should.equal(true);
          });

        });

        describe('Panel', function() {
          var obj;

          beforeEach(function () {
            obj = new Panel();
          });

          afterEach(function () {
            delete obj;
          });

          it('Has buttons instance', function() {
            obj.has('buttons').should.equal(true);
            obj.get('buttons').should.be.instanceOf(Buttons);
          });

          it('Has no buttons', function() {
            obj.get('buttons').length.should.equal(0);
          });

          it('Init with buttons inside correctly', function() {
            obj = new Panel({
              buttons: [{}]
            });
            obj.get('buttons').should.be.instanceOf(Buttons);
            obj.get('buttons').length.should.equal(1);
          });

        });

        describe('Panels', function() {
          var obj;

          beforeEach(function () {
            obj = new Panel();
          });

          afterEach(function () {
            delete obj;
          });

        });

      }
    };

});