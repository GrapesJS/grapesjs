define(['./Component'],
  function (Component) {

    return Component.extend({

      defaults: _.extend({}, Component.prototype.defaults, {
        type: 'image',
        tagName: 'img',
        src: '',
        void: 1,
        droppable: false,
        resizable: true,
        traits: ['alt',{type:'color', name:'color'}]
      }),

      initialize: function(o, opt) {
        Component.prototype.initialize.apply(this, arguments);
        var attr = this.get('attributes');
        if(attr.src)
          this.set('src', attr.src);
      },

      initToolbar: function() {
        Component.prototype.initToolbar.apply(this, arguments);

        if (this.sm && this.sm.get) {
          var cmd = this.sm.get('Commands');
          var cmdName = 'image-editor';

          // Add Image Editor button only if the default command exists
          if (cmd.has(cmdName)) {
            var tb = this.get('toolbar');
            tb.push({
              attributes: {class: 'fa fa-pencil'},
              command: cmdName,
            });
            this.set('toolbar', tb);
          }
        }
      },

      /**
       * Returns object of attributes for HTML
       * @return {Object}
       * @private
       */
      getAttrToHTML: function() {
        var attr = Component.prototype.getAttrToHTML.apply(this, arguments);
        delete attr.onmousedown;
        var src = this.get('src');
        if(src)
          attr.src = src;
        return attr;
      },

      /**
       * Parse uri
       * @param  {string} uri
       * @return {object}
       * @private
       */
      parseUri: function(uri) {
        var el = document.createElement('a');
        el.href = uri;
        var query = {};
        var qrs = el.search.substring(1).split('&');
        for (var i = 0; i < qrs.length; i++) {
          var pair = qrs[i].split('=');
          var name = decodeURIComponent(pair[0]);
          if(name)
            query[name] = decodeURIComponent(pair[1]);
        }
        return {
          hostname: el.hostname,
          pathname: el.pathname,
          protocol: el.protocol,
          search: el.search,
          hash: el.hash,
          port: el.port,
          query: query,
        };
      },

    },{

      /**
       * Detect if the passed element is a valid component.
       * In case the element is valid an object abstracted
       * from the element will be returned
       * @param {HTMLElement}
       * @return {Object}
       * @private
       */
      isComponent: function(el) {
        var result = '';
        if(el.tagName == 'IMG'){
          result = {type: 'image'};
        }
        return result;
      },

    });
});
