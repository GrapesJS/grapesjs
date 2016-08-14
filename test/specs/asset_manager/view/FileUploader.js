define(['AssetManager/view/FileUploader'],
	function(FileUploader) {

		return {
			run: function() {

				describe('File Uploader', function() {

					before(function () {
						this.$fixtures 	= $("#fixtures");
						this.$fixture 	= $('<div class="fileupload-fixture"></div>');
					});

					beforeEach(function () {
						this.view = new FileUploader({ config : {} });
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
						FileUploader.should.be.exist;
					});

					it('Has correct prefix', function() {
						this.view.pfx.should.equal('');
					});

					describe('Should be rendered correctly', function() {

							it('Has title', function() {
								this.view.$el.find('#title').should.have.property(0);
							});

							it('Title is empty', function() {
								this.view.$el.find('#title').html().should.equal('');
							});

							it('Has file input', function() {
								this.view.$el.find('input[type=file]').should.have.property(0);
							});

							it('File input is enabled', function() {
								this.view.$el.find('input[type=file]').prop('disabled').should.equal(true);
							});

					});

					describe('Interprets configurations correctly', function() {

							it('Has correct title', function() {
								var view = new FileUploader({ config : {
									uploadText : 'Test',
								} });
								view.render();
								view.$el.find('#title').html().should.equal('Test');
							});

							it('Could be disabled', function() {
								var view = new FileUploader({ config : {
									disableUpload: true,
								} });
								view.render();
								view.$el.find('input[type=file]').prop('disabled').should.equal(true);
							});

					});

				});
			}
		}
});