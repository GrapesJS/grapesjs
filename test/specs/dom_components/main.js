var modulePath = './../../../test/specs/dom_components';

define([
				'DomComponents',
				 modulePath + '/model/Component',
				 modulePath + '/view/ComponentV',
				 modulePath + '/view/ComponentsView',
				 modulePath + '/view/ComponentTextView',
				 modulePath + '/view/ComponentImageView',
				 './../test_utils.js'
				 ],
	function(DomComponents,
					ComponentModels,
					ComponentView,
					ComponentsView,
					ComponentTextView,
					ComponentImageView,
					utils
					) {

		describe('DOM Components', function() {

			describe('Main', function() {

				var obj;
				var config;
				var storagMock = utils.storageMock();
				var editorModel = {
					getHtml: function(){return 'testHtml';},
					getComponents: function(){return {test: 1};},
					getCacheLoad: function(){
						return storagMock.load();
					}
				};
				// Methods
				var setSmConfig = function(){
					config.stm = storagMock;
					config.stm.getConfig =  function(){
						return {
							storeHtml: 1,
							storeComponents: 1,
						}
					};
				};
				var setEm = function(){
					config.em = editorModel;
				}


				beforeEach(function () {
					config = {};
					obj = new DomComponents().init(config);
				});

				afterEach(function () {
					delete obj;
				});

				it('Object exists', function() {
					DomComponents.should.be.exist;
				});

				it('storageKey returns array', function() {
					obj.storageKey().should.be.instanceOf(Array);
				});

				it('storageKey returns correct composition', function() {
					config.stm = {
						getConfig: function(){
							return {
								storeHtml: 1,
								storeComponents: 1,
							}
						}
					};
					obj.storageKey().should.eql(['html', 'components']);
				});

				it('Store data', function() {
					setSmConfig();
					setEm();
					var expected = {
						html: 'testHtml',
						components: '{"test":1}',
					};
					obj.store(1).should.deep.equal(expected);
				});

				it('Store and load data', function() {
					setSmConfig();
					setEm();
					obj.store();
					// Load object between html and components
					obj.load().should.deep.equal({test: 1});
				});

				it('Wrapper exists', function() {
					obj.getWrapper().should.not.be.empty;
				});

				it('No components inside', function() {
					obj.getComponents().length.should.equal(0);
				});

				it('Add new component', function() {
					var comp = obj.addComponent({});
					obj.getComponents().length.should.equal(1);
				});

				it('Add more components at once', function() {
					var comp = obj.addComponent([{},{}]);
					obj.getComponents().length.should.equal(2);
				});

				it('Render wrapper', function() {
					obj.render().should.be.ok;
				});

				it('Add components at init', function() {
					obj = new DomComponents().init({
						components : [{}, {}, {}]
					});
					obj.getComponents().length.should.equal(3);
				});

			});

			ComponentModels.run();
			ComponentView.run();
			ComponentsView.run();
			ComponentTextView.run();
			ComponentImageView.run();

		});
});