import { isObject, isString, each, isUndefined } from 'underscore';

export default ({ $, Backbone }) => {
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

      eventMap.push({ eventName, selector, listener });
      return this;
    };

    ViewProt.undelegateEvents = function() {
      const vid = '.delegateEvents' + this.cid;
      if (this.$el) {
        //this.$el.off(); return this;
        let eventMap = eventNsMap[vid];

        if (eventMap) {
          eventMap.forEach(({ eventName, selector, listener }) => {
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
        eventMap.forEach(({ eventName, selector, listener }) => {
          if (eventName == ev && selector == sel) {
            this.$el.off(eventName);
          }
        });
      }

      return this;
    };
  }

  if ($ && $.prototype.constructor.name !== 'jQuery') {
    const fn = $.fn;

    const splitNamespace = function(name) {
      const namespaceArray = name.split('.');
      return name.indexOf('.') !== 0
        ? [namespaceArray[0], namespaceArray.slice(1)]
        : [null, namespaceArray];
    };

    const on = $.prototype.on;
    const off = $.prototype.off;
    const trigger = $.prototype.trigger;
    const offset = $.prototype.offset;
    const getEvents = eventName => eventName.split(/[,\s]+/g);
    const getNamespaces = eventName => eventName.split('.');

    fn.on = function(eventName, delegate, callback, runOnce) {
      if (typeof eventName == 'string') {
        const events = getEvents(eventName);

        if (events.length == 1) {
          eventName = events[0];
          let namespaces = getNamespaces(eventName);

          if (eventName.indexOf('.') !== 0) {
            eventName = namespaces[0];
          }

          namespaces = namespaces.slice(1);

          if (namespaces.length) {
            //console.log('Found event with namespaces', namespaces, eventName, delegate, this);
            const cashNs = this.data('_cashNs') || [];
            // cashNs[namespace]
            this.data('_cashNs', namespaces); // for each ns need to store '.store' => eventName, delegate, callback
          }

          return on.call(this, eventName, delegate, callback, runOnce);
        } else {
          events.forEach(eventName =>
            this.on(eventName, delegate, callback, runOnce)
          );
          return this;
        }
      } else {
        return on.call(this, eventName, delegate, callback, runOnce);
      }
    };

    fn.off = function(eventName, callback) {
      if (typeof eventName == 'string') {
        const events = getEvents(eventName);

        if (events.length == 1) {
          eventName = events[0];
          let namespaces = getNamespaces(eventName);

          if (eventName.indexOf('.') !== 0) {
            eventName = namespaces[0];
          }

          namespaces = namespaces.slice(1);

          if (namespaces.length) {
            // Have to off only with the same namespace
          }

          return off.call(this, eventName, callback);
        } else {
          events.forEach(eventName => this.off(eventName, callback));
          return this;
        }
      } else {
        return off.call(this, eventName, callback);
      }
    };

    fn.trigger = function(eventName, data) {
      if (eventName instanceof $.Event) {
        return this.trigger(eventName.type, data);
      }

      if (typeof eventName == 'string') {
        const events = getEvents(eventName);

        if (events.length == 1) {
          eventName = events[0];
          let namespaces = getNamespaces(eventName);

          if (eventName.indexOf('.') !== 0) {
            eventName = namespaces[0];
          }

          namespaces = namespaces.slice(1);

          if (namespaces.length) {
            // have to trigger with same namespaces and eventName
          }

          return trigger.call(this, eventName, data);
        } else {
          events.forEach(eventName => this.trigger(eventName, data));
          return this;
        }
      } else {
        return trigger.call(this, eventName, data);
      }
    };

    fn.hide = function() {
      return this.css('display', 'none');
    };

    fn.show = function() {
      return this.css('display', 'block');
    };

    fn.focus = function() {
      const el = this.get(0);
      el && el.focus();
      return this;
    };

    // For SVGs in IE
    (fn.removeClass = function(c) {
      if (!arguments.length) {
        return this.attr('class', '');
      }
      const classes = isString(c) && c.match(/\S+/g);
      return classes
        ? this.each(function(el) {
            each(classes, function(c) {
              if (el.classList) {
                el.classList.remove(c);
              } else {
                const val = el.className;
                const bval = el.className.baseVal;

                if (!isUndefined(bval)) {
                  val.baseVal = bval.replace(c, '');
                } else {
                  el.className = val.replace(c, '');
                }
              }
            });
          })
        : this;
    }),
      (fn.remove = function() {
        return this.each(node => {
          return node.parentNode && node.parentNode.removeChild(node);
        });
      }),
      // For spectrum compatibility
      (fn.bind = function(ev, h) {
        return this.on(ev, h);
      });

    fn.unbind = function(ev, h) {
      if (isObject(ev)) {
        for (let name in ev) {
          ev.hasOwnProperty(name) && this.off(name, ev[name]);
        }

        return this;
      } else {
        return this.off(ev, h);
      }
    };

    fn.click = function(h) {
      return h ? this.on('click', h) : this.trigger('click');
    };

    fn.change = function(h) {
      return h ? this.on('change', h) : this.trigger('change');
    };

    fn.keydown = function(h) {
      return h ? this.on('keydown', h) : this.trigger('keydown');
    };

    fn.delegate = function(selector, events, data, handler) {
      if (!handler) {
        handler = data;
      }

      return this.on(events, selector, function(e) {
        e.data = data;
        handler(e);
      });
    };

    fn.scrollLeft = function() {
      let el = this.get(0);
      el = el.nodeType == 9 ? el.defaultView : el;
      let win = el instanceof Window ? el : null;
      return win ? win.pageXOffset : el.scrollLeft || 0;
    };

    fn.scrollTop = function() {
      let el = this.get(0);
      el = el.nodeType == 9 ? el.defaultView : el;
      let win = el instanceof Window ? el : null;
      return win ? win.pageYOffset : el.scrollTop || 0;
    };

    fn.offset = function(coords) {
      let top, left;

      if (coords) {
        top = coords.top;
        left = coords.left;
      }

      if (typeof top != 'undefined') {
        this.css('top', `${top}px`);
      }
      if (typeof left != 'undefined') {
        this.css('left', `${left}px`);
      }

      return offset.call(this);
    };

    $.map = function(items, clb) {
      const ar = [];

      for (var i = 0; i < items.length; i++) {
        ar.push(clb(items[i], i));
      }

      return ar;
    };

    const indexOf = Array.prototype.indexOf;

    $.inArray = function(val, arr, i) {
      return arr == null ? -1 : indexOf.call(arr, val, i);
    };

    $.Event = function(src, props) {
      if (!(this instanceof $.Event)) {
        return new $.Event(src, props);
      }

      this.type = src;
      this.isDefaultPrevented = () => false;
    };
  }
};
