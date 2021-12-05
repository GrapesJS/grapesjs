export default (editor, opt = {}) => {
  const c = opt;
  const dc = editor.DomComponents;
  const defaultType = dc.getType('default');
  const defaultModel = defaultType.model;
  const burgerType = 'burger-menu';

  dc.addType(burgerType, {
    model: defaultModel.extend({
      defaults: {
        ...defaultModel.prototype.defaults,
        'custom-name': c.labelBurger,
        draggable: false,
        droppable: false,
        copyable: false,
        removable: false,
        script: function () {
          var transEndAdded;
          var isAnimating = 0;
          var stringCollapse = 'gjs-collapse';
          var clickEvent = 'click';
          var transitProp = 'max-height';
          var transitTiming = 'ease-in-out';
          var transitSpeed = 0.25;

          var getTransitionEvent = function() {
            var t, el = document.createElement('void');
            var transitions = {
              'transition': 'transitionend',
              'OTransition': 'oTransitionEnd',
              'MozTransition': 'transitionend',
              'WebkitTransition': 'webkitTransitionEnd'
            }

            for (t in transitions) {
              if (el.style[t] !== undefined){
                return transitions[t];
              }
            }
          }

          var transitEndEvent = getTransitionEvent();

          var getElHeight = function(el) {
            var style = window.getComputedStyle(el);
            var elDisplay = style.display;
            var elPos = style.position;
            var elVis = style.visibility;
            var currentHeight = style.height;
            var elMaxHeight = parseInt(style[transitProp]);

            if (elDisplay !== 'none' && elMaxHeight !== '0') {
              return el.offsetHeight;
            }

            el.style.height = 'auto';
            el.style.display = 'block';
            el.style.position = 'absolute';
            el.style.visibility = 'hidden';
            var height = el.offsetHeight;
            el.style.height = '';
            el.style.display = '';
            el.style.position = '';
            el.style.visibility = '';

            return height;
          };

          var toggleSlide = function(el) {
            isAnimating = 1;
            var elMaxHeight = getElHeight(el);
            var elStyle = el.style;
            elStyle.display = 'block';
            elStyle.transition = transitProp + ' ' + transitSpeed + 's ' + transitTiming;
            elStyle.overflowY = 'hidden';

            if (elStyle[transitProp] == '') {
              elStyle[transitProp] = 0;
            }

            if (parseInt(elStyle[transitProp]) == 0) {
              elStyle[transitProp] = '0';
              setTimeout(function() {
                  elStyle[transitProp] = elMaxHeight + 'px';
              }, 10);
            } else {
              elStyle[transitProp] = '0';
            }
          }

          var toggle = function(e) {
            e.preventDefault();

            if (isAnimating) {
              return;
            }

            var navParent = this.closest(`[data-gjs=navbar]`);
            var navItems = navParent.querySelector(`[data-gjs=navbar-items]`);
            toggleSlide(navItems);

            if (!transEndAdded) {
              navItems.addEventListener(transitEndEvent, function() {
                isAnimating = 0;
                var itemsStyle = navItems.style;
                if (parseInt(itemsStyle[transitProp]) == 0) {
                  itemsStyle.display = '';
                  itemsStyle[transitProp] = '';
                }
              });
              transEndAdded = 1;
            }
          };

          if ( !(stringCollapse in this ) ) {
            this.addEventListener(clickEvent, toggle);
          }

          this[stringCollapse] = 1;
        },
      },
    }, {
      isComponent(el) {
        if(el.getAttribute &&
          el.getAttribute('data-gjs-type') == burgerType) {
          return {type: burgerType};
        }
      },
    }),
    view: defaultType.view,
  });
}
