var path = 'ClassManager/model/';
define([path + 'ClassTag',
        path + 'ClassTags'],
	function(ClassTag, ClassTags) {

    return {
      run : function(){
          describe('ClassTag', function() {

            beforeEach(function () {
              this.obj  = new ClassTag();
            });

            afterEach(function () {
              delete this.obj;
            });

            it('Has name property', function() {
              this.obj.has('name').should.equal(true);
            });

            it('Has label property', function() {
              this.obj.has('label').should.equal(true);
            });

            it('escapeName test', function() {
              this.obj.escapeName('@Te sT*').should.equal('-te-st-');
            });

        });
        describe('ClassTags', function() {

            it('Creates collection item correctly', function() {
              var c = new ClassTags();
              var m = c.add({});
              m.should.be.an.instanceOf(ClassTag);
            });

        });
      }
    };

});