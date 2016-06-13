define(['backbone', './Properties', './PropertyFactory'],
	function(Backbone, Properties, PropertyFactory) {

		return Backbone.Model.extend({

			defaults: {
				id: '',
				name: '',
				open: true,
        buildProps: '',
        extendBuilded: 1,
				properties : [],
			},

      initialize: function(opts) {
        var o = opts || {};
        var props = [];
        var builded = this.buildProperties(o.buildProps);

        if(!builded)
          props = this.get('properties');
        else
          props = this.extendProperties(builded);

        this.set('properties', new Properties(props));
      },

      /**
       * Extend properties
       * @param {Array<Object>} props Start properties
       * @return {Array<Object>} Final props
       * @private
       */
      extendProperties: function(props){
        var pLen = props.length;
        var mProps = this.get('properties');
        var ext = this.get('extendBuilded');

        for (var i = 0, len = mProps.length; i < len; i++){
          var mProp = mProps[i];
          var found = 0;

          for(var j = 0; j < pLen; j++){
            var prop = props[j];
            if(mProp.property == prop.property){
              props[j] = ext ? _.extend(prop, mProp) : mProp;
              found = 1;
              continue;
            }
          }

          if(!found)
            props.push(mProp);
        }

        return props;
      },

      /**
       * Build properties
       * @param {Array<string>} propr Array of props as sting
       * @return {Array<Object>}
       * @private
       */
      buildProperties: function(props){
        var r;
        var buildP = props || [];

        if(!buildP.length)
          return;

        if(!this.propFactory)
         this.propFactory = new PropertyFactory();

        r = this.propFactory.build(buildP);

        return r;
      },

    });
});