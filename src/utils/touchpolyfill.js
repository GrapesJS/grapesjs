// polyfill touch functionality on browsers that have pointer functionality (that piece of trash internet explorer)
// this thing is mostly just a hack on handjs, but does the reverse
// cameron henlin, cam.henlin@gmail.com

// jslint directive
/*jslint browser: true, unparam: true, nomen: true*/
/*global HTMLBodyElement, HTMLDivElement, HTMLImageElement, HTMLUListElement, HTMLAnchorElement, HTMLLIElement, HTMLTableElement, HTMLSpanElement, HTMLCanvasElement, SVGElement*/

(function() {
  // We should start using 'use strict' as soon as we can get rid of the implied globals.
  // 'use strict';

  // the timestamp of the last touch event processed.
  // It is used to determine what touches should be in the changedTouches TouchList array.
  var lastHwTimestamp = 0,
    // whether or not to log events to console
    logToConsole = false,
    userAgent = navigator.userAgent,
    supportedEventsNames = [
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel',
      'touchleave'
    ],
    // commented out because not used
    // upperCaseEventsNames = ["TouchStart", "TouchMove", "TouchEnd", "TouchCancel", "TouchLeave"],
    previousTargets = {},
    // wraps a W3C compliant implementation of the "touches" TouchList
    touchesWrapper,
    // wraps a W3C compliant implementation of the "changedTouches" TouchList
    changedTouchesWrapper,
    // wraps a W3C compliant implementation of the "targetTouches" TouchList
    targetTouchesWrapper;

  // a constructor for an object that wraps a W3C compliant TouchList.
  function TouchListWrapper() {
    var touchList = []; // an array of W3C compliant Touch objects.

    // constructor for W3C compliant touch object
    // http://www.w3.org/TR/touch-events/
    function Touch(
      identifier,
      target,
      screenX,
      screenY,
      clientX,
      clientY,
      pageX,
      pageY
    ) {
      this.identifier = identifier;
      this.target = target;
      this.screenX = screenX;
      this.screenY = screenY;
      this.clientX = clientX;
      this.clientY = clientY;
      this.pageX = pageX;
      this.pageY = pageY;
    }

    // Search the TouchList for a Touch with the given identifier.
    // If it is found, return it.  Otherwise, return null;
    function getTouch(identifier) {
      var i;
      for (i = 0; i < touchList.length; i += 1) {
        if (touchList[i].identifier === identifier) {
          return touchList[i];
        }
      }
    }

    // If this is a new touch, add it to the TouchList.
    // If this is an existing touch, update it in the TouchList.
    function addUpdateTouch(touch) {
      var i;
      for (i = 0; i < touchList.length; i += 1) {
        if (touchList[i].identifier === touch.identifier) {
          touchList[i] = touch;
          return;
        }
      }
      // If we finished the loop, then this is a new touch.
      touchList.push(touch);
    }

    function removeTouch(identifier) {
      var i;
      for (i = 0; i < touchList.length; i += 1) {
        if (touchList[i].identifier === identifier) {
          touchList.splice(i, 1);
        }
      }
    }

    function clearTouches() {
      // According to http://stackoverflow.com/questions/1232040/how-to-empty-an-array-in-javascript
      // this is the fastest way to clear the array.
      while (touchList.length > 0) {
        touchList.pop();
      }
    }

    // Return true if the current TouchList object contains a touch at the specified screenX, clientY.
    // Returns false otherwise.
    // This is used to differentiate touches that have moved from those that haven't.
    function containsTouchAt(screenX, screenY) {
      var i;

      for (i = 0; i < touchList.length; i += 1) {
        if (
          touchList[i].screenX === screenX &&
          touchList[i].screenY === screenY
        ) {
          return true;
        }
      }

      return false;
    }

    // touchList is the actual W3C compliant TouchList object being emulated.
    this.touchList = touchList;

    this.Touch = Touch;
    this.getTouch = getTouch;
    this.addUpdateTouch = addUpdateTouch;
    this.removeTouch = removeTouch;
    this.clearTouches = clearTouches;
    this.containsTouchAt = containsTouchAt;
  }

  function touchesAreAtSameSpot(touch0, touch1) {
    return (
      touch0.screenX === touch1.screenX && touch0.screenY === touch1.screenY
    );
  }

  // polyfill custom event
  function CustomEvent(event, params) {
    var evt;
    params = params || {
      bubbles: false,
      cancelable: false,
      detail: undefined
    };
    evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(
      event,
      params.bubbles,
      params.cancelable,
      params.detail
    );
    return evt;
  }

  function checkPreventDefault(node) {
    while (node && !node.handJobjs_forcePreventDefault) {
      node = node.parentNode;
    }
    return !!node || window.handJobjs_forcePreventDefault;
  }

  // Touch events
  function generateTouchClonedEvent(
    sourceEvent,
    newName,
    canBubble,
    target,
    relatedTarget
  ) {
    var evObj, oldTouch, oldTarget;

    // Updates the targetTouches so that it contains the touches from the "touches" TouchList
    // that have the same target as the touch that triggered this event.
    function updateTargetTouches(thisTouchTarget, touchesTouchList) {
      var i, touch;

      targetTouchesWrapper.clearTouches();

      for (i = 0; i < touchesTouchList.length; i++) {
        touch = touchesTouchList[i];
        if (touch.target.isSameNode(thisTouchTarget)) {
          targetTouchesWrapper.addUpdateTouch(touch);
        }
      }
    }

    function touchHandler(event) {
      var eventType, oldTouch, touch, touchEvent, isTouchChanged;

      log('touch!');

      if (event.type === 'pointerdown') {
        eventType = 'touchstart';
      } else if (event.type === 'pointermove') {
        eventType = 'touchmove';
      } else {
        throw new Error(
          'touchHandler received invalid event type: ' +
            eventType +
            '. Valid event types are pointerdown and pointermove'
        );
      }
      log(eventType);

      touch = new touchesWrapper.Touch(
        event.pointerId,
        event.type === 'pointerdown' ? event.target : oldTarget,
        event.screenX,
        event.screenY,
        event.clientX,
        event.clientY,
        event.pageX,
        event.pageY
      );

      // Remove, from changedTouches, any Touch that is no longer being touched, or is being touched
      // in exactly the same place.
      // In order to make sure that simultaneous touches don't kick each other off of the changedTouches array
      // (because they are processed as different pointer events), skip this if the lastHwTimestamp hasn't increased.
      if (event.hwTimestamp > lastHwTimestamp) {
        (function() {
          var i, changedTouchList, changedTouch, matchingTouch, identifier;
          changedTouchList = changedTouchesWrapper.touchList;
          for (i = 0; i < changedTouchList.length; i += 1) {
            changedTouch = changedTouchList[i];
            identifier = changedTouch.identifier;
            matchingTouch = touchesWrapper.getTouch(identifier);

            if (
              !matchingTouch ||
              touchesAreAtSameSpot(matchingTouch, changedTouch)
            ) {
              changedTouchesWrapper.removeTouch(identifier);
            }
          }
        })();
      }

      log('generating touch cloned');

      touchesWrapper.addUpdateTouch(touch);
      changedTouchesWrapper.addUpdateTouch(touch);
      updateTargetTouches(touch.target, touchesWrapper.touchList);

      event.type = eventType;
      touchEvent = new CustomEvent(eventType, {
        bubbles: true,
        cancelable: true
      });

      touchEvent.touches = touchesWrapper.touchList;
      touchEvent.changedTouches = changedTouchesWrapper.touchList;
      touchEvent.targetTouches = targetTouchesWrapper.touchList;
      touchEvent.type = eventType;

      // Awesomely, I figured out how to keep track of the touches in the "Touches" TouchList using an array.
      // TODO: Do the same thing for the changedTouches and targetTouches properties of the TouchEvent.
      // TODONE! changedTouches is implemented.
      // TODONE! targetTouches is implemented.

      // The other members of the TouchEvent are altKey, metaKey, ctrlKey, and shiftKey

      return touchEvent;
    }

    function touchChangedHandler(event) {
      var eventType, touch, touchEvent;

      log('touchchanged!');
      event.changedTouches = [];
      event.changedTouches.length = 1;
      event.changedTouches[0] = event;
      event.changedTouches[0].identifier = event.pointerId;

      if (event.type === 'pointerup') {
        eventType = 'touchend';
      } else if (event.type === 'pointercancel') {
        eventType = 'touchcancel';
      } else if (event.type === 'pointerleave') {
        eventType = 'touchleave';
      }

      touch = new touchesWrapper.Touch(
        event.pointerId,
        oldTarget,
        event.screenX,
        event.screenY,
        event.clientX,
        event.clientY,
        event.pageX,
        event.pageY
      );

      // This is a new touch event if it happened at a greater time than the last touch event.
      // If it is a new touch event, clear out the changedTouches TouchList.
      if (event.hwTimestamp > lastHwTimestamp) {
        changedTouchesWrapper.clearTouches();
      }

      touchesWrapper.removeTouch(touch.identifier);
      changedTouchesWrapper.addUpdateTouch(touch);
      updateTargetTouches(touch.target, touchesWrapper.touchList);

      event.type = eventType;
      touchEvent = new CustomEvent(eventType, {
        bubbles: true,
        cancelable: true
      });
      touchEvent.touches = touchesWrapper.touchList;
      touchEvent.changedTouches = changedTouchesWrapper.touchList;
      touchEvent.targetTouches = targetTouchesWrapper.touchList;
      touchEvent.type = eventType;

      return touchEvent;
    }

    // An important difference between the MS pointer events and the W3C touch events
    // is that for pointer events except for pointerdown, all target the element that the touch
    // is over when the event is fired.
    // The W3C touch events target the element where the touch originally started.
    // Therefore, when these events are fired, we must make this change manually.
    if (sourceEvent.type !== 'pointerdown') {
      oldTouch = touchesWrapper.getTouch(sourceEvent.pointerId);
      oldTarget = oldTouch.target;
      sourceEvent.target = oldTarget;
    }

    if (
      sourceEvent.type === 'pointerdown' ||
      sourceEvent.type === 'pointermove'
    ) {
      evObj = touchHandler(sourceEvent);
    } else {
      evObj = touchChangedHandler(sourceEvent);
    }

    // PreventDefault
    evObj.preventDefault = function() {
      if (sourceEvent.preventDefault !== undefined) {
        sourceEvent.preventDefault();
      }
    };

    // Fire event
    log('dispatching!');
    sourceEvent.target.dispatchEvent(evObj);

    lastHwTimestamp = event.hwTimestamp;
  }

  function generateTouchEventProxy(
    name,
    touchPoint,
    target,
    eventObject,
    canBubble,
    relatedTarget
  ) {
    generateTouchClonedEvent(
      touchPoint,
      name,
      canBubble,
      target,
      relatedTarget
    );
  }

  function registerOrUnregisterEvent(item, name, func, enable) {
    log('registerOrUnregisterEvent');
    if (item.__handJobjsRegisteredEvents === undefined) {
      item.__handJobjsRegisteredEvents = [];
    }

    if (enable) {
      if (item.__handJobjsRegisteredEvents[name] !== undefined) {
        item.__handJobjsRegisteredEvents[name] += 1;
        return;
      }

      item.__handJobjsRegisteredEvents[name] = 1;
      log('adding event ' + name);
      item.addEventListener(name, func, false);
    } else {
      if (item.__handJobjsRegisteredEvents.indexOf(name) !== -1) {
        item.__handJobjsRegisteredEvents[name] -= 1;

        if (item.__handJobjsRegisteredEvents[name] !== 0) {
          return;
        }
      }
      log('removing event');
      item.removeEventListener(name, func);
      item.__handJobjsRegisteredEvents[name] = 0;
    }
  }

  function setTouchAware(item, eventName, enable) {
    var eventGenerator, targetEvent;

    function nameGenerator(name) {
      return name;
    } // easier than doing this right and replacing all the references

    log('setTouchAware ' + enable + ' ' + eventName);
    // Leaving tokens
    if (!item.__handJobjsGlobalRegisteredEvents) {
      item.__handJobjsGlobalRegisteredEvents = [];
    }
    if (enable) {
      if (item.__handJobjsGlobalRegisteredEvents[eventName] !== undefined) {
        item.__handJobjsGlobalRegisteredEvents[eventName] += 1;
        return;
      }
      item.__handJobjsGlobalRegisteredEvents[eventName] = 1;

      log(item.__handJobjsGlobalRegisteredEvents[eventName]);
    } else {
      if (item.__handJobjsGlobalRegisteredEvents[eventName] !== undefined) {
        item.__handJobjsGlobalRegisteredEvents[eventName] -= 1;
        if (item.__handJobjsGlobalRegisteredEvents[eventName] < 0) {
          item.__handJobjsGlobalRegisteredEvents[eventName] = 0;
        }
      }
    }

    eventGenerator = generateTouchClonedEvent;

    //switch (eventName) {
    //    case "touchenter":
    //      log("touchenter");
    //      break;
    //    case "touchleave":
    //      log("touchleave");
    targetEvent = nameGenerator(eventName);

    if (item['on' + targetEvent.toLowerCase()] !== undefined) {
      registerOrUnregisterEvent(
        item,
        targetEvent,
        function(evt) {
          eventGenerator(evt, eventName);
        },
        enable
      );
    }
    //        break;
    //}
  }

  // Intercept addEventListener calls by changing the prototype
  function interceptAddEventListener(root) {
    var current = root.prototype
      ? root.prototype.addEventListener
      : root.addEventListener;

    function customAddEventListener(name, func, capture) {
      log('customAddEventListener');
      log(name);

      if (supportedEventsNames.indexOf(name) !== -1) {
        log('setting touch aware...');
        setTouchAware(this, name, true);
      }
      current.call(this, name, func, capture);
    }

    log('intercepting add event listener!');
    log(root);

    if (root.prototype) {
      root.prototype.addEventListener = customAddEventListener;
    } else {
      root.addEventListener = customAddEventListener;
    }
  }

  function handleOtherEvent(eventObject, name) {
    log('handle other event');
    if (eventObject.preventManipulation) {
      eventObject.preventManipulation();
    }

    // TODO: JSLint found that touchPoint here is an implied global!
    generateTouchClonedEvent(touchPoint, name);
  }

  function removeTouchAware(item, eventName) {
    // If item is already touch aware, do nothing
    if (item.ontouchdown !== undefined) {
      return;
    }

    // Chrome, Firefox
    if (item.ontouchstart !== undefined) {
      switch (eventName.toLowerCase()) {
        case 'touchstart':
          item.removeEventListener('pointerdown', function(evt) {
            handleOtherEvent(evt, eventName);
          });
          break;
        case 'touchmove':
          item.removeEventListener('pointermove', function(evt) {
            handleOtherEvent(evt, eventName);
          });
          break;
        case 'touchend':
          item.removeEventListener('pointerup', function(evt) {
            handleOtherEvent(evt, eventName);
          });
          break;
        case 'touchcancel':
          item.removeEventListener('pointercancel', function(evt) {
            handleOtherEvent(evt, eventName);
          });
          break;
      }
    }
  }

  // Intercept removeEventListener calls by changing the prototype
  function interceptRemoveEventListener(root) {
    var current = root.prototype
      ? root.prototype.removeEventListener
      : root.removeEventListener;

    function customRemoveEventListener(name, func, capture) {
      // Branch when a PointerXXX is used
      if (supportedEventsNames.indexOf(name) !== -1) {
        removeTouchAware(this, name);
      }

      current.call(this, name, func, capture);
    }

    if (root.prototype) {
      root.prototype.removeEventListener = customRemoveEventListener;
    } else {
      root.removeEventListener = customRemoveEventListener;
    }
  }

  function checkEventRegistration(node, eventName) {
    log('checkEventRegistration');
    return (
      node.__handJobjsGlobalRegisteredEvents &&
      node.__handJobjsGlobalRegisteredEvents[eventName]
    );
  }

  function findEventRegisteredNode(node, eventName) {
    log('findEventRegisteredNode');
    while (node && !checkEventRegistration(node, eventName)) {
      node = node.parentNode;
    }
    if (node) {
      return node;
    }
    if (checkEventRegistration(window, eventName)) {
      return window;
    }
  }

  function generateTouchEventProxyIfRegistered(
    eventName,
    touchPoint,
    target,
    eventObject,
    canBubble,
    relatedTarget
  ) {
    // Check if user registered this event
    log('generateTouchEventProxyIfRegistered');
    if (findEventRegisteredNode(target, eventName)) {
      generateTouchEventProxy(
        eventName,
        touchPoint,
        target,
        eventObject,
        canBubble,
        relatedTarget
      );
    }
  }

  function getDomUpperHierarchy(node) {
    var nodes = [];
    if (node) {
      nodes.unshift(node);
      while (node.parentNode) {
        nodes.unshift(node.parentNode);
        node = node.parentNode;
      }
    }
    return nodes;
  }

  function getFirstCommonNode(node1, node2) {
    var parents1 = getDomUpperHierarchy(node1),
      parents2 = getDomUpperHierarchy(node2),
      lastmatch = null;

    while (parents1.length > 0 && parents1[0] === parents2.shift()) {
      lastmatch = parents1.shift();
    }
    return lastmatch;
  }

  // generateProxy receives a node to dispatch the event
  function dispatchPointerEnter(currentTarget, relatedTarget, generateProxy) {
    log('dispatchPointerEnter');
    var commonParent = getFirstCommonNode(currentTarget, relatedTarget),
      node = currentTarget,
      nodelist = [];

    while (node && node !== commonParent) {
      // target range: this to the direct child of parent relatedTarget
      if (checkEventRegistration(node, 'touchenter')) {
        // check if any parent node has pointerenter
        nodelist.push(node);
      }
      node = node.parentNode;
    }
    while (nodelist.length > 0) {
      generateProxy(nodelist.pop());
    }
  }

  // generateProxy receives a node to dispatch the event
  function dispatchPointerLeave(currentTarget, relatedTarget, generateProxy) {
    log('dispatchPointerLeave');
    var commonParent = getFirstCommonNode(currentTarget, relatedTarget),
      node = currentTarget;
    while (node && node !== commonParent) {
      //target range: this to the direct child of parent relatedTarget
      if (checkEventRegistration(node, 'touchleave')) {
        // check if any parent node has pointerleave
        generateProxy(node);
      }
      node = node.parentNode;
    }
  }

  function log(s) {
    if (logToConsole) {
      console.log(s.toString());
    }
  }

  CustomEvent.prototype = window.Event.prototype;

  if (typeof window.ontouchstart === 'object') {
    return;
  }

  if (
    userAgent.match(/iPad/i) ||
    userAgent.match(/iPhone/i) ||
    userAgent.match(/iPod/i) ||
    userAgent.match(/Android/i) ||
    (userAgent.match(/MSIE/i) && !userAgent.match(/Touch/i))
  ) {
    return;
  }

  // Add CSS to disable MS IE default scrolling functionality.
  (function() {
    var css = 'html { -ms-touch-action: none; }',
      head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
  })();

  touchesWrapper = new TouchListWrapper();
  changedTouchesWrapper = new TouchListWrapper();
  targetTouchesWrapper = new TouchListWrapper();

  window.CustomEvent = CustomEvent;

  // Hooks
  interceptAddEventListener(window);
  interceptAddEventListener(window.HTMLElement || window.Element);
  interceptAddEventListener(document);
  interceptAddEventListener(HTMLBodyElement);
  interceptAddEventListener(HTMLDivElement);
  interceptAddEventListener(HTMLImageElement);
  interceptAddEventListener(HTMLUListElement);
  interceptAddEventListener(HTMLAnchorElement);
  interceptAddEventListener(HTMLLIElement);
  interceptAddEventListener(HTMLTableElement);
  if (window.HTMLSpanElement) {
    interceptAddEventListener(HTMLSpanElement);
  }
  if (window.HTMLCanvasElement) {
    interceptAddEventListener(HTMLCanvasElement);
  }
  if (window.SVGElement) {
    interceptAddEventListener(SVGElement);
  }

  interceptRemoveEventListener(window);
  interceptRemoveEventListener(window.HTMLElement || window.Element);
  interceptRemoveEventListener(document);
  interceptRemoveEventListener(HTMLBodyElement);
  interceptRemoveEventListener(HTMLDivElement);
  interceptRemoveEventListener(HTMLImageElement);
  interceptRemoveEventListener(HTMLUListElement);
  interceptRemoveEventListener(HTMLAnchorElement);
  interceptRemoveEventListener(HTMLLIElement);
  interceptRemoveEventListener(HTMLTableElement);
  if (window.HTMLSpanElement) {
    interceptRemoveEventListener(HTMLSpanElement);
  }
  if (window.HTMLCanvasElement) {
    interceptRemoveEventListener(HTMLCanvasElement);
  }
  if (window.SVGElement) {
    interceptRemoveEventListener(SVGElement);
  }

  (function() {
    // Returns true if and only if the event should be ignored.
    function ignorePointerEvent(event) {
      // Don't interpret mouse pointers as touches
      if (event.pointerType === 'mouse') {
        return true;
      }
      // Don't interpret pointerdown events on the scrollbars as touch events.
      // It appears to be the case that when the event is on the scrollbar in IE,
      // event.x === 0 and event.y === 0
      if (event.type === 'pointerdown' && event.x === 0 && event.y === 0) {
        return true;
      }
      // A user reported that when the input type is 'pen', the pointermove event fires with a pressure of 0
      // before the pen touches the screen.  We want to ignore this.
      if (
        event.pointerType === 'pen' &&
        event.pressure === 0 &&
        event.type === 'pointermove'
      ) {
        return true;
      }
      return false;
    }

    // Handling move on window to detect pointerleave/out/over
    window.addEventListener('pointerdown', function(eventObject) {
      log('pointerdownfired');
      var touchPoint = eventObject;

      if (ignorePointerEvent(eventObject)) {
        return;
      }

      previousTargets[touchPoint.identifier] = touchPoint.target;
      generateTouchEventProxyIfRegistered(
        'touchenter',
        touchPoint,
        touchPoint.target,
        eventObject,
        true
      );

      // pointerenter should not be bubbled
      dispatchPointerEnter(touchPoint.target, null, function(targetNode) {
        generateTouchEventProxy(
          'touchenter',
          touchPoint,
          targetNode,
          eventObject,
          false
        );
      });

      generateTouchEventProxyIfRegistered(
        'touchstart',
        touchPoint,
        touchPoint.target,
        eventObject,
        true
      );
    });

    window.addEventListener('pointerup', function(eventObject) {
      var touchPoint = eventObject,
        currentTarget = previousTargets[touchPoint.identifier];

      log('pointer up fired');

      if (ignorePointerEvent(eventObject)) {
        return;
      }

      generateTouchEventProxyIfRegistered(
        'touchend',
        touchPoint,
        currentTarget,
        eventObject,
        true
      );
      generateTouchEventProxyIfRegistered(
        'touchleave',
        touchPoint,
        currentTarget,
        eventObject,
        true
      );

      //pointerleave should not be bubbled
      dispatchPointerLeave(currentTarget, null, function(targetNode) {
        generateTouchEventProxy(
          'touchleave',
          touchPoint,
          targetNode,
          eventObject,
          false
        );
      });
    });

    window.addEventListener('pointermove', function(eventObject) {
      var touchPoint = eventObject,
        currentTarget = previousTargets[touchPoint.identifier];

      log('pointer move fired');

      if (ignorePointerEvent(eventObject)) {
        return;
      }

      log('x: ' + eventObject.screenX + ', y: ' + eventObject.screenY);

      // pointermove fires over and over when a touch-point stays stationary.
      // This is at odds with the other browsers that implement the W3C standard touch events
      // which fire touchmove only when the touch-point actually moves.
      // Therefore, return without doing anything if the pointermove event fired for a touch
      // that hasn't moved.
      if (
        touchesWrapper.containsTouchAt(eventObject.screenX, eventObject.screenY)
      ) {
        return;
      }

      // If force preventDefault
      if (currentTarget && checkPreventDefault(currentTarget) === true) {
        eventObject.preventDefault();
      }

      generateTouchEventProxyIfRegistered(
        'touchmove',
        touchPoint,
        currentTarget,
        eventObject,
        true
      );
    });
  })();
})();
