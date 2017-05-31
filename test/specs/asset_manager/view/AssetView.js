define(function(require, exports, module){
  'use strict';
  var AssetView = require('AssetManager/view/AssetView');
  var Asset = require('AssetManager/model/Asset');
  var Assets = require('AssetManager/model/Assets');

		module.exports = {
			run: function() {

				describe('AssetView', function() {

					before(function () {
						this.$fixtures 	= $("#fixtures");
						this.$fixture 	= $('<div class="asset-fixture"></div>');
					});

					beforeEach(function () {
						var coll 	= new Assets();
						var model = coll.add({src: 'test'});
						this.view = new AssetView({
							config : {},
							model: model
						});
						this.$fixture.empty().appendTo(this.$fixtures);
						this.$fixture.html(this.view.render().el);
					});

					afterEach(function () {
						this.view.remove();
					});

					after(function () {
						this.$fixture.remove();
					});

					it('Object exists', function() {
						AssetView.should.be.exist;
					});

					it('Has correct prefix', function() {
						this.view.pfx.should.equal('');
					});

				});

			}
		}
});