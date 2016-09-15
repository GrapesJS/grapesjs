define(['backbone','./Trait'],
  function (Backbone, Trait) {

    return Backbone.Collection.extend({

      model: Trait,

      add: function(models, opt){
				if(typeof models === 'string'){
	         //TraitFactory('href')
				}

				return Backbone.Collection.prototype.add.apply(this, [models, opt]);
			},

    });
});
