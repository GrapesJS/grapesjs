module.exports = ({$, Backbone}) => {
  if (Backbone) {
    const ViewProt = Backbone.View.prototype;
    const eventNsMap = {};
    ViewProt.eventNsMap = eventNsMap;

    ViewProt.delegate = function(eventName, selector, listener) {
      const vid = '.delegateEvents' + this.cid;
      this.$el.on(eventName, selector, listener);
      //return this;
      let eventMap = eventNsMap[vid];

      if (!eventMap) {
        eventMap = [];
        eventNsMap[vid] = eventMap;
      }

      eventMap.push({eventName, selector, listener});
      return this;
    };

    ViewProt.undelegateEvents = function() {
      const vid = '.delegateEvents' + this.cid;
      if (this.$el) {
        //this.$el.off(); return this;
        let eventMap = eventNsMap[vid];

        if (eventMap) {
          eventMap.forEach(({eventName, selector, listener}) => {
            this.$el.off(eventName);
          });
        }
      }
      return this;
    };

    ViewProt.undelegate = function(ev, sel, list) {
      const vid = '.delegateEvents' + this.cid;
      //this.$el.off(ev, sel, list); return this;
      let eventMap = eventNsMap[vid];

      if (eventMap) {
        eventMap.forEach(({eventName, selector, listener}) => {
          if (eventName == ev && selector == sel) {
            this.$el.off(eventName);
          }
        });
      }

      return this;
    };
  }

  if ($) {
    const fn = $.fn;
    fn.hide = function() {
      return this.css('display', 'none');
    }

    fn.show = function() {
      return this.css('display', 'block');
    }

    fn.focus = function() {
      const el = this.get(0);
      el && el.focus();
      return this;
    }

    // For spectrum compatibility
    fn.bind = function(ev, h) {
      return this.on(ev, h);
    }

    fn.click = function(h) {
      return this.on('click', h);
    }

    fn.change = function(h) {
      return this.on('change', h);
    }

    fn.keydown = function(h) {
      return this.on('keydown', h);
    }

    fn.delegate = function(selector, events, data, handler) {
      if (!handler) {
        handler = data;
      }

      return this.on(events, selector, function(e) {
        e.data = data;
        handler(e);
      });
    }

    $.map = function(items, clb) {
      const ar = [];

      for (var i = 0; i < items.length; i++) {
        ar.push(clb(items[i], i));
      }

      return ar;
    }

    $.inArray = function(val, arr) {
      return arr.indexOf(val);
    }
  }
}
