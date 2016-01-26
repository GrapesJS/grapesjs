(function (root, factory) {if (typeof define === 'function' && define.amd)define([], factory);else if(typeof exports === 'object' && typeof module === 'object')module.exports = mod();else root.grapesjs = root.GrapesJS = factory();}(this, function () {/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../vendor/almond/almond", function(){});

require.config({
	shim: {
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: [ 'underscore', 'jquery' ],
			exports: 'Backbone'
		},
		rte: {
			deps: [ 'jquery' ],
			exports: 'rte'
		},
		backboneUndo: {
			deps: ['backbone'],
			exports: 'backboneUndo'
		},
		keymaster: {
			exports: 'keymaster'
		},
	},

	paths: {
		jquery: 			'../vendor/jquery/jquery',
		underscore: 	'../vendor/underscore/underscore',
		backbone: 		'../vendor/backbone/backbone',
		backboneUndo: '../vendor/backbone-undo/backbone-undo',
		keymaster:		'../vendor/keymaster/keymaster',
		text: 				'../vendor/require-text/text',
		Spectrum: 		'../vendor/spectrum/spectrum',
		codemirror: 	'../vendor/codemirror',
		formatting: 	'../vendor/codemirror-formatting/formatting',
	},

	packages : 	[
		            {  name: 'AssetManager', 		location: 'asset_manager', 		},
		            {  name: 'StyleManager', 		location: 'style_manager', 		},
		            {  name: 'StorageManager', 	location: 'storage_manager', 	},
		            {  name: 'Navigator', 			location: 'navigator', 				},
		            {  name: 'DomComponents', 	location: 'dom_components', 	},
		            {  name: 'RichTextEditor', 	location: 'rich_text_editor', },
		            {  name: 'ModalDialog', 		location: 'modal_dialog', 		},
		            {  name: 'CodeManager', 		location: 'code_manager', 		},
		            {  name: 'Commands',				location: 'commands',					},
		            {  name: 'Canvas',					location: 'canvas',						},
		            {  name: 'Panels',					location: 'panels',						}
	]
});
define("src/config/require-config.js", function(){});

define('editor/config/config',[],function () {
	var config = {
			
		// Style prefix
		stylePrefix: 			'wte-',
		
		// Prefix to use inside local storage name
		storagePrefix: 			'wte-',
		
		// Editor ID. Useful in case of multiple editors on the same page
		id						: '',
		
		// Where render the editor
		container 				: '',
		
		idCanvas				: 'canvas',
		
		idCanvasOverlay			: 'canvas-overlay',
		
		idWrapper 				: 'wrapper',
		
		// Enable/Disable undo manager 
		undoManager 			: true,
		
		// Enable/Disable autosaving 
		autosave 				: true,		
		
		//Indicates which storage to use. Available: local | remote | none
		storageType				: 'local',
		
		// If autosave enabled, indicates how many changes (general changes to structure)
		// need to be done before save. Useful with remoteStorage to reduce remote calls
		changesBeforeSave: 1,				
		
		//Enabled only if localStorage is false
		remoteStorage			: {},
		
		//Configurations for Asset Manager
		assetManager			: {},
		
		//Configurations for Canvas
		canvas					: {},
		
		//Configurations for Style Manager
		styleManager			: {},
		
		//Configurations for Layers
		layers					: {},
		
		//Configurations for Storage Manager
		storageManager			: {},
		
		//Configurations for Rich Text Editor
		rte						: {},
		
		//Configurations for Components
		components				: {},
		
		//Configurations for Modal Dialog
		modal					: {},
		
		//Configurations for Code Manager
		codeManager				: {},
		
		//Configurations for Panels
		panels					: {},
		
		//Configurations for Commands
		commands				: {},
		
	};
	return config;
});
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function(){function n(n){function t(t,r,e,u,i,o){for(;i>=0&&o>i;i+=n){var a=u?u[i]:i;e=r(e,t[a],a,t)}return e}return function(r,e,u,i){e=b(e,i,4);var o=!k(r)&&m.keys(r),a=(o||r).length,c=n>0?0:a-1;return arguments.length<3&&(u=r[o?o[c]:c],c+=n),t(r,e,u,o,c,a)}}function t(n){return function(t,r,e){r=x(r,e);for(var u=O(t),i=n>0?0:u-1;i>=0&&u>i;i+=n)if(r(t[i],i,t))return i;return-1}}function r(n,t,r){return function(e,u,i){var o=0,a=O(e);if("number"==typeof i)n>0?o=i>=0?i:Math.max(i+a,o):a=i>=0?Math.min(i+1,a):i+a+1;else if(r&&i&&a)return i=r(e,u),e[i]===u?i:-1;if(u!==u)return i=t(l.call(e,o,a),m.isNaN),i>=0?i+o:-1;for(i=n>0?o:a-1;i>=0&&a>i;i+=n)if(e[i]===u)return i;return-1}}function e(n,t){var r=I.length,e=n.constructor,u=m.isFunction(e)&&e.prototype||a,i="constructor";for(m.has(n,i)&&!m.contains(t,i)&&t.push(i);r--;)i=I[r],i in n&&n[i]!==u[i]&&!m.contains(t,i)&&t.push(i)}var u=this,i=u._,o=Array.prototype,a=Object.prototype,c=Function.prototype,f=o.push,l=o.slice,s=a.toString,p=a.hasOwnProperty,h=Array.isArray,v=Object.keys,g=c.bind,y=Object.create,d=function(){},m=function(n){return n instanceof m?n:this instanceof m?void(this._wrapped=n):new m(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=m),exports._=m):u._=m,m.VERSION="1.8.3";var b=function(n,t,r){if(t===void 0)return n;switch(null==r?3:r){case 1:return function(r){return n.call(t,r)};case 2:return function(r,e){return n.call(t,r,e)};case 3:return function(r,e,u){return n.call(t,r,e,u)};case 4:return function(r,e,u,i){return n.call(t,r,e,u,i)}}return function(){return n.apply(t,arguments)}},x=function(n,t,r){return null==n?m.identity:m.isFunction(n)?b(n,t,r):m.isObject(n)?m.matcher(n):m.property(n)};m.iteratee=function(n,t){return x(n,t,1/0)};var _=function(n,t){return function(r){var e=arguments.length;if(2>e||null==r)return r;for(var u=1;e>u;u++)for(var i=arguments[u],o=n(i),a=o.length,c=0;a>c;c++){var f=o[c];t&&r[f]!==void 0||(r[f]=i[f])}return r}},j=function(n){if(!m.isObject(n))return{};if(y)return y(n);d.prototype=n;var t=new d;return d.prototype=null,t},w=function(n){return function(t){return null==t?void 0:t[n]}},A=Math.pow(2,53)-1,O=w("length"),k=function(n){var t=O(n);return"number"==typeof t&&t>=0&&A>=t};m.each=m.forEach=function(n,t,r){t=b(t,r);var e,u;if(k(n))for(e=0,u=n.length;u>e;e++)t(n[e],e,n);else{var i=m.keys(n);for(e=0,u=i.length;u>e;e++)t(n[i[e]],i[e],n)}return n},m.map=m.collect=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=Array(u),o=0;u>o;o++){var a=e?e[o]:o;i[o]=t(n[a],a,n)}return i},m.reduce=m.foldl=m.inject=n(1),m.reduceRight=m.foldr=n(-1),m.find=m.detect=function(n,t,r){var e;return e=k(n)?m.findIndex(n,t,r):m.findKey(n,t,r),e!==void 0&&e!==-1?n[e]:void 0},m.filter=m.select=function(n,t,r){var e=[];return t=x(t,r),m.each(n,function(n,r,u){t(n,r,u)&&e.push(n)}),e},m.reject=function(n,t,r){return m.filter(n,m.negate(x(t)),r)},m.every=m.all=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=0;u>i;i++){var o=e?e[i]:i;if(!t(n[o],o,n))return!1}return!0},m.some=m.any=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=0;u>i;i++){var o=e?e[i]:i;if(t(n[o],o,n))return!0}return!1},m.contains=m.includes=m.include=function(n,t,r,e){return k(n)||(n=m.values(n)),("number"!=typeof r||e)&&(r=0),m.indexOf(n,t,r)>=0},m.invoke=function(n,t){var r=l.call(arguments,2),e=m.isFunction(t);return m.map(n,function(n){var u=e?t:n[t];return null==u?u:u.apply(n,r)})},m.pluck=function(n,t){return m.map(n,m.property(t))},m.where=function(n,t){return m.filter(n,m.matcher(t))},m.findWhere=function(n,t){return m.find(n,m.matcher(t))},m.max=function(n,t,r){var e,u,i=-1/0,o=-1/0;if(null==t&&null!=n){n=k(n)?n:m.values(n);for(var a=0,c=n.length;c>a;a++)e=n[a],e>i&&(i=e)}else t=x(t,r),m.each(n,function(n,r,e){u=t(n,r,e),(u>o||u===-1/0&&i===-1/0)&&(i=n,o=u)});return i},m.min=function(n,t,r){var e,u,i=1/0,o=1/0;if(null==t&&null!=n){n=k(n)?n:m.values(n);for(var a=0,c=n.length;c>a;a++)e=n[a],i>e&&(i=e)}else t=x(t,r),m.each(n,function(n,r,e){u=t(n,r,e),(o>u||1/0===u&&1/0===i)&&(i=n,o=u)});return i},m.shuffle=function(n){for(var t,r=k(n)?n:m.values(n),e=r.length,u=Array(e),i=0;e>i;i++)t=m.random(0,i),t!==i&&(u[i]=u[t]),u[t]=r[i];return u},m.sample=function(n,t,r){return null==t||r?(k(n)||(n=m.values(n)),n[m.random(n.length-1)]):m.shuffle(n).slice(0,Math.max(0,t))},m.sortBy=function(n,t,r){return t=x(t,r),m.pluck(m.map(n,function(n,r,e){return{value:n,index:r,criteria:t(n,r,e)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var F=function(n){return function(t,r,e){var u={};return r=x(r,e),m.each(t,function(e,i){var o=r(e,i,t);n(u,e,o)}),u}};m.groupBy=F(function(n,t,r){m.has(n,r)?n[r].push(t):n[r]=[t]}),m.indexBy=F(function(n,t,r){n[r]=t}),m.countBy=F(function(n,t,r){m.has(n,r)?n[r]++:n[r]=1}),m.toArray=function(n){return n?m.isArray(n)?l.call(n):k(n)?m.map(n,m.identity):m.values(n):[]},m.size=function(n){return null==n?0:k(n)?n.length:m.keys(n).length},m.partition=function(n,t,r){t=x(t,r);var e=[],u=[];return m.each(n,function(n,r,i){(t(n,r,i)?e:u).push(n)}),[e,u]},m.first=m.head=m.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:m.initial(n,n.length-t)},m.initial=function(n,t,r){return l.call(n,0,Math.max(0,n.length-(null==t||r?1:t)))},m.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:m.rest(n,Math.max(0,n.length-t))},m.rest=m.tail=m.drop=function(n,t,r){return l.call(n,null==t||r?1:t)},m.compact=function(n){return m.filter(n,m.identity)};var S=function(n,t,r,e){for(var u=[],i=0,o=e||0,a=O(n);a>o;o++){var c=n[o];if(k(c)&&(m.isArray(c)||m.isArguments(c))){t||(c=S(c,t,r));var f=0,l=c.length;for(u.length+=l;l>f;)u[i++]=c[f++]}else r||(u[i++]=c)}return u};m.flatten=function(n,t){return S(n,t,!1)},m.without=function(n){return m.difference(n,l.call(arguments,1))},m.uniq=m.unique=function(n,t,r,e){m.isBoolean(t)||(e=r,r=t,t=!1),null!=r&&(r=x(r,e));for(var u=[],i=[],o=0,a=O(n);a>o;o++){var c=n[o],f=r?r(c,o,n):c;t?(o&&i===f||u.push(c),i=f):r?m.contains(i,f)||(i.push(f),u.push(c)):m.contains(u,c)||u.push(c)}return u},m.union=function(){return m.uniq(S(arguments,!0,!0))},m.intersection=function(n){for(var t=[],r=arguments.length,e=0,u=O(n);u>e;e++){var i=n[e];if(!m.contains(t,i)){for(var o=1;r>o&&m.contains(arguments[o],i);o++);o===r&&t.push(i)}}return t},m.difference=function(n){var t=S(arguments,!0,!0,1);return m.filter(n,function(n){return!m.contains(t,n)})},m.zip=function(){return m.unzip(arguments)},m.unzip=function(n){for(var t=n&&m.max(n,O).length||0,r=Array(t),e=0;t>e;e++)r[e]=m.pluck(n,e);return r},m.object=function(n,t){for(var r={},e=0,u=O(n);u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},m.findIndex=t(1),m.findLastIndex=t(-1),m.sortedIndex=function(n,t,r,e){r=x(r,e,1);for(var u=r(t),i=0,o=O(n);o>i;){var a=Math.floor((i+o)/2);r(n[a])<u?i=a+1:o=a}return i},m.indexOf=r(1,m.findIndex,m.sortedIndex),m.lastIndexOf=r(-1,m.findLastIndex),m.range=function(n,t,r){null==t&&(t=n||0,n=0),r=r||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=Array(e),i=0;e>i;i++,n+=r)u[i]=n;return u};var E=function(n,t,r,e,u){if(!(e instanceof t))return n.apply(r,u);var i=j(n.prototype),o=n.apply(i,u);return m.isObject(o)?o:i};m.bind=function(n,t){if(g&&n.bind===g)return g.apply(n,l.call(arguments,1));if(!m.isFunction(n))throw new TypeError("Bind must be called on a function");var r=l.call(arguments,2),e=function(){return E(n,e,t,this,r.concat(l.call(arguments)))};return e},m.partial=function(n){var t=l.call(arguments,1),r=function(){for(var e=0,u=t.length,i=Array(u),o=0;u>o;o++)i[o]=t[o]===m?arguments[e++]:t[o];for(;e<arguments.length;)i.push(arguments[e++]);return E(n,r,this,this,i)};return r},m.bindAll=function(n){var t,r,e=arguments.length;if(1>=e)throw new Error("bindAll must be passed function names");for(t=1;e>t;t++)r=arguments[t],n[r]=m.bind(n[r],n);return n},m.memoize=function(n,t){var r=function(e){var u=r.cache,i=""+(t?t.apply(this,arguments):e);return m.has(u,i)||(u[i]=n.apply(this,arguments)),u[i]};return r.cache={},r},m.delay=function(n,t){var r=l.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},m.defer=m.partial(m.delay,m,1),m.throttle=function(n,t,r){var e,u,i,o=null,a=0;r||(r={});var c=function(){a=r.leading===!1?0:m.now(),o=null,i=n.apply(e,u),o||(e=u=null)};return function(){var f=m.now();a||r.leading!==!1||(a=f);var l=t-(f-a);return e=this,u=arguments,0>=l||l>t?(o&&(clearTimeout(o),o=null),a=f,i=n.apply(e,u),o||(e=u=null)):o||r.trailing===!1||(o=setTimeout(c,l)),i}},m.debounce=function(n,t,r){var e,u,i,o,a,c=function(){var f=m.now()-o;t>f&&f>=0?e=setTimeout(c,t-f):(e=null,r||(a=n.apply(i,u),e||(i=u=null)))};return function(){i=this,u=arguments,o=m.now();var f=r&&!e;return e||(e=setTimeout(c,t)),f&&(a=n.apply(i,u),i=u=null),a}},m.wrap=function(n,t){return m.partial(t,n)},m.negate=function(n){return function(){return!n.apply(this,arguments)}},m.compose=function(){var n=arguments,t=n.length-1;return function(){for(var r=t,e=n[t].apply(this,arguments);r--;)e=n[r].call(this,e);return e}},m.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},m.before=function(n,t){var r;return function(){return--n>0&&(r=t.apply(this,arguments)),1>=n&&(t=null),r}},m.once=m.partial(m.before,2);var M=!{toString:null}.propertyIsEnumerable("toString"),I=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"];m.keys=function(n){if(!m.isObject(n))return[];if(v)return v(n);var t=[];for(var r in n)m.has(n,r)&&t.push(r);return M&&e(n,t),t},m.allKeys=function(n){if(!m.isObject(n))return[];var t=[];for(var r in n)t.push(r);return M&&e(n,t),t},m.values=function(n){for(var t=m.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},m.mapObject=function(n,t,r){t=x(t,r);for(var e,u=m.keys(n),i=u.length,o={},a=0;i>a;a++)e=u[a],o[e]=t(n[e],e,n);return o},m.pairs=function(n){for(var t=m.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},m.invert=function(n){for(var t={},r=m.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},m.functions=m.methods=function(n){var t=[];for(var r in n)m.isFunction(n[r])&&t.push(r);return t.sort()},m.extend=_(m.allKeys),m.extendOwn=m.assign=_(m.keys),m.findKey=function(n,t,r){t=x(t,r);for(var e,u=m.keys(n),i=0,o=u.length;o>i;i++)if(e=u[i],t(n[e],e,n))return e},m.pick=function(n,t,r){var e,u,i={},o=n;if(null==o)return i;m.isFunction(t)?(u=m.allKeys(o),e=b(t,r)):(u=S(arguments,!1,!1,1),e=function(n,t,r){return t in r},o=Object(o));for(var a=0,c=u.length;c>a;a++){var f=u[a],l=o[f];e(l,f,o)&&(i[f]=l)}return i},m.omit=function(n,t,r){if(m.isFunction(t))t=m.negate(t);else{var e=m.map(S(arguments,!1,!1,1),String);t=function(n,t){return!m.contains(e,t)}}return m.pick(n,t,r)},m.defaults=_(m.allKeys,!0),m.create=function(n,t){var r=j(n);return t&&m.extendOwn(r,t),r},m.clone=function(n){return m.isObject(n)?m.isArray(n)?n.slice():m.extend({},n):n},m.tap=function(n,t){return t(n),n},m.isMatch=function(n,t){var r=m.keys(t),e=r.length;if(null==n)return!e;for(var u=Object(n),i=0;e>i;i++){var o=r[i];if(t[o]!==u[o]||!(o in u))return!1}return!0};var N=function(n,t,r,e){if(n===t)return 0!==n||1/n===1/t;if(null==n||null==t)return n===t;n instanceof m&&(n=n._wrapped),t instanceof m&&(t=t._wrapped);var u=s.call(n);if(u!==s.call(t))return!1;switch(u){case"[object RegExp]":case"[object String]":return""+n==""+t;case"[object Number]":return+n!==+n?+t!==+t:0===+n?1/+n===1/t:+n===+t;case"[object Date]":case"[object Boolean]":return+n===+t}var i="[object Array]"===u;if(!i){if("object"!=typeof n||"object"!=typeof t)return!1;var o=n.constructor,a=t.constructor;if(o!==a&&!(m.isFunction(o)&&o instanceof o&&m.isFunction(a)&&a instanceof a)&&"constructor"in n&&"constructor"in t)return!1}r=r||[],e=e||[];for(var c=r.length;c--;)if(r[c]===n)return e[c]===t;if(r.push(n),e.push(t),i){if(c=n.length,c!==t.length)return!1;for(;c--;)if(!N(n[c],t[c],r,e))return!1}else{var f,l=m.keys(n);if(c=l.length,m.keys(t).length!==c)return!1;for(;c--;)if(f=l[c],!m.has(t,f)||!N(n[f],t[f],r,e))return!1}return r.pop(),e.pop(),!0};m.isEqual=function(n,t){return N(n,t)},m.isEmpty=function(n){return null==n?!0:k(n)&&(m.isArray(n)||m.isString(n)||m.isArguments(n))?0===n.length:0===m.keys(n).length},m.isElement=function(n){return!(!n||1!==n.nodeType)},m.isArray=h||function(n){return"[object Array]"===s.call(n)},m.isObject=function(n){var t=typeof n;return"function"===t||"object"===t&&!!n},m.each(["Arguments","Function","String","Number","Date","RegExp","Error"],function(n){m["is"+n]=function(t){return s.call(t)==="[object "+n+"]"}}),m.isArguments(arguments)||(m.isArguments=function(n){return m.has(n,"callee")}),"function"!=typeof/./&&"object"!=typeof Int8Array&&(m.isFunction=function(n){return"function"==typeof n||!1}),m.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},m.isNaN=function(n){return m.isNumber(n)&&n!==+n},m.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"===s.call(n)},m.isNull=function(n){return null===n},m.isUndefined=function(n){return n===void 0},m.has=function(n,t){return null!=n&&p.call(n,t)},m.noConflict=function(){return u._=i,this},m.identity=function(n){return n},m.constant=function(n){return function(){return n}},m.noop=function(){},m.property=w,m.propertyOf=function(n){return null==n?function(){}:function(t){return n[t]}},m.matcher=m.matches=function(n){return n=m.extendOwn({},n),function(t){return m.isMatch(t,n)}},m.times=function(n,t,r){var e=Array(Math.max(0,n));t=b(t,r,1);for(var u=0;n>u;u++)e[u]=t(u);return e},m.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))},m.now=Date.now||function(){return(new Date).getTime()};var B={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},T=m.invert(B),R=function(n){var t=function(t){return n[t]},r="(?:"+m.keys(n).join("|")+")",e=RegExp(r),u=RegExp(r,"g");return function(n){return n=null==n?"":""+n,e.test(n)?n.replace(u,t):n}};m.escape=R(B),m.unescape=R(T),m.result=function(n,t,r){var e=null==n?void 0:n[t];return e===void 0&&(e=r),m.isFunction(e)?e.call(n):e};var q=0;m.uniqueId=function(n){var t=++q+"";return n?n+t:t},m.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var K=/(.)^/,z={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\u2028|\u2029/g,L=function(n){return"\\"+z[n]};m.template=function(n,t,r){!t&&r&&(t=r),t=m.defaults({},t,m.templateSettings);var e=RegExp([(t.escape||K).source,(t.interpolate||K).source,(t.evaluate||K).source].join("|")+"|$","g"),u=0,i="__p+='";n.replace(e,function(t,r,e,o,a){return i+=n.slice(u,a).replace(D,L),u=a+t.length,r?i+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'":e?i+="'+\n((__t=("+e+"))==null?'':__t)+\n'":o&&(i+="';\n"+o+"\n__p+='"),t}),i+="';\n",t.variable||(i="with(obj||{}){\n"+i+"}\n"),i="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+i+"return __p;\n";try{var o=new Function(t.variable||"obj","_",i)}catch(a){throw a.source=i,a}var c=function(n){return o.call(this,n,m)},f=t.variable||"obj";return c.source="function("+f+"){\n"+i+"}",c},m.chain=function(n){var t=m(n);return t._chain=!0,t};var P=function(n,t){return n._chain?m(t).chain():t};m.mixin=function(n){m.each(m.functions(n),function(t){var r=m[t]=n[t];m.prototype[t]=function(){var n=[this._wrapped];return f.apply(n,arguments),P(this,r.apply(m,n))}})},m.mixin(m),m.each(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=o[n];m.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!==n&&"splice"!==n||0!==r.length||delete r[0],P(this,r)}}),m.each(["concat","join","slice"],function(n){var t=o[n];m.prototype[n]=function(){return P(this,t.apply(this._wrapped,arguments))}}),m.prototype.value=function(){return this._wrapped},m.prototype.valueOf=m.prototype.toJSON=m.prototype.value,m.prototype.toString=function(){return""+this._wrapped},"function"==typeof define&&define.amd&&define("underscore",[],function(){return m})}).call(this);
//# sourceMappingURL=underscore-min.map;
//Need this one for almond after jQuery is loaded
define('jquery',[],function () {
  return jQuery;
});
(function(t){var e=typeof self=="object"&&self.self==self&&self||typeof global=="object"&&global.global==global&&global;if(typeof define==="function"&&define.amd){define('backbone',["underscore","jquery","exports"],function(i,r,n){e.Backbone=t(e,n,i,r)})}else if(typeof exports!=="undefined"){var i=require("underscore"),r;try{r=require("jquery")}catch(n){}t(e,exports,i,r)}else{e.Backbone=t(e,{},e._,e.jQuery||e.Zepto||e.ender||e.$)}})(function(t,e,i,r){var n=t.Backbone;var s=Array.prototype.slice;e.VERSION="1.2.3";e.$=r;e.noConflict=function(){t.Backbone=n;return this};e.emulateHTTP=false;e.emulateJSON=false;var a=function(t,e,r){switch(t){case 1:return function(){return i[e](this[r])};case 2:return function(t){return i[e](this[r],t)};case 3:return function(t,n){return i[e](this[r],h(t,this),n)};case 4:return function(t,n,s){return i[e](this[r],h(t,this),n,s)};default:return function(){var t=s.call(arguments);t.unshift(this[r]);return i[e].apply(i,t)}}};var o=function(t,e,r){i.each(e,function(e,n){if(i[n])t.prototype[n]=a(e,n,r)})};var h=function(t,e){if(i.isFunction(t))return t;if(i.isObject(t)&&!e._isModel(t))return u(t);if(i.isString(t))return function(e){return e.get(t)};return t};var u=function(t){var e=i.matches(t);return function(t){return e(t.attributes)}};var l=e.Events={};var c=/\s+/;var f=function(t,e,r,n,s){var a=0,o;if(r&&typeof r==="object"){if(n!==void 0&&"context"in s&&s.context===void 0)s.context=n;for(o=i.keys(r);a<o.length;a++){e=f(t,e,o[a],r[o[a]],s)}}else if(r&&c.test(r)){for(o=r.split(c);a<o.length;a++){e=t(e,o[a],n,s)}}else{e=t(e,r,n,s)}return e};l.on=function(t,e,i){return d(this,t,e,i)};var d=function(t,e,i,r,n){t._events=f(v,t._events||{},e,i,{context:r,ctx:t,listening:n});if(n){var s=t._listeners||(t._listeners={});s[n.id]=n}return t};l.listenTo=function(t,e,r){if(!t)return this;var n=t._listenId||(t._listenId=i.uniqueId("l"));var s=this._listeningTo||(this._listeningTo={});var a=s[n];if(!a){var o=this._listenId||(this._listenId=i.uniqueId("l"));a=s[n]={obj:t,objId:n,id:o,listeningTo:s,count:0}}d(t,e,r,this,a);return this};var v=function(t,e,i,r){if(i){var n=t[e]||(t[e]=[]);var s=r.context,a=r.ctx,o=r.listening;if(o)o.count++;n.push({callback:i,context:s,ctx:s||a,listening:o})}return t};l.off=function(t,e,i){if(!this._events)return this;this._events=f(g,this._events,t,e,{context:i,listeners:this._listeners});return this};l.stopListening=function(t,e,r){var n=this._listeningTo;if(!n)return this;var s=t?[t._listenId]:i.keys(n);for(var a=0;a<s.length;a++){var o=n[s[a]];if(!o)break;o.obj.off(e,r,this)}if(i.isEmpty(n))this._listeningTo=void 0;return this};var g=function(t,e,r,n){if(!t)return;var s=0,a;var o=n.context,h=n.listeners;if(!e&&!r&&!o){var u=i.keys(h);for(;s<u.length;s++){a=h[u[s]];delete h[a.id];delete a.listeningTo[a.objId]}return}var l=e?[e]:i.keys(t);for(;s<l.length;s++){e=l[s];var c=t[e];if(!c)break;var f=[];for(var d=0;d<c.length;d++){var v=c[d];if(r&&r!==v.callback&&r!==v.callback._callback||o&&o!==v.context){f.push(v)}else{a=v.listening;if(a&&--a.count===0){delete h[a.id];delete a.listeningTo[a.objId]}}}if(f.length){t[e]=f}else{delete t[e]}}if(i.size(t))return t};l.once=function(t,e,r){var n=f(p,{},t,e,i.bind(this.off,this));return this.on(n,void 0,r)};l.listenToOnce=function(t,e,r){var n=f(p,{},e,r,i.bind(this.stopListening,this,t));return this.listenTo(t,n)};var p=function(t,e,r,n){if(r){var s=t[e]=i.once(function(){n(e,s);r.apply(this,arguments)});s._callback=r}return t};l.trigger=function(t){if(!this._events)return this;var e=Math.max(0,arguments.length-1);var i=Array(e);for(var r=0;r<e;r++)i[r]=arguments[r+1];f(m,this._events,t,void 0,i);return this};var m=function(t,e,i,r){if(t){var n=t[e];var s=t.all;if(n&&s)s=s.slice();if(n)_(n,r);if(s)_(s,[e].concat(r))}return t};var _=function(t,e){var i,r=-1,n=t.length,s=e[0],a=e[1],o=e[2];switch(e.length){case 0:while(++r<n)(i=t[r]).callback.call(i.ctx);return;case 1:while(++r<n)(i=t[r]).callback.call(i.ctx,s);return;case 2:while(++r<n)(i=t[r]).callback.call(i.ctx,s,a);return;case 3:while(++r<n)(i=t[r]).callback.call(i.ctx,s,a,o);return;default:while(++r<n)(i=t[r]).callback.apply(i.ctx,e);return}};l.bind=l.on;l.unbind=l.off;i.extend(e,l);var y=e.Model=function(t,e){var r=t||{};e||(e={});this.cid=i.uniqueId(this.cidPrefix);this.attributes={};if(e.collection)this.collection=e.collection;if(e.parse)r=this.parse(r,e)||{};r=i.defaults({},r,i.result(this,"defaults"));this.set(r,e);this.changed={};this.initialize.apply(this,arguments)};i.extend(y.prototype,l,{changed:null,validationError:null,idAttribute:"id",cidPrefix:"c",initialize:function(){},toJSON:function(t){return i.clone(this.attributes)},sync:function(){return e.sync.apply(this,arguments)},get:function(t){return this.attributes[t]},escape:function(t){return i.escape(this.get(t))},has:function(t){return this.get(t)!=null},matches:function(t){return!!i.iteratee(t,this)(this.attributes)},set:function(t,e,r){if(t==null)return this;var n;if(typeof t==="object"){n=t;r=e}else{(n={})[t]=e}r||(r={});if(!this._validate(n,r))return false;var s=r.unset;var a=r.silent;var o=[];var h=this._changing;this._changing=true;if(!h){this._previousAttributes=i.clone(this.attributes);this.changed={}}var u=this.attributes;var l=this.changed;var c=this._previousAttributes;for(var f in n){e=n[f];if(!i.isEqual(u[f],e))o.push(f);if(!i.isEqual(c[f],e)){l[f]=e}else{delete l[f]}s?delete u[f]:u[f]=e}this.id=this.get(this.idAttribute);if(!a){if(o.length)this._pending=r;for(var d=0;d<o.length;d++){this.trigger("change:"+o[d],this,u[o[d]],r)}}if(h)return this;if(!a){while(this._pending){r=this._pending;this._pending=false;this.trigger("change",this,r)}}this._pending=false;this._changing=false;return this},unset:function(t,e){return this.set(t,void 0,i.extend({},e,{unset:true}))},clear:function(t){var e={};for(var r in this.attributes)e[r]=void 0;return this.set(e,i.extend({},t,{unset:true}))},hasChanged:function(t){if(t==null)return!i.isEmpty(this.changed);return i.has(this.changed,t)},changedAttributes:function(t){if(!t)return this.hasChanged()?i.clone(this.changed):false;var e=this._changing?this._previousAttributes:this.attributes;var r={};for(var n in t){var s=t[n];if(i.isEqual(e[n],s))continue;r[n]=s}return i.size(r)?r:false},previous:function(t){if(t==null||!this._previousAttributes)return null;return this._previousAttributes[t]},previousAttributes:function(){return i.clone(this._previousAttributes)},fetch:function(t){t=i.extend({parse:true},t);var e=this;var r=t.success;t.success=function(i){var n=t.parse?e.parse(i,t):i;if(!e.set(n,t))return false;if(r)r.call(t.context,e,i,t);e.trigger("sync",e,i,t)};z(this,t);return this.sync("read",this,t)},save:function(t,e,r){var n;if(t==null||typeof t==="object"){n=t;r=e}else{(n={})[t]=e}r=i.extend({validate:true,parse:true},r);var s=r.wait;if(n&&!s){if(!this.set(n,r))return false}else{if(!this._validate(n,r))return false}var a=this;var o=r.success;var h=this.attributes;r.success=function(t){a.attributes=h;var e=r.parse?a.parse(t,r):t;if(s)e=i.extend({},n,e);if(e&&!a.set(e,r))return false;if(o)o.call(r.context,a,t,r);a.trigger("sync",a,t,r)};z(this,r);if(n&&s)this.attributes=i.extend({},h,n);var u=this.isNew()?"create":r.patch?"patch":"update";if(u==="patch"&&!r.attrs)r.attrs=n;var l=this.sync(u,this,r);this.attributes=h;return l},destroy:function(t){t=t?i.clone(t):{};var e=this;var r=t.success;var n=t.wait;var s=function(){e.stopListening();e.trigger("destroy",e,e.collection,t)};t.success=function(i){if(n)s();if(r)r.call(t.context,e,i,t);if(!e.isNew())e.trigger("sync",e,i,t)};var a=false;if(this.isNew()){i.defer(t.success)}else{z(this,t);a=this.sync("delete",this,t)}if(!n)s();return a},url:function(){var t=i.result(this,"urlRoot")||i.result(this.collection,"url")||F();if(this.isNew())return t;var e=this.get(this.idAttribute);return t.replace(/[^\/]$/,"$&/")+encodeURIComponent(e)},parse:function(t,e){return t},clone:function(){return new this.constructor(this.attributes)},isNew:function(){return!this.has(this.idAttribute)},isValid:function(t){return this._validate({},i.defaults({validate:true},t))},_validate:function(t,e){if(!e.validate||!this.validate)return true;t=i.extend({},this.attributes,t);var r=this.validationError=this.validate(t,e)||null;if(!r)return true;this.trigger("invalid",this,r,i.extend(e,{validationError:r}));return false}});var b={keys:1,values:1,pairs:1,invert:1,pick:0,omit:0,chain:1,isEmpty:1};o(y,b,"attributes");var x=e.Collection=function(t,e){e||(e={});if(e.model)this.model=e.model;if(e.comparator!==void 0)this.comparator=e.comparator;this._reset();this.initialize.apply(this,arguments);if(t)this.reset(t,i.extend({silent:true},e))};var w={add:true,remove:true,merge:true};var E={add:true,remove:false};var k=function(t,e,i){i=Math.min(Math.max(i,0),t.length);var r=Array(t.length-i);var n=e.length;for(var s=0;s<r.length;s++)r[s]=t[s+i];for(s=0;s<n;s++)t[s+i]=e[s];for(s=0;s<r.length;s++)t[s+n+i]=r[s]};i.extend(x.prototype,l,{model:y,initialize:function(){},toJSON:function(t){return this.map(function(e){return e.toJSON(t)})},sync:function(){return e.sync.apply(this,arguments)},add:function(t,e){return this.set(t,i.extend({merge:false},e,E))},remove:function(t,e){e=i.extend({},e);var r=!i.isArray(t);t=r?[t]:i.clone(t);var n=this._removeModels(t,e);if(!e.silent&&n)this.trigger("update",this,e);return r?n[0]:n},set:function(t,e){if(t==null)return;e=i.defaults({},e,w);if(e.parse&&!this._isModel(t))t=this.parse(t,e);var r=!i.isArray(t);t=r?[t]:t.slice();var n=e.at;if(n!=null)n=+n;if(n<0)n+=this.length+1;var s=[];var a=[];var o=[];var h={};var u=e.add;var l=e.merge;var c=e.remove;var f=false;var d=this.comparator&&n==null&&e.sort!==false;var v=i.isString(this.comparator)?this.comparator:null;var g;for(var p=0;p<t.length;p++){g=t[p];var m=this.get(g);if(m){if(l&&g!==m){var _=this._isModel(g)?g.attributes:g;if(e.parse)_=m.parse(_,e);m.set(_,e);if(d&&!f)f=m.hasChanged(v)}if(!h[m.cid]){h[m.cid]=true;s.push(m)}t[p]=m}else if(u){g=t[p]=this._prepareModel(g,e);if(g){a.push(g);this._addReference(g,e);h[g.cid]=true;s.push(g)}}}if(c){for(p=0;p<this.length;p++){g=this.models[p];if(!h[g.cid])o.push(g)}if(o.length)this._removeModels(o,e)}var y=false;var b=!d&&u&&c;if(s.length&&b){y=this.length!=s.length||i.some(this.models,function(t,e){return t!==s[e]});this.models.length=0;k(this.models,s,0);this.length=this.models.length}else if(a.length){if(d)f=true;k(this.models,a,n==null?this.length:n);this.length=this.models.length}if(f)this.sort({silent:true});if(!e.silent){for(p=0;p<a.length;p++){if(n!=null)e.index=n+p;g=a[p];g.trigger("add",g,this,e)}if(f||y)this.trigger("sort",this,e);if(a.length||o.length)this.trigger("update",this,e)}return r?t[0]:t},reset:function(t,e){e=e?i.clone(e):{};for(var r=0;r<this.models.length;r++){this._removeReference(this.models[r],e)}e.previousModels=this.models;this._reset();t=this.add(t,i.extend({silent:true},e));if(!e.silent)this.trigger("reset",this,e);return t},push:function(t,e){return this.add(t,i.extend({at:this.length},e))},pop:function(t){var e=this.at(this.length-1);return this.remove(e,t)},unshift:function(t,e){return this.add(t,i.extend({at:0},e))},shift:function(t){var e=this.at(0);return this.remove(e,t)},slice:function(){return s.apply(this.models,arguments)},get:function(t){if(t==null)return void 0;var e=this.modelId(this._isModel(t)?t.attributes:t);return this._byId[t]||this._byId[e]||this._byId[t.cid]},at:function(t){if(t<0)t+=this.length;return this.models[t]},where:function(t,e){return this[e?"find":"filter"](t)},findWhere:function(t){return this.where(t,true)},sort:function(t){var e=this.comparator;if(!e)throw new Error("Cannot sort a set without a comparator");t||(t={});var r=e.length;if(i.isFunction(e))e=i.bind(e,this);if(r===1||i.isString(e)){this.models=this.sortBy(e)}else{this.models.sort(e)}if(!t.silent)this.trigger("sort",this,t);return this},pluck:function(t){return i.invoke(this.models,"get",t)},fetch:function(t){t=i.extend({parse:true},t);var e=t.success;var r=this;t.success=function(i){var n=t.reset?"reset":"set";r[n](i,t);if(e)e.call(t.context,r,i,t);r.trigger("sync",r,i,t)};z(this,t);return this.sync("read",this,t)},create:function(t,e){e=e?i.clone(e):{};var r=e.wait;t=this._prepareModel(t,e);if(!t)return false;if(!r)this.add(t,e);var n=this;var s=e.success;e.success=function(t,e,i){if(r)n.add(t,i);if(s)s.call(i.context,t,e,i)};t.save(null,e);return t},parse:function(t,e){return t},clone:function(){return new this.constructor(this.models,{model:this.model,comparator:this.comparator})},modelId:function(t){return t[this.model.prototype.idAttribute||"id"]},_reset:function(){this.length=0;this.models=[];this._byId={}},_prepareModel:function(t,e){if(this._isModel(t)){if(!t.collection)t.collection=this;return t}e=e?i.clone(e):{};e.collection=this;var r=new this.model(t,e);if(!r.validationError)return r;this.trigger("invalid",this,r.validationError,e);return false},_removeModels:function(t,e){var i=[];for(var r=0;r<t.length;r++){var n=this.get(t[r]);if(!n)continue;var s=this.indexOf(n);this.models.splice(s,1);this.length--;if(!e.silent){e.index=s;n.trigger("remove",n,this,e)}i.push(n);this._removeReference(n,e)}return i.length?i:false},_isModel:function(t){return t instanceof y},_addReference:function(t,e){this._byId[t.cid]=t;var i=this.modelId(t.attributes);if(i!=null)this._byId[i]=t;t.on("all",this._onModelEvent,this)},_removeReference:function(t,e){delete this._byId[t.cid];var i=this.modelId(t.attributes);if(i!=null)delete this._byId[i];if(this===t.collection)delete t.collection;t.off("all",this._onModelEvent,this)},_onModelEvent:function(t,e,i,r){if((t==="add"||t==="remove")&&i!==this)return;if(t==="destroy")this.remove(e,r);if(t==="change"){var n=this.modelId(e.previousAttributes());var s=this.modelId(e.attributes);if(n!==s){if(n!=null)delete this._byId[n];if(s!=null)this._byId[s]=e}}this.trigger.apply(this,arguments)}});var S={forEach:3,each:3,map:3,collect:3,reduce:4,foldl:4,inject:4,reduceRight:4,foldr:4,find:3,detect:3,filter:3,select:3,reject:3,every:3,all:3,some:3,any:3,include:3,includes:3,contains:3,invoke:0,max:3,min:3,toArray:1,size:1,first:3,head:3,take:3,initial:3,rest:3,tail:3,drop:3,last:3,without:0,difference:0,indexOf:3,shuffle:1,lastIndexOf:3,isEmpty:1,chain:1,sample:3,partition:3,groupBy:3,countBy:3,sortBy:3,indexBy:3};o(x,S,"models");var I=e.View=function(t){this.cid=i.uniqueId("view");i.extend(this,i.pick(t,P));this._ensureElement();this.initialize.apply(this,arguments)};var T=/^(\S+)\s*(.*)$/;var P=["model","collection","el","id","attributes","className","tagName","events"];i.extend(I.prototype,l,{tagName:"div",$:function(t){return this.$el.find(t)},initialize:function(){},render:function(){return this},remove:function(){this._removeElement();this.stopListening();return this},_removeElement:function(){this.$el.remove()},setElement:function(t){this.undelegateEvents();this._setElement(t);this.delegateEvents();return this},_setElement:function(t){this.$el=t instanceof e.$?t:e.$(t);this.el=this.$el[0]},delegateEvents:function(t){t||(t=i.result(this,"events"));if(!t)return this;this.undelegateEvents();for(var e in t){var r=t[e];if(!i.isFunction(r))r=this[r];if(!r)continue;var n=e.match(T);this.delegate(n[1],n[2],i.bind(r,this))}return this},delegate:function(t,e,i){this.$el.on(t+".delegateEvents"+this.cid,e,i);return this},undelegateEvents:function(){if(this.$el)this.$el.off(".delegateEvents"+this.cid);return this},undelegate:function(t,e,i){this.$el.off(t+".delegateEvents"+this.cid,e,i);return this},_createElement:function(t){return document.createElement(t)},_ensureElement:function(){if(!this.el){var t=i.extend({},i.result(this,"attributes"));if(this.id)t.id=i.result(this,"id");if(this.className)t["class"]=i.result(this,"className");this.setElement(this._createElement(i.result(this,"tagName")));this._setAttributes(t)}else{this.setElement(i.result(this,"el"))}},_setAttributes:function(t){this.$el.attr(t)}});e.sync=function(t,r,n){var s=H[t];i.defaults(n||(n={}),{emulateHTTP:e.emulateHTTP,emulateJSON:e.emulateJSON});var a={type:s,dataType:"json"};if(!n.url){a.url=i.result(r,"url")||F()}if(n.data==null&&r&&(t==="create"||t==="update"||t==="patch")){a.contentType="application/json";a.data=JSON.stringify(n.attrs||r.toJSON(n))}if(n.emulateJSON){a.contentType="application/x-www-form-urlencoded";a.data=a.data?{model:a.data}:{}}if(n.emulateHTTP&&(s==="PUT"||s==="DELETE"||s==="PATCH")){a.type="POST";if(n.emulateJSON)a.data._method=s;var o=n.beforeSend;n.beforeSend=function(t){t.setRequestHeader("X-HTTP-Method-Override",s);if(o)return o.apply(this,arguments)}}if(a.type!=="GET"&&!n.emulateJSON){a.processData=false}var h=n.error;n.error=function(t,e,i){n.textStatus=e;n.errorThrown=i;if(h)h.call(n.context,t,e,i)};var u=n.xhr=e.ajax(i.extend(a,n));r.trigger("request",r,u,n);return u};var H={create:"POST",update:"PUT",patch:"PATCH","delete":"DELETE",read:"GET"};e.ajax=function(){return e.$.ajax.apply(e.$,arguments)};var $=e.Router=function(t){t||(t={});if(t.routes)this.routes=t.routes;this._bindRoutes();this.initialize.apply(this,arguments)};var A=/\((.*?)\)/g;var C=/(\(\?)?:\w+/g;var R=/\*\w+/g;var j=/[\-{}\[\]+?.,\\\^$|#\s]/g;i.extend($.prototype,l,{initialize:function(){},route:function(t,r,n){if(!i.isRegExp(t))t=this._routeToRegExp(t);if(i.isFunction(r)){n=r;r=""}if(!n)n=this[r];var s=this;e.history.route(t,function(i){var a=s._extractParameters(t,i);if(s.execute(n,a,r)!==false){s.trigger.apply(s,["route:"+r].concat(a));s.trigger("route",r,a);e.history.trigger("route",s,r,a)}});return this},execute:function(t,e,i){if(t)t.apply(this,e)},navigate:function(t,i){e.history.navigate(t,i);return this},_bindRoutes:function(){if(!this.routes)return;this.routes=i.result(this,"routes");var t,e=i.keys(this.routes);while((t=e.pop())!=null){this.route(t,this.routes[t])}},_routeToRegExp:function(t){t=t.replace(j,"\\$&").replace(A,"(?:$1)?").replace(C,function(t,e){return e?t:"([^/?]+)"}).replace(R,"([^?]*?)");return new RegExp("^"+t+"(?:\\?([\\s\\S]*))?$")},_extractParameters:function(t,e){var r=t.exec(e).slice(1);return i.map(r,function(t,e){if(e===r.length-1)return t||null;return t?decodeURIComponent(t):null})}});var M=e.History=function(){this.handlers=[];this.checkUrl=i.bind(this.checkUrl,this);if(typeof window!=="undefined"){this.location=window.location;this.history=window.history}};var N=/^[#\/]|\s+$/g;var O=/^\/+|\/+$/g;var U=/#.*$/;M.started=false;i.extend(M.prototype,l,{interval:50,atRoot:function(){var t=this.location.pathname.replace(/[^\/]$/,"$&/");return t===this.root&&!this.getSearch()},matchRoot:function(){var t=this.decodeFragment(this.location.pathname);var e=t.slice(0,this.root.length-1)+"/";return e===this.root},decodeFragment:function(t){return decodeURI(t.replace(/%25/g,"%2525"))},getSearch:function(){var t=this.location.href.replace(/#.*/,"").match(/\?.+/);return t?t[0]:""},getHash:function(t){var e=(t||this).location.href.match(/#(.*)$/);return e?e[1]:""},getPath:function(){var t=this.decodeFragment(this.location.pathname+this.getSearch()).slice(this.root.length-1);return t.charAt(0)==="/"?t.slice(1):t},getFragment:function(t){if(t==null){if(this._usePushState||!this._wantsHashChange){t=this.getPath()}else{t=this.getHash()}}return t.replace(N,"")},start:function(t){if(M.started)throw new Error("Backbone.history has already been started");M.started=true;this.options=i.extend({root:"/"},this.options,t);this.root=this.options.root;this._wantsHashChange=this.options.hashChange!==false;this._hasHashChange="onhashchange"in window&&(document.documentMode===void 0||document.documentMode>7);this._useHashChange=this._wantsHashChange&&this._hasHashChange;this._wantsPushState=!!this.options.pushState;this._hasPushState=!!(this.history&&this.history.pushState);this._usePushState=this._wantsPushState&&this._hasPushState;this.fragment=this.getFragment();this.root=("/"+this.root+"/").replace(O,"/");if(this._wantsHashChange&&this._wantsPushState){if(!this._hasPushState&&!this.atRoot()){var e=this.root.slice(0,-1)||"/";this.location.replace(e+"#"+this.getPath());return true}else if(this._hasPushState&&this.atRoot()){this.navigate(this.getHash(),{replace:true})}}if(!this._hasHashChange&&this._wantsHashChange&&!this._usePushState){this.iframe=document.createElement("iframe");this.iframe.src="javascript:0";this.iframe.style.display="none";this.iframe.tabIndex=-1;var r=document.body;var n=r.insertBefore(this.iframe,r.firstChild).contentWindow;n.document.open();n.document.close();n.location.hash="#"+this.fragment}var s=window.addEventListener||function(t,e){return attachEvent("on"+t,e)};if(this._usePushState){s("popstate",this.checkUrl,false)}else if(this._useHashChange&&!this.iframe){s("hashchange",this.checkUrl,false)}else if(this._wantsHashChange){this._checkUrlInterval=setInterval(this.checkUrl,this.interval)}if(!this.options.silent)return this.loadUrl()},stop:function(){var t=window.removeEventListener||function(t,e){return detachEvent("on"+t,e)};if(this._usePushState){t("popstate",this.checkUrl,false)}else if(this._useHashChange&&!this.iframe){t("hashchange",this.checkUrl,false)}if(this.iframe){document.body.removeChild(this.iframe);this.iframe=null}if(this._checkUrlInterval)clearInterval(this._checkUrlInterval);M.started=false},route:function(t,e){this.handlers.unshift({route:t,callback:e})},checkUrl:function(t){var e=this.getFragment();if(e===this.fragment&&this.iframe){e=this.getHash(this.iframe.contentWindow)}if(e===this.fragment)return false;if(this.iframe)this.navigate(e);this.loadUrl()},loadUrl:function(t){if(!this.matchRoot())return false;t=this.fragment=this.getFragment(t);return i.some(this.handlers,function(e){if(e.route.test(t)){e.callback(t);return true}})},navigate:function(t,e){if(!M.started)return false;if(!e||e===true)e={trigger:!!e};t=this.getFragment(t||"");var i=this.root;if(t===""||t.charAt(0)==="?"){i=i.slice(0,-1)||"/"}var r=i+t;t=this.decodeFragment(t.replace(U,""));if(this.fragment===t)return;this.fragment=t;if(this._usePushState){this.history[e.replace?"replaceState":"pushState"]({},document.title,r)}else if(this._wantsHashChange){this._updateHash(this.location,t,e.replace);if(this.iframe&&t!==this.getHash(this.iframe.contentWindow)){var n=this.iframe.contentWindow;if(!e.replace){n.document.open();n.document.close()}this._updateHash(n.location,t,e.replace)}}else{return this.location.assign(r)}if(e.trigger)return this.loadUrl(t)},_updateHash:function(t,e,i){if(i){var r=t.href.replace(/(javascript:|#).*$/,"");t.replace(r+"#"+e)}else{t.hash="#"+e}}});e.history=new M;var q=function(t,e){var r=this;var n;if(t&&i.has(t,"constructor")){n=t.constructor}else{n=function(){return r.apply(this,arguments)}}i.extend(n,r,e);var s=function(){this.constructor=n};s.prototype=r.prototype;n.prototype=new s;if(t)i.extend(n.prototype,t);n.__super__=r.prototype;return n};y.extend=x.extend=$.extend=I.extend=M.extend=q;var F=function(){throw new Error('A "url" property or function must be specified')};var z=function(t,e){var i=e.error;e.error=function(r){if(i)i.call(e.context,t,r,e);t.trigger("error",t,r,e)}};return e});
//# sourceMappingURL=backbone-min.map;
/*!
 * Backbone.Undo.js v0.2
 * 
 * Copyright (c)2013 Oliver Sartun
 * Released under the MIT License
 *
 * Documentation and full license available at
 * https://github.com/osartun/Backbone.Undo.js
 */


(function (factory) {
	if (typeof define === "function" && define.amd) {
		// AMD support
		define('backboneUndo',["underscore", "backbone"], factory);
	} else if (typeof exports !== 'undefined') {
		// CommonJS support
		module.exports = factory(
			require("underscore"),
			require("backbone")
		);
	} else {
		// Non-modular execution
		factory(_, Backbone);
        }
})(function (_, Backbone) {

	var core_slice = Array.prototype.slice;

	/**
	 * As call is faster than apply, this is a faster version of apply as it uses call.
	 * 
	 * @param  {Function} fn 	The function to execute 
	 * @param  {Object}   ctx 	The context the function should be called in
	 * @param  {Array}    args 	The array of arguments that should be applied to the function
	 * @return Forwards whatever the called function returns
	 */
	function apply (fn, ctx, args) {
		return args.length <= 4 ?
			fn.call(ctx, args[0], args[1], args[2], args[3]) :
			fn.apply(ctx, args);
	}

	/**
	 * Uses slice on an array or an array-like object.
	 * 
	 * @param  {Array|Object} 	arr 	The array or array-like object.
	 * @param  {Number} 		[index]	The index from where the array should be sliced. Default is 0.
	 * @return {Array} The sliced array
	 */
	function slice (arr, index) {
		return core_slice.call(arr, index);
	}

	/**
	 * Checks if an object has one or more specific keys. The keys 
	 * don't have to be an owned property.
	 * You can call this function either this way:
	 * hasKeys(obj, ["a", "b", "c"])
	 * or this way:
	 * hasKeys(obj, "a", "b", "c")
	 * 
	 * @param  {Object}  	obj 	The object to check on
	 * @param  {Array}  	keys 	The keys to check for
	 * @return {Boolean} True, if the object has all those keys
	 */
	function hasKeys (obj, keys) {
		if (obj == null) return false;
		if (!_.isArray(keys)) {
			keys = slice(arguments, 1);
		}
		return _.all(keys, function (key) {
			return key in obj;
		});
	}

	/**
	 * Returns a number that is unique per call stack. The number gets 
	 * changed after the call stack has been completely processed.
	 * 
	 * @return {number} MagicFusionIndex
	 */
	var getMagicFusionIndex = (function () {
		// If you add several models to a collection or set several
		// attributes on a model all in sequence and yet all for
		// example in one function, then several Undo-Actions are
		// generated.
		// If you want to undo your last action only the last model
		// would be removed from the collection or the last set
		// attribute would be changed back to its previous value.
		// To prevent that we have to figure out a way to combine
		// all those actions that happened "at the same time". 
		// Timestamps aren't exact enough. A complex routine could 
		// run several milliseconds and in that time produce a lot 
		// of actions with different timestamps.
		// Instead we take advantage of the single-threadedness of
		// JavaScript:

		var callstackWasIndexed = false, magicFusionIndex = -1;
		function indexCycle() {
			magicFusionIndex++;
			callstackWasIndexed = true;
			_.defer(function () {
				// Here comes the magic. With a Timeout of 0 
				// milliseconds this function gets called whenever
				// the current callstack is completed
				callstackWasIndexed = false;
			})
		}
		return function () {
			if (!callstackWasIndexed) {
				indexCycle();
			}
			return magicFusionIndex;
		}
	})();

	/**
	 * To prevent binding a listener several times to one 
	 * object, we register the objects in an ObjectRegistry
	 *
	 * @constructor
	 */
	function ObjectRegistry () {
		// This uses two different ways of storing
		// objects: In case the object has a cid
		// (which Backbone objects typically have)
		// it uses this cid as an index. That way
		// the Array's length attribute doesn't 
		// change and the object isn't an item 
		// in the array, but an object-property.
		// Otherwise it's added to the Array as an
		// item.
		// That way we can use the fast property-
		// lookup and only have to fall back to 
		// iterating over the array in case 
		// non-Backbone-objects are registered.
		this.registeredObjects = [];
		// To return a list of all registered 
		// objects in the 'get' method we have to
		// store the objects that have a cid in
		// an additional array. 
		this.cidIndexes = [];
	}
	ObjectRegistry.prototype = {
		/**
		 * Returns whether the object is already registered in this ObjectRegistry or not.
		 * 
		 * @this 	{ObjectRegistry}
		 * @param  	{Object} 		 obj 	The object to check
		 * @return 	{Boolean} True if the object is already registered
		 */
		isRegistered: function (obj) {
			// This is where we get a performance boost 
			// by using the two different ways of storing 
			// objects.
			return obj && obj.cid ? this.registeredObjects[obj.cid] : _.contains(this.registeredObjects, obj);
		},
		/**
		 * Registers an object in this ObjectRegistry.
		 * 
		 * @this 	{ObjectRegistry}
		 * @param  	{Object} 		 obj 	The object to register
		 * @return 	{undefined}
		 */
		register: function (obj) {
			if (!this.isRegistered(obj)) {
				if (obj && obj.cid) {
					this.registeredObjects[obj.cid] = obj;
					this.cidIndexes.push(obj.cid);
				} else {
					this.registeredObjects.push(obj);
				}
				return true;
			}
			return false;
		},
		/**
		 * Unregisters an object from this ObjectRegistry.
		 * 
		 * @this {ObjectRegistry}
		 * @param  {Object} obj The object to unregister
		 * @return {undefined}
		 */
		unregister: function (obj) {
			if (this.isRegistered(obj)) {
				if (obj && obj.cid) {
					delete this.registeredObjects[obj.cid];
					this.cidIndexes.splice(_.indexOf(this.cidIndexes, obj.cid), 1);
				} else {
					var i = _.indexOf(this.registeredObjects, obj);
					this.registeredObjects.splice(i, 1);
				}
				return true;
			}
			return false;
		},
		/**
		 * Returns an array of all objects that are currently in this ObjectRegistry.
		 * 
		 * @return {Array} An array of all the objects which are currently in the ObjectRegistry
		 */
		get: function () {
			return (_.map(this.cidIndexes, function (cid) {return this.registeredObjects[cid];}, this)).concat(this.registeredObjects);
		}
	}

	/**
	 * Binds or unbinds the "all"-listener for one or more objects.
	 * 
	 * @param  {String}   which 	Either "on" or "off"
	 * @param  {Object[]} objects 	Array of the objects on which the "all"-listener should be bound / unbound to
	 * @param  {Function} [fn] 		The function that should be bound / unbound. Optional in case of "off"
	 * @param  {Object}   [ctx] 	The context the function should be called in
	 * @return {undefined}
	 */
	function onoff(which, objects, fn, ctx) {
		for (var i = 0, l = objects.length, obj; i < l; i++) {
			obj = objects[i];
			if (!obj) continue;
			if (which === "on") {
				if (!ctx.objectRegistry.register(obj)) {
					// register returned false, so obj was already registered
					continue;
				}
			} else {
				if (!ctx.objectRegistry.unregister(obj)) {
					// unregister returned false, so obj wasn't registered
					continue;
				}
			}
			if (_.isFunction(obj[which])) {
				obj[which]("all", fn, ctx);
			}
		}
	}

	/**
	 * Calls the undo/redo-function for a specific action.
	 * 
	 * @param  {String} which 	Either "undo" or "redo"
	 * @param  {Object} action 	The Action's attributes
	 * @return {undefined}
	 */
	function actionUndoRedo (which, action) {
		var type = action.type, undoTypes = action.undoTypes, fn = !undoTypes[type] || undoTypes[type][which];
		if (_.isFunction(fn)) {
			fn(action.object, action.before, action.after, action.options);
		}
	}

	/**
	 * The main undo/redo function.
	 *
	 * @param  {String} 		which 	    Either "undo" or "redo"
	 * @param  {UndoManager} 	manager	    The UndoManager-instance on which an "undo"/"redo"-Event is triggered afterwards
	 * @param  {UndoStack} 		stack 	    The UndoStack on which we perform
	 * @param  {Boolean} 		magic 	    If true, undoes / redoes all actions with the same magicFusionIndex
	 * @param  {Boolean} 		everything  If true, undoes / redoes every action that had been tracked
	 * @return {undefined}
	 */
	function managerUndoRedo (which, manager, stack, magic, everything) {
		if (stack.isCurrentlyUndoRedoing || 
			(which === "undo" && stack.pointer === -1) ||
			(which === "redo" && stack.pointer === stack.length - 1)) {
			// We're either currently in an undo- / redo-process or 
			// we reached the end of the stack
			return;
		}
		stack.isCurrentlyUndoRedoing = true;
		var action, actions, isUndo = which === "undo";
		if (everything) {
			// Undo / Redo all steps until you reach the stack's beginning / end
			actions = isUndo && stack.pointer === stack.length - 1 || // If at the stack's end calling undo
					  !isUndo && stack.pointer === -1 ? // or at the stack's beginning calling redo
					  _.clone(stack.models) : // => Take all the models. Otherwise:
					  core_slice.apply(stack.models, isUndo ? [0, stack.pointer] : [stack.pointer, stack.length - 1]);
		} else {
			// Undo / Redo only one step
			action = stack.at(isUndo ? stack.pointer : stack.pointer + 1);
			actions = magic ? stack.where({"magicFusionIndex": action.get("magicFusionIndex")}) : [action];
		}
		
		stack.pointer += (isUndo ? -1 : 1) * actions.length;
		while (action = isUndo ? actions.pop() : actions.shift()) {
			// Here we're calling the Action's undo / redo method
			action[which]();
		}
		stack.isCurrentlyUndoRedoing = false;

		manager.trigger(which, manager);
	}

	/**
	 * Checks whether an UndoAction should be created or not. Therefore it checks
	 * whether a "condition" property is set in the undoTypes-object of the specific
	 * event type. If not, it returns true. If it's set and a boolean, it returns it.
	 * If it's a function, it returns its result, converting it into a boolean. 
	 * Otherwise it returns true.
	 * 
	 * @param  {Object} 	undoTypesType 	The object within the UndoTypes that holds the function for this event type (i.e. "change")
	 * @param  {Arguments} 	args       		The arguments the "condition" function is called with
	 * @return {Boolean} 	True, if an UndoAction should be created
	 */
	function validateUndoActionCreation (undoTypesType, args) {
		var condition = undoTypesType.condition, type = typeof condition;
		return type === "function" ? !!apply(condition, undoTypesType, args) :
			type === "boolean" ? condition : true;
	}

	/**
	 * Adds an Undo-Action to the stack.
	 * 
	 * @param {UndoStack} 		stack 		The undostack the action should be added to.
	 * @param {String} 			type 		The event type (i.e. "change")
	 * @param {Arguments} 		args 		The arguments passed to the undoTypes' "on"-handler
	 * @param {OwnedUndoTypes} 	undoTypes 	The undoTypes-object which has the "on"-handler
	 * @return {undefined}
	 */
	function addToStack(stack, type, args, undoTypes) {
		if (stack.track && !stack.isCurrentlyUndoRedoing && type in undoTypes &&
			validateUndoActionCreation(undoTypes[type], args)) {
			// An UndoAction should be created
			var res = apply(undoTypes[type]["on"], undoTypes[type], args), diff;
			if (hasKeys(res, "object", "before", "after")) {
				res.type = type;
				res.magicFusionIndex = getMagicFusionIndex();
				res.undoTypes = undoTypes;
				if (stack.pointer < stack.length - 1) {
					// New Actions must always be added to the end of the stack.
					// If the pointer is not pointed to the last action in the
					// stack, presumably because actions were undone before, then
					// all following actions must be discarded
					var diff = stack.length - stack.pointer - 1;
					while (diff--) {
						stack.pop();
					}
				}
				stack.pointer = stack.length;
				stack.add(res);
				if (stack.length > stack.maximumStackLength) {
					stack.shift();
					stack.pointer--;
				}
			}
		}
	}


	/**
	 * Predefined UndoTypes object with default handlers for the most common events.
	 * @type {Object}
	 */
	var UndoTypes = {
		"add": {
			"undo": function (collection, ignore, model, options) {
				// Undo add = remove
				collection.remove(model, options);
			},
			"redo": function (collection, ignore, model, options) {
				// Redo add = add
				if (options.index) {
					options.at = options.index;
				}
				collection.add(model, options);
			},
			"on": function (model, collection, options) {
				return {
					object: collection,
					before: undefined,
					after: model,
					options: _.clone(options)
				};
			}
		},
		"remove": {
			"undo": function (collection, model, ignore, options) {
				if ("index" in options) {
					options.at = options.index;
				}
				collection.add(model, options);
			},
			"redo": function (collection, model, ignore, options) {
				collection.remove(model, options);
			},
			"on": function (model, collection, options) {
				return {
					object: collection,
					before: model,
					after: undefined,
					options: _.clone(options)
				};
			}
		},
		"change": {
			"undo": function (model, before, after, options) {
				if (_.isEmpty(before)) {
					_.each(_.keys(after), model.unset, model);
				} else {
					model.set(before);
					if (options && options.unsetData && options.unsetData.before && options.unsetData.before.length) {
						_.each(options.unsetData.before, model.unset, model);
					}
				}
			},
			"redo": function (model, before, after, options) {
				if (_.isEmpty(after)) {
					_.each(_.keys(before), model.unset, model);
				} else {
					model.set(after);
					if (options && options.unsetData && options.unsetData.after && options.unsetData.after.length) {
						_.each(options.unsetData.after, model.unset, model);
					}
				}
			},
			"on": function (model, options) {
				var
				afterAttributes = model.changedAttributes(),
				keysAfter = _.keys(afterAttributes),
				previousAttributes = _.pick(model.previousAttributes(), keysAfter),
				keysPrevious = _.keys(previousAttributes),
				unsetData = (options || (options = {})).unsetData = {
					after: [],
					before: []
				};

				if (keysAfter.length != keysPrevious.length) {
					// There are new attributes or old attributes have been unset
					if (keysAfter.length > keysPrevious.length) {
						// New attributes have been added
						_.each(keysAfter, function (val) {
							if (!(val in previousAttributes)) {
								unsetData.before.push(val);
							}
						}, this);
					} else {
						// Old attributes have been unset
						_.each(keysPrevious, function (val) {
							if (!(val in afterAttributes)) {
								unsetData.after.push(val);
							}
						})
					}
				}
				return {
					object: model,
					before: previousAttributes,
					after: afterAttributes,
					options: _.clone(options)
				};
			}
		},
		"reset": {
			"undo": function (collection, before, after) {
				collection.reset(before);
			},
			"redo": function (collection, before, after) {
				collection.reset(after);
			},
			"on": function (collection, options) {
				return {
					object: collection,
					before: options.previousModels,
					after: _.clone(collection.models)
				};
			}
		}
	};

	/**
	 * Every UndoManager instance has an own undoTypes object
	 * which is an instance of OwnedUndoTypes. OwnedUndoTypes' 
	 * prototype is the global UndoTypes object. Changes to the 
	 * global UndoTypes object take effect on every instance of
	 * UndoManager as the object is its prototype. And yet every 
	 * local UndoTypes object can be changed individually.
	 *
	 * @constructor
	 */
	function OwnedUndoTypes () {}
	OwnedUndoTypes.prototype = UndoTypes;

	/**
	 * Adds, changes or removes an undo-type from an UndoTypes-object.
	 * You can call it this way:
	 * manipulateUndoType (1, "reset", {"on": function () {}}, undoTypes)
	 * or this way to perform bulk actions:
	 * manipulateUndoType (1, {"reset": {"on": function () {}}}, undoTypes)
	 * In case of removing undo-types you can pass an Array for performing
	 * bulk actions:
	 * manipulateUndoType(2, ["reset", "change"], undoTypes)
	 * 
	 * @param  {Number} 				  manipType 		Indicates the kind of action to execute: 0 for add, 1 for change, 2 for remove
	 * @param  {String|Object|Array} 	  undoType 			The type of undoType that should be added/changed/removed. Can be an object / array to perform bulk actions
	 * @param  {Object} 				  [fns] 			Object with the functions to add / change. Is optional in case you passed an object as undoType that contains these functions
	 * @param  {OwnedUndoTypes|UndoTypes} undoTypesInstance The undoTypes object to act on
	 * @return {undefined}
	 */
	function manipulateUndoType (manipType, undoType, fns, undoTypesInstance) {
		// manipType, passed by the calling function
		// 0: add
		// 1: change
		// 2: remove
		if (typeof undoType === "object") {
			// bulk action. Iterate over this data.
			return _.each(undoType, function (val, key) {
					if (manipType === 2) { // remove
						// undoType is an array
						manipulateUndoType (manipType, val, fns, undoTypesInstance);
					} else {
						// undoType is an object
						manipulateUndoType (manipType, key, val, fns);
					}
				})
		}

		switch (manipType) {
			case 0: // add
				if (hasKeys(fns, "undo", "redo", "on") && _.all(_.pick(fns, "undo", "redo", "on"), _.isFunction)) {
					undoTypesInstance[undoType] = fns;
				} 
			break;
			case 1: // change
				if (undoTypesInstance[undoType] && _.isObject(fns)) {
					// undoTypeInstance[undoType] may be a prototype's property
					// So, if we did this _.extend(undoTypeInstance[undoType], fns)
					// we would extend the object on the prototype which means
					// that this change would have a global effect
					// Instead we just want to manipulate this instance. That's why
					// we're doing this:
					undoTypesInstance[undoType] = _.extend({}, undoTypesInstance[undoType], fns);
				} 
			break;
			case 2: // remove
				delete undoTypesInstance[undoType]; 
			break;
		}
		return this;
	}

	/**
	 * Instantiating "Action" creates the UndoActions that 
	 * are collected in an UndoStack. It holds all relevant 
	 * data to undo / redo an action and has an undo / redo 
	 * method.
	 */
	var Action = Backbone.Model.extend({
		defaults: {
			type: null, // "add", "change", "reset", etc.
			object: null, // The object on which the action occurred
			before: null, // The previous values which were changed with this action
			after: null, // The values after this action
			magicFusionIndex: null // The magicFusionIndex helps to combine 
			// all actions that occurred "at the same time" to undo/redo them altogether
		},
		/**
		 * Undoes this action.
		 * @param  {OwnedUndoTypes|UndoTypes} undoTypes The undoTypes object which contains the "undo"-handler that should be used
		 * @return {undefined}
		 */
		undo: function (undoTypes) {
			actionUndoRedo("undo", this.attributes);
		},
		/**
		 * Redoes this action.
		 * @param  {OwnedUndoTypes|UndoTypes} undoTypes The undoTypes object which contains the "redo"-handler that should be used
		 * @return {undefined}
		 */
		redo: function (undoTypes) {
			actionUndoRedo("redo", this.attributes);
		}
	}),
	/**
	 * An UndoStack is a collection of UndoActions in 
	 * chronological order.
	 */
	UndoStack = Backbone.Collection.extend({
		model: Action,
		pointer: -1, // The pointer indicates the index where we are located within the stack. We start at -1
		track: false,
		isCurrentlyUndoRedoing: false,
		maximumStackLength: Infinity,
		setMaxLength: function (val) {
			this.maximumStackLength = val;
		}
	}),
	/**
	 * An instance of UndoManager can keep track of 
	 * changes to objects and helps to undo them.
	 */
	UndoManager = Backbone.Model.extend({
		defaults: {
			maximumStackLength: Infinity,
			track: false
		},
		/**
		 * The constructor function.
		 * @param  {attr} 		[attr] Object with parameters. The available parameters are:
		 *                         	   - maximumStackLength {number} 	Set the undo-stack's maximum size
		 *                             - track 				{boolean}	Start tracking changes right away
		 * @return {undefined}
		 */
		initialize: function (attr) {
			this.stack = new UndoStack;
			this.objectRegistry = new ObjectRegistry();
			this.undoTypes = new OwnedUndoTypes();

			// sync the maximumStackLength attribute with our stack
			this.stack.setMaxLength(this.get("maximumStackLength"));
			this.on("change:maximumStackLength", function (model, value) {
				this.stack.setMaxLength(value);
			}, this);

			// Start tracking, if attr.track == true
			if (attr && attr.track) {
				this.startTracking();
			}

			// Register objects passed in the "register" attribute
			if (attr && attr.register) {
				if (_.isArray(attr.register) || _.isArguments(attr.register)) {
					apply(this.register, this, attr.register);
				} else {
					this.register(attr.register);
				}
			}
		},
		/**
		 * Starts tracking. Changes of registered objects won't be processed until you've called this function
		 * @return {undefined}
		 */
		startTracking: function () {
			this.set("track", true);
			this.stack.track = true;
		},
		/**
		 * Stops tracking. Afterwards changes of registered objects won't be processed.
		 * @return {undefined}
		 */
		stopTracking: function () {
			this.set("track", false);
			this.stack.track = false;
		},
		/**
		 * Return the state of the tracking
		 * @return {boolean}
		 */
		isTracking: function () {
			return this.get("track");
		},
		/**
		 * This is the "all"-handler which is bound to registered 
		 * objects. It creates an UndoAction from the event and adds 
		 * it to the stack.
		 * 
		 * @param  {String} 	type 	The event type
		 * @return {undefined}
		 */
		_addToStack: function (type) {
			addToStack(this.stack, type, slice(arguments, 1), this.undoTypes);
		},
		/**
		 * Registers one or more objects to track their changes.
		 * @param {...Object} 	obj 	The object or objects of which changes should be tracked
		 * @return {undefined}
		 */
		register: function () {
			onoff("on", arguments, this._addToStack, this);
		},
		/**
		 * Unregisters one or more objects.
		 * @param {...Object} 	obj 	The object or objects of which changes shouldn't be tracked any longer
		 * @return {undefined}
		 */
		unregister: function () {
			onoff("off", arguments, this._addToStack, this);
		},
		/**
		 * Unregisters all previously registered objects.
		 * @return {undefined}
		 */
		unregisterAll: function () {
			apply(this.unregister, this, this.objectRegistry.get());
		},
		/**
		 * Undoes the last action or the last set of actions in case 'magic' is true.
		 * @param {Boolean} 	[magic] 	If true, all actions that happened basically at the same time are undone together
		 * @return {undefined}
		 */
		undo: function (magic) {
			managerUndoRedo("undo", this, this.stack, magic);
		},

		/**
		 * Undoes all actions ever tracked by the undo manager
		 * @return {undefined}
		 */
		undoAll: function () {
			managerUndoRedo("undo", this, this.stack, false, true);
		},

		/**
		 * Redoes a previously undone action or a set of actions.
		 * @param {Boolean} 	[magic] 	If true, all actions that happened basically at the same time are redone together
		 * @return {undefined}
		 */
		redo: function (magic) {
			managerUndoRedo("redo", this, this.stack, magic);
		},

		/**
		 * Redoes all actions ever tracked by the undo manager
		 * @return {undefined}
		 */
		redoAll: function () {
			managerUndoRedo("redo", this, this.stack, false, true);
		},
		/**
		 * Checks if there's an action in the stack that can be undone / redone
		 * @param  {String} 	type 	Either "undo" or "redo"
		 * @return {Boolean} True if there is a set of actions which can be undone / redone
		 */
		isAvailable: function (type) {
			var s = this.stack, l = s.length;

			switch (type) {
				case "undo": return l > 0 && s.pointer > -1;
				case "redo": return l > 0 && s.pointer < l - 1;
				default: return false;
			}
		},
		/**
		 * Sets the stack-reference to the stack of another undoManager.
		 * @param  {UndoManager} 	undoManager 	The undoManager whose stack-reference is set to this stack
		 * @return {undefined}
		 */
		merge: function (undoManager) {
			// This sets the stack-reference to the stack of another 
			// undoManager so that the stack of this other undoManager 
			// is used by two different managers.
			// This enables to set up a main-undoManager and besides it
			// several others for special, exceptional cases (by using
			// instance-based custom UndoTypes). Models / collections 
			// which need this special treatment are only registered at 
			// those special undoManagers. Those special ones are then 
			// merged into the main-undoManager to write on its stack. 
			// That way it's easier to manage exceptional cases.
			var args = _.isArray(undoManager) ? undoManager : slice(arguments), manager;
			while (manager = args.pop()) {
				if (manager instanceof UndoManager &&
					manager.stack instanceof UndoStack) {
					// set the stack reference to our stack
					manager.stack = this.stack;
				}
			}
		},
		/**
		 * Add an UndoType to this specific UndoManager-instance.
		 * @param {String} type The event this UndoType is made for
		 * @param {Object} fns  An object of functions that are called to generate the data for an UndoAction or to process it. Must have the properties "undo", "redo" and "on". Can have the property "condition".
		 * @return {undefined}
		 */
		addUndoType: function (type, fns) {
			manipulateUndoType(0, type, fns, this.undoTypes);
		},
		/**
		 * Overwrite properties of an existing UndoType for this specific UndoManager-instance.
		 * @param  {String} type The event the UndoType is made for
		 * @param  {Object} fns  An object of functions that are called to generate the data for an UndoAction or to process it. It extends the existing object.
		 * @return {undefined}
		 */
		changeUndoType: function (type, fns) {
			manipulateUndoType(1, type, fns, this.undoTypes);
		},
		/**
		 * Remove one or more UndoTypes of this specific UndoManager-instance to fall back to the global UndoTypes.
		 * @param  {String|Array} type The event the UndoType that should be removed is made for. You can also pass an array of events.
		 * @return {undefined}
		 */
		removeUndoType: function (type) {
			manipulateUndoType(2, type, undefined, this.undoTypes);
		},

		/**
		 * Removes all actions from the stack.
		 * @return {undefined}
		 */
		clear: function() {
			this.stack.reset();
			this.stack.pointer = -1;
		}
	});

	_.extend(UndoManager, {
		/**
		 * Change the UndoManager's default attributes
		 * @param  {Object} defaultAttributes An object with the new default values.
		 * @return {undefined}
		 */
		defaults: function (defaultAttributes) {
			_.extend(UndoManager.prototype.defaults, defaultAttributes);
		},
		/**
		 * Add an UndoType to the global UndoTypes-object.
		 * @param  {String} type The event this UndoType is made for
		 * @param  {Object} fns  An object of functions that are called to generate the data for an UndoAction or to process it. Must have the properties "undo", "redo" and "on". Can have the property "condition".
		 * @return {undefined}
		 */
		"addUndoType": function (type, fns) {
			manipulateUndoType(0, type, fns, UndoTypes);
		},
		/**
		 * Overwrite properties of an existing UndoType in the global UndoTypes-object.
		 * @param  {String} type The event the UndoType is made for
		 * @param  {Object} fns  An object of functions that are called to generate the data for an UndoAction or to process it. It extends the existing object.
		 * @return {undefined}
		 */
		"changeUndoType": function (type, fns) {
			manipulateUndoType(1, type, fns, UndoTypes)
		},
		/**
		 * Remove one or more UndoTypes of this specific UndoManager-instance to fall back to the global UndoTypes.
		 * @param  {String|Array} type The event the UndoType that should be removed is made for. You can also pass an array of events.
		 * @return {undefined}
		 */
		"removeUndoType": function (type) {
			manipulateUndoType(2, type, undefined, UndoTypes);
		}
	})

	return Backbone.UndoManager = UndoManager;

});

//     keymaster.js
//     (c) 2011-2013 Thomas Fuchs
//     keymaster.js may be freely distributed under the MIT license.

;(function(global){
  var k,
    _handlers = {},
    _mods = { 16: false, 18: false, 17: false, 91: false },
    _scope = 'all',
    // modifier keys
    _MODIFIERS = {
      '⇧': 16, shift: 16,
      '⌥': 18, alt: 18, option: 18,
      '⌃': 17, ctrl: 17, control: 17,
      '⌘': 91, command: 91
    },
    // special keys
    _MAP = {
      backspace: 8, tab: 9, clear: 12,
      enter: 13, 'return': 13,
      esc: 27, escape: 27, space: 32,
      left: 37, up: 38,
      right: 39, down: 40,
      del: 46, 'delete': 46,
      home: 36, end: 35,
      pageup: 33, pagedown: 34,
      ',': 188, '.': 190, '/': 191,
      '`': 192, '-': 189, '=': 187,
      ';': 186, '\'': 222,
      '[': 219, ']': 221, '\\': 220
    },
    code = function(x){
      return _MAP[x] || x.toUpperCase().charCodeAt(0);
    },
    _downKeys = [];

  for(k=1;k<20;k++) _MAP['f'+k] = 111+k;

  // IE doesn't support Array#indexOf, so have a simple replacement
  function index(array, item){
    var i = array.length;
    while(i--) if(array[i]===item) return i;
    return -1;
  }

  // for comparing mods before unassignment
  function compareArray(a1, a2) {
    if (a1.length != a2.length) return false;
    for (var i = 0; i < a1.length; i++) {
        if (a1[i] !== a2[i]) return false;
    }
    return true;
  }

  var modifierMap = {
      16:'shiftKey',
      18:'altKey',
      17:'ctrlKey',
      91:'metaKey'
  };
  function updateModifierKey(event) {
      for(k in _mods) _mods[k] = event[modifierMap[k]];
  };

  // handle keydown event
  function dispatch(event) {
    var key, handler, k, i, modifiersMatch, scope;
    key = event.keyCode;

    if (index(_downKeys, key) == -1) {
        _downKeys.push(key);
    }

    // if a modifier key, set the key.<modifierkeyname> property to true and return
    if(key == 93 || key == 224) key = 91; // right command on webkit, command on Gecko
    if(key in _mods) {
      _mods[key] = true;
      // 'assignKey' from inside this closure is exported to window.key
      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = true;
      return;
    }
    updateModifierKey(event);

    // see if we need to ignore the keypress (filter() can can be overridden)
    // by default ignore key presses if a select, textarea, or input is focused
    if(!assignKey.filter.call(this, event)) return;

    // abort if no potentially matching shortcuts found
    if (!(key in _handlers)) return;

    scope = getScope();

    // for each potential shortcut
    for (i = 0; i < _handlers[key].length; i++) {
      handler = _handlers[key][i];

      // see if it's in the current scope
      if(handler.scope == scope || handler.scope == 'all'){
        // check if modifiers match if any
        modifiersMatch = handler.mods.length > 0;
        for(k in _mods)
          if((!_mods[k] && index(handler.mods, +k) > -1) ||
            (_mods[k] && index(handler.mods, +k) == -1)) modifiersMatch = false;
        // call the handler and stop the event if neccessary
        if((handler.mods.length == 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91]) || modifiersMatch){
          if(handler.method(event, handler)===false){
            if(event.preventDefault) event.preventDefault();
              else event.returnValue = false;
            if(event.stopPropagation) event.stopPropagation();
            if(event.cancelBubble) event.cancelBubble = true;
          }
        }
      }
    }
  };

  // unset modifier keys on keyup
  function clearModifier(event){
    var key = event.keyCode, k,
        i = index(_downKeys, key);

    // remove key from _downKeys
    if (i >= 0) {
        _downKeys.splice(i, 1);
    }

    if(key == 93 || key == 224) key = 91;
    if(key in _mods) {
      _mods[key] = false;
      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = false;
    }
  };

  function resetModifiers() {
    for(k in _mods) _mods[k] = false;
    for(k in _MODIFIERS) assignKey[k] = false;
  };

  // parse and assign shortcut
  function assignKey(key, scope, method){
    var keys, mods;
    keys = getKeys(key);
    if (method === undefined) {
      method = scope;
      scope = 'all';
    }

    // for each shortcut
    for (var i = 0; i < keys.length; i++) {
      // set modifier keys if any
      mods = [];
      key = keys[i].split('+');
      if (key.length > 1){
        mods = getMods(key);
        key = [key[key.length-1]];
      }
      // convert to keycode and...
      key = key[0]
      key = code(key);
      // ...store handler
      if (!(key in _handlers)) _handlers[key] = [];
      _handlers[key].push({ shortcut: keys[i], scope: scope, method: method, key: keys[i], mods: mods });
    }
  };

  // unbind all handlers for given key in current scope
  function unbindKey(key, scope) {
    var multipleKeys, keys,
      mods = [],
      i, j, obj;

    multipleKeys = getKeys(key);

    for (j = 0; j < multipleKeys.length; j++) {
      keys = multipleKeys[j].split('+');

      if (keys.length > 1) {
        mods = getMods(keys);
      }

      key = keys[keys.length - 1];
      key = code(key);

      if (scope === undefined) {
        scope = getScope();
      }
      if (!_handlers[key]) {
        return;
      }
      for (i = 0; i < _handlers[key].length; i++) {
        obj = _handlers[key][i];
        // only clear handlers if correct scope and mods match
        if (obj.scope === scope && compareArray(obj.mods, mods)) {
          _handlers[key][i] = {};
        }
      }
    }
  };

  // Returns true if the key with code 'keyCode' is currently down
  // Converts strings into key codes.
  function isPressed(keyCode) {
      if (typeof(keyCode)=='string') {
        keyCode = code(keyCode);
      }
      return index(_downKeys, keyCode) != -1;
  }

  function getPressedKeyCodes() {
      return _downKeys.slice(0);
  }

  function filter(event){
    var tagName = (event.target || event.srcElement).tagName;
    // ignore keypressed in any elements that support keyboard data input
    return !(tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
  }

  // initialize key.<modifier> to false
  for(k in _MODIFIERS) assignKey[k] = false;

  // set current scope (default 'all')
  function setScope(scope){ _scope = scope || 'all' };
  function getScope(){ return _scope || 'all' };

  // delete all handlers for a given scope
  function deleteScope(scope){
    var key, handlers, i;

    for (key in _handlers) {
      handlers = _handlers[key];
      for (i = 0; i < handlers.length; ) {
        if (handlers[i].scope === scope) handlers.splice(i, 1);
        else i++;
      }
    }
  };

  // abstract key logic for assign and unassign
  function getKeys(key) {
    var keys;
    key = key.replace(/\s/g, '');
    keys = key.split(',');
    if ((keys[keys.length - 1]) == '') {
      keys[keys.length - 2] += ',';
    }
    return keys;
  }

  // abstract mods logic for assign and unassign
  function getMods(key) {
    var mods = key.slice(0, key.length - 1);
    for (var mi = 0; mi < mods.length; mi++)
    mods[mi] = _MODIFIERS[mods[mi]];
    return mods;
  }

  // cross-browser events
  function addEvent(object, event, method) {
    if (object.addEventListener)
      object.addEventListener(event, method, false);
    else if(object.attachEvent)
      object.attachEvent('on'+event, function(){ method(window.event) });
  };

  // set the handlers globally on document
  addEvent(document, 'keydown', function(event) { dispatch(event) }); // Passing _scope to a callback to ensure it remains the same by execution. Fixes #48
  addEvent(document, 'keyup', clearModifier);

  // reset modifiers to false whenever the window is (re)focused.
  addEvent(window, 'focus', resetModifiers);

  // store previously defined key
  var previousKey = global.key;

  // restore previously defined key and return reference to our key object
  function noConflict() {
    var k = global.key;
    global.key = previousKey;
    return k;
  }

  // set window.key and window.key.set/get/deleteScope, and the default filter
  global.key = assignKey;
  global.key.setScope = setScope;
  global.key.getScope = getScope;
  global.key.deleteScope = deleteScope;
  global.key.filter = filter;
  global.key.isPressed = isPressed;
  global.key.getPressedKeyCodes = getPressedKeyCodes;
  global.key.noConflict = noConflict;
  global.key.unbind = unbindKey;

  if(typeof module !== 'undefined') module.exports = assignKey;

})(this);

define("keymaster", (function (global) {
    return function () {
        var ret, fn;
        return ret || global.keymaster;
    };
}(this)));

define('AssetManager/config/config',[],function () {
	return {
		
		// Style prefix
		stylePrefix			: 'am-',
		
		// Default assets
		assets				: [],
		
		// Indicates which storage to use. Available: local | remote
		storageType			: 'local',
		
		// The name that will be used to identify assets inside storage.
		//	If empty will be used: prefix + 'assets'
		storageName			: 'assets',
		
		// Where store remote assets
		urlStore			: 'http://localhost/assets/store',
		
		// Where fetch remote assets
		urlLoad				: 'http://localhost/assets/load',
		
		// Custom parameters to pass with set request
		paramsStore			: {},
		
		// Custom parameters to pass with get request
		paramsLoad			: {},
		
		// Callback before request
		beforeSend			: function(jqXHR,settings){},
		
		// Callback after request
		onComplete			: function(jqXHR,status){},
		
		// Url where uploads will be send
		urlUpload			: 'http://localhost/assets/upload',
		
		// Text on upload input
		uploadText			: 'Drop files here or click to upload',
		
		// Disable upload input
		disableUpload		: false,
		
		// Store assets data where the new one is added or deleted
		storeOnChange		: true,
		
		// It could be useful avoid to send other requests, for saving assets, 
		// after each upload because the uploader script has already done it
		storeAfterUpload	: false,
		
	};
});
define('AssetManager/model/Asset',['backbone'], 
	function (Backbone) {
		/**
		 * @class Asset
		 * */
		return Backbone.Model.extend({ 
			
			defaults: {
				type:	'none',			//Type of the asset
				src:	'',				//Location
			},
			
			initialize: function(options) {
				this.options = options || {};
			},
			
			/**
			 * Get filename of the asset 
			 * 
			 * @return	{String}
			 * */
			getFilename: function(){
				return  this.get('src').split('/').pop(); 
			},
			
			/**
			 * Get extension of the asset 
			 * 
			 * @return	{String}
			 * */
			getExtension: function(){
				return  this.getFilename().split('.').pop(); 
			},
			
		});
});

define('AssetManager/model/Assets',['backbone','./Asset'], 
	function (Backbone, Asset) {
		/**
		 * @class Assets
		 * */
		return Backbone.Collection.extend({ 
			
			model:	Asset,
			
		});
});

define('AssetManager/view/AssetView',['backbone'], 
	function (Backbone) {
	/** 
	 * @class AssetView
	 * */
	return Backbone.View.extend({
			
		initialize: function(o) {
			this.options 	= o;
			this.config		= o.config || {};
			this.pfx		= this.config.stylePrefix;
			this.className	= this.pfx + 'asset';
			this.listenTo( this.model, 'destroy remove', this.remove );
		},
		
	});
});

/**
 * @license RequireJS text 2.0.14 Copyright (c) 2010-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/text for details
 */
/*jslint regexp: true */
/*global require, XMLHttpRequest, ActiveXObject,
  define, window, process, Packages,
  java, location, Components, FileUtils */

define('text',['module'], function (module) {
    'use strict';

    var text, fs, Cc, Ci, xpcIsWindows,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = {},
        masterConfig = (module.config && module.config()) || {};

    text = {
        version: '2.0.14',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var modName, ext, temp,
                strip = false,
                index = name.lastIndexOf("."),
                isRelative = name.indexOf('./') === 0 ||
                             name.indexOf('../') === 0;

            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1);
            } else {
                modName = name;
            }

            temp = ext || modName;
            index = temp.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = temp.substring(index + 1) === "strip";
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || uPort === port);
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config && config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config && config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName +
                    (parsed.ext ? '.' + parsed.ext : ''),
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            // Do not load if it is an empty: url
            if (url.indexOf('empty:') === 0) {
                onLoad();
                return;
            }

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                extPart = parsed.ext ? '.' + parsed.ext : '',
                nonStripName = parsed.moduleName + extPart,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
            typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node &&
            !process.versions['node-webkit'] &&
            !process.versions['atom-shell'])) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file[0] === '\uFEFF') {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                if (errback) {
                    errback(e);
                }
            }
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
            text.createXhr())) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);

            //Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status || 0;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        if (errback) {
                            errback(err);
                        }
                    } else {
                        callback(xhr.responseText);
                    }

                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
            typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                if (line !== null) {
                    stringBuffer.append(line);
                }

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || (!masterConfig.env &&
            typeof Components !== 'undefined' && Components.classes &&
            Components.interfaces)) {
        //Avert your gaze!
        Cc = Components.classes;
        Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');
        xpcIsWindows = ('@mozilla.org/windows-registry-key;1' in Cc);

        text.get = function (url, callback) {
            var inStream, convertStream, fileObj,
                readData = {};

            if (xpcIsWindows) {
                url = url.replace(/\//g, '\\');
            }

            fileObj = new FileUtils.File(url);

            //XPCOM, you so crazy
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1']
                           .createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);

                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1']
                                .createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, "utf-8", inStream.available(),
                Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
});


define('text!AssetManager/template/assetImage.html',[],function () { return '<div id="<%= pfx %>preview" style="background-image: url(<%= src %>);"></div>\n<div id="<%= pfx %>meta">\n\t<div id="<%= pfx %>name"><%= name %></div>\n\t<div id="<%= pfx %>dimensions"><%= dim %></div>\n</div>\n<div id="<%= pfx %>close">&Cross;</div>\n<div style="clear:both"></div>';});

define('AssetManager/view/AssetImageView',['./AssetView','text!./../template/assetImage.html'],
	function (AssetView, assetTemplate) {
	/**
	 * @class AssetImageView
	 * */
	return AssetView.extend({

		events:{
			'click' 			: 'selected',
			'dblclick' 		: 'chosen',
		},

		template: _.template(assetTemplate),

		initialize: function(o) {
			AssetView.prototype.initialize.apply(this, arguments);
			this.className	+= ' ' + this.pfx + 'asset-image';
			this.events['click #' + this.pfx + 'close']	= 'removeItem';
			this.delegateEvents();
		},

		/**
		 * Trigger when asset is been selected
		 *
		 * @return void
		 * */
		selected: function(){
			this.model.collection.trigger('deselectAll');
			this.$el.addClass(this.pfx + 'highlight');

			this.updateTarget(this.model.get('src'));
		},

		/**
		 * Trigger when asset is been chosen (double clicked)
		 *
		 * @return void
		 * */
		chosen: function(){
			this.updateTarget(this.model.get('src'));
			var f				=  this.model.collection.onSelect;
			if(f && typeof f == 'function'){
				f(this.model);
			}
		},

		/**
		 * Update target if exists
		 * @param	{String}	v 	Value
		 *
		 * @return 	void
		 * */
		updateTarget: function(v){
			var target			= this.model.collection.target;
			if(target && target.set){
				var attr		= _.clone( target.get('attributes') );
				attr['class'] 	= [];
				target.set('attributes', attr );
				target.set('src', v );
			}
		},

		/**
		 * Remove asset from collection
		 *
		 * @return void
		 * */
		removeItem: function(e){
			e.stopPropagation();
			this.model.collection.remove(this.model);
		},

		render : function(){
			var name 	= this.model.get('name'),
				dim  	= this.model.get('width') && this.model.get('height') ?
							this.model.get('width')+' x '+this.model.get('height') : '';
			name		= name ? name : this.model.get('src').split("/").pop();
			name 		= name && name.length > 30 ? name.substring(0, 30)+'...' : name;
			dim		 	= dim ? dim + (this.model.get('unitDim') ? this.model.get('unitDim') : ' px' ) : '';
			this.$el.html( this.template({
				name: 	name,
				src: 	this.model.get('src'),
				dim:	dim,
				pfx:	this.pfx
			}));
			this.$el.attr('class', this.className);
			return this;
		},
	});
});


define('text!AssetManager/template/fileUploader.html',[],function () { return '<form>\n\t<div id="<%= pfx %>title"><%= title %></div>\n\t<input type="file" id="<%= uploadId %>" name="file" accept="image/*" <%= disabled ? \'disabled\' : \'\' %> multiple/>\n\t<div style="clear:both;"></div>\n</form>';});

define('AssetManager/view/FileUploader',['backbone', 'text!./../template/fileUploader.html'],
	function (Backbone, fileUploaderTemplate) {
	/**
	 * @class FileUploader
	 * */

	return Backbone.View.extend({

		template: 	_.template(fileUploaderTemplate),

		events: 	{},

		initialize: function(o) {
			this.options 	= o || {};
			this.config		= o.config	|| {};
			this.pfx		= this.config.stylePrefix;
			this.target		= this.collection || {};
			this.uploadId	= this.pfx + 'uploadFile';
			this.disabled	= this.config.disableUpload;
			this.events['change #' + this.uploadId]	= 'uploadFile';
			this.delegateEvents();
		},

		/**
		 * Upload files
		 * @param	{Object}	e Event
		 *
		 * @return 	void
		 * */
		uploadFile : function(e){
			var files		= e.dataTransfer ? e.dataTransfer.files : e.target.files,
				formData 	= new FormData();
			for (var i = 0; i < files.length; i++) {
		    	formData.append('files[]', files[i]);
		    }
			var target = this.target;
			$.ajax({
				url			: this.config.urlUpload, //this.config.urlUpload
				type		: 'POST',
				data		: formData,
				beforeSend	: this.config.beforeSend,
				complete	: this.config.onComplete,
				xhrFields	: {
					onprogress: function (e) {
						if (e.lengthComputable) {
							/*var result = e.loaded / e.total * 100 + '%';*/
						}
					},
					onload: function (e) {
					    //progress.value = 100;
					}
				},
				cache: false, contentType: false, processData: false
			}).done(function(data){
				target.add(data.data);
			}).always(function(){
				//turnOff loading
			});
		},

		/**
		 * Make input file droppable
		 *
		 * @return 	void
		 * */
		initDrop: function(){
			var that	= this;
			if(!this.uploadForm){
				this.uploadForm = this.$el.find('form').get(0);
				if( 'draggable' in this.uploadForm ){
					var uploadFile = this.uploadFile;
					this.uploadForm.ondragover = function(){
						this.className = that.pfx + 'hover';
						return false;
					};
					this.uploadForm.ondragleave = function(){
						this.className = '';
						return false;
					};
					this.uploadForm.ondrop = function(e){
						this.className = '';
						e.preventDefault();
						that.uploadFile(e);
						return;
					};
				}
			}
		},

		render : function(){
			this.$el.html( this.template({
				title		: this.config.uploadText,
				uploadId	: this.uploadId,
				disabled	: this.disabled,
				pfx			: this.pfx
			}) );
			this.initDrop();
			this.$el.attr('class', this.pfx + 'file-uploader');
			return this;
		},

	});
});

define('AssetManager/view/AssetsView',['backbone', './AssetView', './AssetImageView', './FileUploader'], 
	function (Backbone, AssetView, AssetImageView, FileUploader) {
	/** 
	 * @class AssetsView
	 * */
	return Backbone.View.extend({
		
		initialize: function(o) {
			this.options 	= o;
			this.config		= o.config;
			this.pfx		= this.config.stylePrefix;
			this.listenTo( this.collection, 'add', this.addToAsset );
			this.listenTo( this.collection, 'deselectAll', this.deselectAll );
			this.className	= this.pfx + 'assets';
			
			// Check if storage is required and if Storage Manager is available
			if(this.config.stm && this.config.storageType !== ''){
				var type		= this.config.storageType;
				this.provider	= this.config.stm.getProvider(type);
				this.storeName	= this.config.storageName ? this.config.storageName : this.className;
				if(this.provider){
					// Create new instance of provider
					this.storagePrv	= this.provider.clone().set(this.config);
					this.collection.reset();
					this.collection.add(this.load());
					if(this.config.storeOnChange){
						var ev	= 'remove' + (this.config.storeAfterUpload ? ' add' : '');
						this.listenTo(this.collection, ev, this.store);
					}
				}
			}
		},
		
		/**
		 * Store collection
		 * 
		 * @return void
		 * */
		store: function(){
			if(this.storagePrv)
				this.storagePrv.store(this.storeName, JSON.stringify(this.collection.toJSON()) );
		},
		
		/**
		 * Load collection
		 * 
		 * @return 	{Object}
		 * */
		load: function(){
			var result	= null;
			if(this.storagePrv)
				result = this.storagePrv.load(this.storeName);
			if(typeof result !== 'object'){
				try{
					result	= JSON.parse(result);
				}catch(err){
					console.warn(err);
				}
			}
			return result;
		},
		
		/**
		 * Add asset to collection
		 * */
		addToAsset: function(model){
			this.addAsset(model);
		},
		
		/**
		 * Add new asset to collection
		 * @param Object Model
		 * @param Object Fragment collection
		 * 
		 * @return Object Object created
		 * */
		addAsset: function(model, fragmentEl){
			var fragment	= fragmentEl || null;
			var viewObject	= AssetView;
			
			if(model.get('type').indexOf("image") > -1)
				viewObject	= AssetImageView;
			
			var view 		= new viewObject({
				model	: model,
				config	: this.config,
			});
			var rendered	= view.render().el;
			
			if(fragment){
				fragment.appendChild( rendered );
			}else{
				this.$el.prepend(rendered);
			}
			
			return rendered;
		},
		
		/**
		 * Deselect all assets
		 * 
		 * @return void
		 * */
		deselectAll: function(){
			this.$el.find('.' + this.pfx + 'highlight').removeClass(this.pfx + 'highlight');
		},
		
		render: function() {
			var fragment = document.createDocumentFragment();
			this.$el.empty();
			
			this.collection.each(function(model){
				this.addAsset(model, fragment);
			},this);
			
			this.$el.append(fragment);
			this.$el.attr('class', this.className);
			
			return this;
		}
	});
});

define('AssetManager/main',['require','./config/config','./model/Assets','./view/AssetsView','./view/FileUploader'],function(require) {
	/**
	 * @class 	AssetManager
	 * @param 	{Object} Configurations
	 * 
	 * @return	{Object}
 	 * */
	var AssetManager	= function(config)
	{
		var c			= config || {},
			defaults	= require('./config/config'),
			Assets		= require('./model/Assets'),
			AssetsView	= require('./view/AssetsView'),
			FileUpload	= require('./view/FileUploader');

		for (var name in defaults) { 
			if (!(name in c))
				c[name] = defaults[name];
		}
		
		this.assets		= new Assets(c.assets);
		var obj				= {
				collection	: this.assets,
		    	config		: c,
		};
		
	    this.am 		= new AssetsView(obj);
	    this.fu 		= new FileUpload(obj);
	};
	
	AssetManager.prototype	= {
			
			/**
			 * Get collection of assets
			 * 
			 * @return	{Object}
			 * */
			getAssets	: function(){
				return	this.assets;
			},
			
			/**
			 * Set new target
			 * @param	{Object}	m Model
			 * 
			 * @return	void
			 * */
			setTarget	: function(m){
				this.am.collection.target = m;
			},
			
			/**
			 * Set callback after asset was selected
			 * @param	{Object}	f Callback function
			 * 
			 * @return	void
			 * */
			onSelect	: function(f){
				this.am.collection.onSelect = f;
			},
			
			render		: function(){
				if(!this.rendered)
					this.rendered	= this.am.render().$el.add(this.fu.render().$el);
				return	this.rendered;
			},
	};
	
	return AssetManager;
});
define('AssetManager', ['AssetManager/main'], function (main) { return main; });

define('StorageManager/config/config',[],function () {
	return {
		// Enable/Disable autosaving
		autosave 			: 1,
		
		// Indicates which storage to use. Available: local | remote
		storageType			: 'local',
		
		// If autosave enabled, indicates how many changes (general changes to structure)
		changesBeforeSave	: 1,
		
		// Defaults for remote storage
		remoteStorage		: {
			//Enable/Disable components model (JSON format)
			storeComponents: 	true,
			//Enable/Disable styles model (JSON format)
			storeStyles: 		false,
			//Enable/Disable saving HTML template
			storeHTML: 			false,
			/**
			 * Url where to save all stuff.
			 * The request will send a POST via AJAX, like this:
			 * {
			 * 		components: '',
			 * 		style:		'',
			 * 		html:		'', 			//if storeHTML is enabled
			 * }
			 * */
			urlStore: '',
			/**
			 * Use this url to fetch model data, does expect in response something like this: 
			 * { data: { 
			 * 		components: '', 
			 * 		style: '', 
			 * } }
			 */
			urlLoad: '',
			/**
			 * Url where assets will be send
			 * */
			urlUpload: '',
			paramsStore	:{},							//Custom parameters to pass with set request
			paramsLoad	:{},							//Custom parameters to pass with get request
			beforeSend	: function(jqXHR,settings){},	//Callback before request
			onComplete	: function(jqXHR,status){},	//Callback after request
		},
		
		// Defaults for local storage
		localStorage		: {},
	};
});
define('StorageManager/model/LocalStorage',['backbone'],
	function (Backbone) {
		/**
		 * @class LocalStorage
		 * */
		return Backbone.Model.extend({

			defaults: {
				checkSupport		: true,
				errorNoSupport		: 'Error encountered while parsing JSON response',
			},

			/** @inheritdoc */
			getId	: function() {
				return	'local';
			},

			/** @inheritdoc */
			store	: function(name, value) {
				this.checkStorageEnvironment();
				localStorage.setItem(name, value );
			},

			/** @inheritdoc */
			load: function(name){
				var result	= null;
				this.checkStorageEnvironment();
				if(localStorage.getItem(name))
					result 	= localStorage.getItem(name);
				try{
					var prx	= "Loading '" + name + "': ";
					if(!result)
						throw prx + ' Resource was not found';
				}catch(err){
					console.warn(err);
				}
				return result;
			},

			/** @inheritdoc */
			remove	: function(name) {
				this.checkStorageEnvironment();
				localStorage.removeItem(name);
			},

			/**
			 * Check storage environment
			 * @return void
			 * */
			checkStorageEnvironment: function(){
				if(this.get('checkSupport'))
					if( !localStorage )
						console.warn(this.get('errorNoSupport'));
			},

		});
});

define('StorageManager/model/RemoteStorage',['backbone'],
	function (Backbone) {
		/**
		 * @class RemoteStorage
		 * */
		return Backbone.Model.extend({

			defaults: {
				urlLoad				: 'http://localhost/load',
				urlStore			: 'http://localhost/store',
				beforeSend			: function(){},
				onComplete			: function(){},
				paramsStore			: {},
				paramsLoad			: {},
				errorLoad			: 'Response is not a valid JSON',
			},

			/** @inheritdoc */
			getId	: function() {
				return	'remote';
			},

			/** @inheritdoc */
			store	: function(name, value) {
				var fd 		= new FormData(),
					params	= this.get('paramsStore');
				fd.append( name, value );
				for(var key in params){
					fd.append(key, params[key] );
				}
				$.ajax({
					url: 			this.get('urlStore'),
					beforeSend: 	this.get('beforeSend'),
					complete:		this.get('onComplete'),
					type: 			'POST',
					processData:	false,
					contentType: 	false,
					data: 			fd,
				});
			},

			/** @inheritdoc */
			load: function(name){
				var result 	= null,
					t		= this;
				$.ajax({
					url				:	this.get('urlLoad'),
					beforeSend		: 	this.get('beforeSend'),
					complete		:	this.get('onComplete'),
					data			: 	this.get('paramsLoad'),
					async			:   false,
					type			: 	'GET',
				}).done(function(d){
					try{
						var prx	= "Loading '" + name + "': ";

						if(typeof d !== 'object')
							throw prx + t.get('errorLoad');

						result = d.data ? d.data[name] : d[name];

						if(!result)
							throw prx + ' Resource was not found';

					}catch(err){
						console.warn(err);
					}
				});
				return result;
			},

			/** @inheritdoc */
			remove	: function(name) {

			},

		});
});

define('StorageManager/model/StorageInterface',[],function() {
	/**
	 * @class 	StorageInterface
	 * */
	function StorageInterface() {}

	StorageInterface.prototype = {
			
		getId	: function() {},
			
		store	: function(name, value) {},
		
		load	: function(name) {},
		
		remove	: function(name) {},
	};

	return StorageInterface;
});
define('StorageManager/main',['require','./config/config','./model/LocalStorage','./model/RemoteStorage','./model/StorageInterface'],function(require) {
	/**
	 * @class 	StorageManager
	 * @param 	{Object} Configurations
	 *
	 * @return	{Object}
 	 * */
	function StorageManager(config)
	{
		var c					= config || {},
			defaults			= require('./config/config'),
			LocalStorage		= require('./model/LocalStorage'),
			RemoteStorage		= require('./model/RemoteStorage'),
			StorageInterface	= require('./model/StorageInterface');

		for (var name in defaults){
			if (!(name in c))
				c[name] = defaults[name];
		}

		this.providers			= {};
		this.defaultProviders	= {};
		this.autosave			= c.autosave;
		this.currentProvider	= c.storageType || null;
		this.changesBeforeSave	= c.changesBeforeSave;
		this.si					= new StorageInterface();

		var Local				= new LocalStorage(c.localStorage),
			Remote				= new RemoteStorage(c.remoteStorage);

		this.defaultProviders[Local.getId()]	= Local;
		this.defaultProviders[Remote.getId()]	= Remote;
	}

	StorageManager.prototype	= {

			/**
			 * Check if autosave enabled
			 *
			 * @return	boolean
			 * */
			isAutosave	: function(){
				return this.autosave;
			},

			/**
			 * Set autosave
			 * @param	{Mixed}	v	Value
			 *
			 * @return	this
			 * */
			setAutosave	: function(v){
				this.autosave	= v;
				return this;
			},

			/**
			 * Returns value of changes required before save
			 *
			 * @return	{Integer}
			 * */
			getChangesBeforeSave	: function(){
				return this.changesBeforeSave;
			},

			/**
			 * Set changesBeforeSave value
			 * @param	{Mixed}	v	Value
			 *
			 * @return	this
			 * */
			setChangesBeforeSave	: function(v){
				this.changesBeforeSave	= v;
				return this;
			},

			/**
			 * Add new storage provider
			 * @param	{StorageInterface} provider
			 *
			 * @return 	self
			 * */
			addProvider	: function(provider) {
				// Check interface implementation
				for (var method in this.si)
					if(!provider[method])
						console.warn("addProvider: method '"+ method +"' was not found inside '"+ provider.getId() +"' object");

				this.providers[provider.getId()] = provider;
				if(!this.currentProvider)
					this.currentProvider		 =	provider.getId();
				return this;
			},

			/**
			 * Returns storage provider
			 * @param	{Integer}	id	Storage provider ID
			 *
			 * @return 	{StorageInterface}|null
			 * */
			getProvider	: function(id){
				var provider	= null;
				if(id && this.providers[id])
					provider	= this.providers[id];
				return provider;
			},

			/**
			 * Returns storage providers
			 *
			 * @return 	{Array}
			 * */
			getProviders	: function(){
				return this.providers;
			},

			/**
			 * Get current provider
			 *
			 * @return {StorageInterface}
			 * */
			getCurrentProvider		: function() {
				if(!this.currentProvider)
					this.loadDefaultProviders();
				return this.getProvider(this.currentProvider);
			},

			/**
			 * Set current provider
			 * @param	{Integer}	id	Storage provider ID
			 *
			 * @return this
			 * */
			setCurrentProvider		: function(id) {
				this.currentProvider	= id;
				return this;
			},

			/**
			 * Load default providers
			 *
			 * @return this
			 * */
			loadDefaultProviders	: function() {
				for (var id in this.defaultProviders) {
					this.addProvider(this.defaultProviders[id]);
				}
				return this;
			},

			/**
			 * Store resource
			 * @param	{String}	name	Name of the resource
			 * @param	{String}	value	Value of the resource
			 *
			 * @return 	{Object}|void
			 * */
			store		: function(name, value){
				return	this.getCurrentProvider().store(name, value);
			},

			/**
			 * Load resource
			 * @param	{String}	name	Name of the resource
			 *
			 * @return 	{Object}|void
			 * */
			load	: function(name){
				return	this.getCurrentProvider().load(name);
			},

			/**
			 * Remove resource
			 * @param	{String}	name	Name of the resource
			 *
			 * @return 	{Object}|void
			 * */
			remove	: function(name){
				return	this.getCurrentProvider().remove(name);
			},
	};

	return StorageManager;
});
define('StorageManager', ['StorageManager/main'], function (main) { return main; });

define('ModalDialog/config/config',[],function () {
	return {
		
		stylePrefix		: 'mdl-',
		
		title			: '',
		
		content			: '',
		
		backdrop		: true,
		
	};
});
define('ModalDialog/model/Modal',['backbone'],
	function(Backbone) {
		/** 
		 * @class Modal
		 * */
		return Backbone.Model.extend({
			
			defaults: {
				title 		: '',
				content		: '',
				open 		: false,
			}
		
        });
	});

define('text!ModalDialog/template/modal.html',[],function () { return '<div class="<%= pfx %>dialog">\n\t<div class="<%= pfx %>header">\n\t\t<div class="<%= pfx %>title"><%= title %></div>\n\t\t<div class="<%= pfx %>btn-close">&Cross;</div>\n\t</div>\n\t<div class="<%= pfx %>content">\n\t\t<div id="<%= pfx %>c"> <%= content %> </div>\n\t\t<div style="clear:both"></div>\n\t</div>\n</div>\n<div class="<%= pfx %>backlayer"></div>';});

define('ModalDialog/view/ModalView',['backbone', 'text!./../template/modal.html'],
	function (Backbone, modalTemplate) {
		/**
		 * @class ModalView
		 * */
		return Backbone.View.extend({

			template: _.template(modalTemplate),

			events	: {},

			initialize: function(o){
				this.config		= o.config || {};
				this.pfx		= this.config.stylePrefix;
				this.listenTo( this.model, 'change:open', 	this.updateOpen);
				this.listenTo( this.model, 'change:title', 	this.updateTitle);
				this.listenTo( this.model, 'change:content',this.updateContent);
				this.events['click .'+this.pfx+'btn-close']	= 'hide';

				if(this.config.backdrop)
					this.events['click .'+this.pfx+'backlayer'] = 'hide';

				this.delegateEvents();
			},

			/**
			 * Update content
			 *
			 * @return	void
			 * */
			updateContent: function(){
				if(!this.$content)
					this.$content	= this.$el.find('.'+this.pfx+'content #'+this.pfx+'c');
				this.$content.html(this.model.get('content'));
			},

			/**
			 * Update title
			 *
			 * @return	void
			 * */
			updateTitle: function(){
				if(!this.$title)
					this.$title	= this.$el.find('.'+this.pfx+'title');
				this.$title.html(this.model.get('title'));
			},

			/**
			 * Update open
			 *
			 * @return	void
			 * */
			updateOpen: function(){
				if(this.model.get('open'))
					this.$el.show();
				else
					this.$el.hide();
			},

			/**
			 * Hide modal
			 *
			 * @return void
			 * */
			hide: function(){
				this.model.set('open', 0);
			},

			/**
			 * Show modal
			 *
			 * @return void
			 * */
			show: function(){
				this.model.set('open', 1);
			},

			/**
			 * Set title
			 * @param	{String}	v Title
			 *
			 * @return 	this
			 * */
			setTitle: function(v){
				this.model.set('title',v);
				return this;
			},

			/**
			 * Set content
			 * @param	{String}	v Title
			 *
			 * @return 	this
			 * */
			setContent: function(v){
				this.model.set('content',v);
				return this;
			},

			render : function(){
				var	obj		= this.model.toJSON();
				obj.pfx		= this.pfx;
				this.$el.html( this.template(obj) );
				this.$el.attr('class', this.pfx + 'container');
				this.updateOpen();

				return this;
			},

		});
});

define('ModalDialog/main',['require','./config/config','./model/Modal','./view/ModalView'],function(require) {
	/**
	 * @class 	Modal
	 * @param 	{Object} Configurations
	 * 
	 * @return	{Object}
 	 * */
	function Modal(config)
	{
		var c			= config || {},
			defaults	= require('./config/config'),
			ModalM		= require('./model/Modal'),
			ModalView	= require('./view/ModalView');

		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}
		
		this.model		= new ModalM(c);
		var obj			= {
				model	: this.model,
		    	config	: c,
		};

	    this.modal 		= new ModalView(obj);
	}
	
	Modal.prototype	= {
			
			getModel	: function(){
				return	this.model;
			},
			
			render		: function(){
				return	this.modal.render().$el;
			},
			
			show		: function(){
				return this.modal.show();
			},
			
			hide		: function(){
				return this.modal.hide();
			},
			
			setTitle	: function(v){
				return this.modal.setTitle(v);
			},
			
			setContent	: function(v){
				return this.modal.setContent(v);
			},
	};
	
	return Modal;
});
define('ModalDialog', ['ModalDialog/main'], function (main) { return main; });

define('CodeManager/config/config',[],function () {
	return {
		// Style prefix
		stylePrefix			: 'cm-',
	};
});
define('CodeManager/model/GeneratorInterface',[],function() {
	/**
	 * @class 	GeneratorInterface
	 * */
	function GeneratorInterface() {}

	GeneratorInterface.prototype = {
		
		/**
		 * Get id
		 * 
		 * @return	{String}|{Integer}
		 * */
		getId	: function(){},
		
		/**
		 * Generate code from model
		 * @param	{Backbone.Model}	model
		 * 
		 * @return	{String}
		 * */
		build	: function(model){},
	};

	return GeneratorInterface;
});
define('CodeManager/model/HtmlGenerator',['backbone'], 
	function (Backbone) {
		/**
		 * @class HtmlGenerator
		 * */
		return Backbone.Model.extend({
			
			/** @inheritdoc */
			getId	: function(){ 
				return 'html'; 
			},
			
			/** @inheritdoc */
			build: function(model){
				var coll 	= model.get('components') || model,
					code 	= '';
				
				coll.each(function(m){
					var tag 	= m.get('tagName'),		// Tag name
						attr 	= '',					// Attributes string
						cln		= m.get('components');	// Children
					
					_.each(m.get('attributes'),function(value, prop){
						attr 	+= value && prop!='style' ? ' ' + prop + '="' + value + '" ' : '';
					});
					
					code += '<'+tag+' id="'+m.cid+'"' + attr + '>' + m.get('content');
					
					if(cln.length)
						code += this.build(cln);
					
					code += '</'+tag+'>';
				}, this);
				
				return code;
			},
			
		});
});

define('CodeManager/model/CssGenerator',['backbone'], 
	function (Backbone) {
		/**
		 * @class CssGenerator
		 * */
		return Backbone.Model.extend({
			
			/** @inheritdoc */
			getId	: function()
			{
				return 'css'; 
			},
			
			/** @inheritdoc */
			build: function(model)
			{
				
				var coll 	= model.get('components') || model,
					code 	= '';
				
				coll.each(function(m){
					var css 	= m.get('style'),
						cln		= m.get('components');	// Children
					
					if(css && Object.keys(css).length !== 0){
						code 	+= '#' + m.cid + '{';
						
						for(var prop in css)
							if(css.hasOwnProperty(prop))
								code += prop + ': ' + css[prop] + ';';
						
						code 	+= '}';
					}
					
					if(cln.length)
						code 	+= this.build(cln);
					
				}, this);
				
				return code;
			},
			
		});
});

define('CodeManager/model/JsonGenerator',['backbone'], 
	function (Backbone) {
		/**
		 * @class JsonGenerator
		 * */
		return Backbone.Model.extend({
			
			/** @inheritdoc */
			getId	: function()
			{
				return 'json'; 
			},
			
			/** @inheritdoc */
			build: function(model)
			{
				var json	= model.toJSON();
				
				// Avoid jshint 'loopfunc' error
				_.each(json,function(v, attr){
					var obj	= json[attr];
					if(obj instanceof Backbone.Model){
						json[attr] = this.build(obj);
					}else if(obj instanceof Backbone.Collection){
						var coll	= obj;
						json[attr]	= [];
						if(coll.length){
							coll.each(function (el, index) {
								json[attr][index] = this.build(el);
							}, this);
						}
					}
					
				}, this);
				
				return json;
			},
			
		});
});

define('CodeManager/model/EditorInterface',[],function() {
	/**
	 * @class 	EditorInterface
	 * */
	function EditorInterface() {}

	EditorInterface.prototype = {
		
		/**
		 * Get id
		 * 
		 * @return	{String}|{Integer}
		 * */
		getId	: function(){},
		
		/**
		 * Set content
		 * @param	{String}	str
		 * 
		 * */
		setContent	: function(str){},
		
		/**
		 * Init editor
		 * @param	{Object}	el	DOM element
		 * */
		init	: function(el){},
	};

	return EditorInterface;
});
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// This is CodeMirror (http://codemirror.net), a code editor
// implemented in JavaScript on top of the browser's DOM.
//
// You can find some technical background for some of the code below
// at http://marijnhaverbeke.nl/blog/#cm-internals .

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    module.exports = mod();
  else if (typeof define == "function" && define.amd) // AMD
    return define('codemirror/lib/codemirror',[], mod);
  else // Plain browser env
    (this || window).CodeMirror = mod();
})(function() {
  "use strict";

  // BROWSER SNIFFING

  // Kludges for bugs and behavior differences that can't be feature
  // detected are enabled based on userAgent etc sniffing.
  var userAgent = navigator.userAgent;
  var platform = navigator.platform;

  var gecko = /gecko\/\d/i.test(userAgent);
  var ie_upto10 = /MSIE \d/.test(userAgent);
  var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(userAgent);
  var ie = ie_upto10 || ie_11up;
  var ie_version = ie && (ie_upto10 ? document.documentMode || 6 : ie_11up[1]);
  var webkit = /WebKit\//.test(userAgent);
  var qtwebkit = webkit && /Qt\/\d+\.\d+/.test(userAgent);
  var chrome = /Chrome\//.test(userAgent);
  var presto = /Opera\//.test(userAgent);
  var safari = /Apple Computer/.test(navigator.vendor);
  var mac_geMountainLion = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(userAgent);
  var phantom = /PhantomJS/.test(userAgent);

  var ios = /AppleWebKit/.test(userAgent) && /Mobile\/\w+/.test(userAgent);
  // This is woefully incomplete. Suggestions for alternative methods welcome.
  var mobile = ios || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(userAgent);
  var mac = ios || /Mac/.test(platform);
  var windows = /win/i.test(platform);

  var presto_version = presto && userAgent.match(/Version\/(\d*\.\d*)/);
  if (presto_version) presto_version = Number(presto_version[1]);
  if (presto_version && presto_version >= 15) { presto = false; webkit = true; }
  // Some browsers use the wrong event properties to signal cmd/ctrl on OS X
  var flipCtrlCmd = mac && (qtwebkit || presto && (presto_version == null || presto_version < 12.11));
  var captureRightClick = gecko || (ie && ie_version >= 9);

  // Optimize some code when these features are not used.
  var sawReadOnlySpans = false, sawCollapsedSpans = false;

  // EDITOR CONSTRUCTOR

  // A CodeMirror instance represents an editor. This is the object
  // that user code is usually dealing with.

  function CodeMirror(place, options) {
    if (!(this instanceof CodeMirror)) return new CodeMirror(place, options);

    this.options = options = options ? copyObj(options) : {};
    // Determine effective options based on given values and defaults.
    copyObj(defaults, options, false);
    setGuttersForLineNumbers(options);

    var doc = options.value;
    if (typeof doc == "string") doc = new Doc(doc, options.mode, null, options.lineSeparator);
    this.doc = doc;

    var input = new CodeMirror.inputStyles[options.inputStyle](this);
    var display = this.display = new Display(place, doc, input);
    display.wrapper.CodeMirror = this;
    updateGutters(this);
    themeChanged(this);
    if (options.lineWrapping)
      this.display.wrapper.className += " CodeMirror-wrap";
    if (options.autofocus && !mobile) display.input.focus();
    initScrollbars(this);

    this.state = {
      keyMaps: [],  // stores maps added by addKeyMap
      overlays: [], // highlighting overlays, as added by addOverlay
      modeGen: 0,   // bumped when mode/overlay changes, used to invalidate highlighting info
      overwrite: false,
      delayingBlurEvent: false,
      focused: false,
      suppressEdits: false, // used to disable editing during key handlers when in readOnly mode
      pasteIncoming: false, cutIncoming: false, // help recognize paste/cut edits in input.poll
      selectingText: false,
      draggingText: false,
      highlight: new Delayed(), // stores highlight worker timeout
      keySeq: null,  // Unfinished key sequence
      specialChars: null
    };

    var cm = this;

    // Override magic textarea content restore that IE sometimes does
    // on our hidden textarea on reload
    if (ie && ie_version < 11) setTimeout(function() { cm.display.input.reset(true); }, 20);

    registerEventHandlers(this);
    ensureGlobalHandlers();

    startOperation(this);
    this.curOp.forceUpdate = true;
    attachDoc(this, doc);

    if ((options.autofocus && !mobile) || cm.hasFocus())
      setTimeout(bind(onFocus, this), 20);
    else
      onBlur(this);

    for (var opt in optionHandlers) if (optionHandlers.hasOwnProperty(opt))
      optionHandlers[opt](this, options[opt], Init);
    maybeUpdateLineNumberWidth(this);
    if (options.finishInit) options.finishInit(this);
    for (var i = 0; i < initHooks.length; ++i) initHooks[i](this);
    endOperation(this);
    // Suppress optimizelegibility in Webkit, since it breaks text
    // measuring on line wrapping boundaries.
    if (webkit && options.lineWrapping &&
        getComputedStyle(display.lineDiv).textRendering == "optimizelegibility")
      display.lineDiv.style.textRendering = "auto";
  }

  // DISPLAY CONSTRUCTOR

  // The display handles the DOM integration, both for input reading
  // and content drawing. It holds references to DOM nodes and
  // display-related state.

  function Display(place, doc, input) {
    var d = this;
    this.input = input;

    // Covers bottom-right square when both scrollbars are present.
    d.scrollbarFiller = elt("div", null, "CodeMirror-scrollbar-filler");
    d.scrollbarFiller.setAttribute("cm-not-content", "true");
    // Covers bottom of gutter when coverGutterNextToScrollbar is on
    // and h scrollbar is present.
    d.gutterFiller = elt("div", null, "CodeMirror-gutter-filler");
    d.gutterFiller.setAttribute("cm-not-content", "true");
    // Will contain the actual code, positioned to cover the viewport.
    d.lineDiv = elt("div", null, "CodeMirror-code");
    // Elements are added to these to represent selection and cursors.
    d.selectionDiv = elt("div", null, null, "position: relative; z-index: 1");
    d.cursorDiv = elt("div", null, "CodeMirror-cursors");
    // A visibility: hidden element used to find the size of things.
    d.measure = elt("div", null, "CodeMirror-measure");
    // When lines outside of the viewport are measured, they are drawn in this.
    d.lineMeasure = elt("div", null, "CodeMirror-measure");
    // Wraps everything that needs to exist inside the vertically-padded coordinate system
    d.lineSpace = elt("div", [d.measure, d.lineMeasure, d.selectionDiv, d.cursorDiv, d.lineDiv],
                      null, "position: relative; outline: none");
    // Moved around its parent to cover visible view.
    d.mover = elt("div", [elt("div", [d.lineSpace], "CodeMirror-lines")], null, "position: relative");
    // Set to the height of the document, allowing scrolling.
    d.sizer = elt("div", [d.mover], "CodeMirror-sizer");
    d.sizerWidth = null;
    // Behavior of elts with overflow: auto and padding is
    // inconsistent across browsers. This is used to ensure the
    // scrollable area is big enough.
    d.heightForcer = elt("div", null, null, "position: absolute; height: " + scrollerGap + "px; width: 1px;");
    // Will contain the gutters, if any.
    d.gutters = elt("div", null, "CodeMirror-gutters");
    d.lineGutter = null;
    // Actual scrollable element.
    d.scroller = elt("div", [d.sizer, d.heightForcer, d.gutters], "CodeMirror-scroll");
    d.scroller.setAttribute("tabIndex", "-1");
    // The element in which the editor lives.
    d.wrapper = elt("div", [d.scrollbarFiller, d.gutterFiller, d.scroller], "CodeMirror");

    // Work around IE7 z-index bug (not perfect, hence IE7 not really being supported)
    if (ie && ie_version < 8) { d.gutters.style.zIndex = -1; d.scroller.style.paddingRight = 0; }
    if (!webkit && !(gecko && mobile)) d.scroller.draggable = true;

    if (place) {
      if (place.appendChild) place.appendChild(d.wrapper);
      else place(d.wrapper);
    }

    // Current rendered range (may be bigger than the view window).
    d.viewFrom = d.viewTo = doc.first;
    d.reportedViewFrom = d.reportedViewTo = doc.first;
    // Information about the rendered lines.
    d.view = [];
    d.renderedView = null;
    // Holds info about a single rendered line when it was rendered
    // for measurement, while not in view.
    d.externalMeasured = null;
    // Empty space (in pixels) above the view
    d.viewOffset = 0;
    d.lastWrapHeight = d.lastWrapWidth = 0;
    d.updateLineNumbers = null;

    d.nativeBarWidth = d.barHeight = d.barWidth = 0;
    d.scrollbarsClipped = false;

    // Used to only resize the line number gutter when necessary (when
    // the amount of lines crosses a boundary that makes its width change)
    d.lineNumWidth = d.lineNumInnerWidth = d.lineNumChars = null;
    // Set to true when a non-horizontal-scrolling line widget is
    // added. As an optimization, line widget aligning is skipped when
    // this is false.
    d.alignWidgets = false;

    d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;

    // Tracks the maximum line length so that the horizontal scrollbar
    // can be kept static when scrolling.
    d.maxLine = null;
    d.maxLineLength = 0;
    d.maxLineChanged = false;

    // Used for measuring wheel scrolling granularity
    d.wheelDX = d.wheelDY = d.wheelStartX = d.wheelStartY = null;

    // True when shift is held down.
    d.shift = false;

    // Used to track whether anything happened since the context menu
    // was opened.
    d.selForContextMenu = null;

    d.activeTouch = null;

    input.init(d);
  }

  // STATE UPDATES

  // Used to get the editor into a consistent state again when options change.

  function loadMode(cm) {
    cm.doc.mode = CodeMirror.getMode(cm.options, cm.doc.modeOption);
    resetModeState(cm);
  }

  function resetModeState(cm) {
    cm.doc.iter(function(line) {
      if (line.stateAfter) line.stateAfter = null;
      if (line.styles) line.styles = null;
    });
    cm.doc.frontier = cm.doc.first;
    startWorker(cm, 100);
    cm.state.modeGen++;
    if (cm.curOp) regChange(cm);
  }

  function wrappingChanged(cm) {
    if (cm.options.lineWrapping) {
      addClass(cm.display.wrapper, "CodeMirror-wrap");
      cm.display.sizer.style.minWidth = "";
      cm.display.sizerWidth = null;
    } else {
      rmClass(cm.display.wrapper, "CodeMirror-wrap");
      findMaxLine(cm);
    }
    estimateLineHeights(cm);
    regChange(cm);
    clearCaches(cm);
    setTimeout(function(){updateScrollbars(cm);}, 100);
  }

  // Returns a function that estimates the height of a line, to use as
  // first approximation until the line becomes visible (and is thus
  // properly measurable).
  function estimateHeight(cm) {
    var th = textHeight(cm.display), wrapping = cm.options.lineWrapping;
    var perLine = wrapping && Math.max(5, cm.display.scroller.clientWidth / charWidth(cm.display) - 3);
    return function(line) {
      if (lineIsHidden(cm.doc, line)) return 0;

      var widgetsHeight = 0;
      if (line.widgets) for (var i = 0; i < line.widgets.length; i++) {
        if (line.widgets[i].height) widgetsHeight += line.widgets[i].height;
      }

      if (wrapping)
        return widgetsHeight + (Math.ceil(line.text.length / perLine) || 1) * th;
      else
        return widgetsHeight + th;
    };
  }

  function estimateLineHeights(cm) {
    var doc = cm.doc, est = estimateHeight(cm);
    doc.iter(function(line) {
      var estHeight = est(line);
      if (estHeight != line.height) updateLineHeight(line, estHeight);
    });
  }

  function themeChanged(cm) {
    cm.display.wrapper.className = cm.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") +
      cm.options.theme.replace(/(^|\s)\s*/g, " cm-s-");
    clearCaches(cm);
  }

  function guttersChanged(cm) {
    updateGutters(cm);
    regChange(cm);
    setTimeout(function(){alignHorizontally(cm);}, 20);
  }

  // Rebuild the gutter elements, ensure the margin to the left of the
  // code matches their width.
  function updateGutters(cm) {
    var gutters = cm.display.gutters, specs = cm.options.gutters;
    removeChildren(gutters);
    for (var i = 0; i < specs.length; ++i) {
      var gutterClass = specs[i];
      var gElt = gutters.appendChild(elt("div", null, "CodeMirror-gutter " + gutterClass));
      if (gutterClass == "CodeMirror-linenumbers") {
        cm.display.lineGutter = gElt;
        gElt.style.width = (cm.display.lineNumWidth || 1) + "px";
      }
    }
    gutters.style.display = i ? "" : "none";
    updateGutterSpace(cm);
  }

  function updateGutterSpace(cm) {
    var width = cm.display.gutters.offsetWidth;
    cm.display.sizer.style.marginLeft = width + "px";
  }

  // Compute the character length of a line, taking into account
  // collapsed ranges (see markText) that might hide parts, and join
  // other lines onto it.
  function lineLength(line) {
    if (line.height == 0) return 0;
    var len = line.text.length, merged, cur = line;
    while (merged = collapsedSpanAtStart(cur)) {
      var found = merged.find(0, true);
      cur = found.from.line;
      len += found.from.ch - found.to.ch;
    }
    cur = line;
    while (merged = collapsedSpanAtEnd(cur)) {
      var found = merged.find(0, true);
      len -= cur.text.length - found.from.ch;
      cur = found.to.line;
      len += cur.text.length - found.to.ch;
    }
    return len;
  }

  // Find the longest line in the document.
  function findMaxLine(cm) {
    var d = cm.display, doc = cm.doc;
    d.maxLine = getLine(doc, doc.first);
    d.maxLineLength = lineLength(d.maxLine);
    d.maxLineChanged = true;
    doc.iter(function(line) {
      var len = lineLength(line);
      if (len > d.maxLineLength) {
        d.maxLineLength = len;
        d.maxLine = line;
      }
    });
  }

  // Make sure the gutters options contains the element
  // "CodeMirror-linenumbers" when the lineNumbers option is true.
  function setGuttersForLineNumbers(options) {
    var found = indexOf(options.gutters, "CodeMirror-linenumbers");
    if (found == -1 && options.lineNumbers) {
      options.gutters = options.gutters.concat(["CodeMirror-linenumbers"]);
    } else if (found > -1 && !options.lineNumbers) {
      options.gutters = options.gutters.slice(0);
      options.gutters.splice(found, 1);
    }
  }

  // SCROLLBARS

  // Prepare DOM reads needed to update the scrollbars. Done in one
  // shot to minimize update/measure roundtrips.
  function measureForScrollbars(cm) {
    var d = cm.display, gutterW = d.gutters.offsetWidth;
    var docH = Math.round(cm.doc.height + paddingVert(cm.display));
    return {
      clientHeight: d.scroller.clientHeight,
      viewHeight: d.wrapper.clientHeight,
      scrollWidth: d.scroller.scrollWidth, clientWidth: d.scroller.clientWidth,
      viewWidth: d.wrapper.clientWidth,
      barLeft: cm.options.fixedGutter ? gutterW : 0,
      docHeight: docH,
      scrollHeight: docH + scrollGap(cm) + d.barHeight,
      nativeBarWidth: d.nativeBarWidth,
      gutterWidth: gutterW
    };
  }

  function NativeScrollbars(place, scroll, cm) {
    this.cm = cm;
    var vert = this.vert = elt("div", [elt("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar");
    var horiz = this.horiz = elt("div", [elt("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
    place(vert); place(horiz);

    on(vert, "scroll", function() {
      if (vert.clientHeight) scroll(vert.scrollTop, "vertical");
    });
    on(horiz, "scroll", function() {
      if (horiz.clientWidth) scroll(horiz.scrollLeft, "horizontal");
    });

    this.checkedZeroWidth = false;
    // Need to set a minimum width to see the scrollbar on IE7 (but must not set it on IE8).
    if (ie && ie_version < 8) this.horiz.style.minHeight = this.vert.style.minWidth = "18px";
  }

  NativeScrollbars.prototype = copyObj({
    update: function(measure) {
      var needsH = measure.scrollWidth > measure.clientWidth + 1;
      var needsV = measure.scrollHeight > measure.clientHeight + 1;
      var sWidth = measure.nativeBarWidth;

      if (needsV) {
        this.vert.style.display = "block";
        this.vert.style.bottom = needsH ? sWidth + "px" : "0";
        var totalHeight = measure.viewHeight - (needsH ? sWidth : 0);
        // A bug in IE8 can cause this value to be negative, so guard it.
        this.vert.firstChild.style.height =
          Math.max(0, measure.scrollHeight - measure.clientHeight + totalHeight) + "px";
      } else {
        this.vert.style.display = "";
        this.vert.firstChild.style.height = "0";
      }

      if (needsH) {
        this.horiz.style.display = "block";
        this.horiz.style.right = needsV ? sWidth + "px" : "0";
        this.horiz.style.left = measure.barLeft + "px";
        var totalWidth = measure.viewWidth - measure.barLeft - (needsV ? sWidth : 0);
        this.horiz.firstChild.style.width =
          (measure.scrollWidth - measure.clientWidth + totalWidth) + "px";
      } else {
        this.horiz.style.display = "";
        this.horiz.firstChild.style.width = "0";
      }

      if (!this.checkedZeroWidth && measure.clientHeight > 0) {
        if (sWidth == 0) this.zeroWidthHack();
        this.checkedZeroWidth = true;
      }

      return {right: needsV ? sWidth : 0, bottom: needsH ? sWidth : 0};
    },
    setScrollLeft: function(pos) {
      if (this.horiz.scrollLeft != pos) this.horiz.scrollLeft = pos;
      if (this.disableHoriz) this.enableZeroWidthBar(this.horiz, this.disableHoriz);
    },
    setScrollTop: function(pos) {
      if (this.vert.scrollTop != pos) this.vert.scrollTop = pos;
      if (this.disableVert) this.enableZeroWidthBar(this.vert, this.disableVert);
    },
    zeroWidthHack: function() {
      var w = mac && !mac_geMountainLion ? "12px" : "18px";
      this.horiz.style.height = this.vert.style.width = w;
      this.horiz.style.pointerEvents = this.vert.style.pointerEvents = "none";
      this.disableHoriz = new Delayed;
      this.disableVert = new Delayed;
    },
    enableZeroWidthBar: function(bar, delay) {
      bar.style.pointerEvents = "auto";
      function maybeDisable() {
        // To find out whether the scrollbar is still visible, we
        // check whether the element under the pixel in the bottom
        // left corner of the scrollbar box is the scrollbar box
        // itself (when the bar is still visible) or its filler child
        // (when the bar is hidden). If it is still visible, we keep
        // it enabled, if it's hidden, we disable pointer events.
        var box = bar.getBoundingClientRect();
        var elt = document.elementFromPoint(box.left + 1, box.bottom - 1);
        if (elt != bar) bar.style.pointerEvents = "none";
        else delay.set(1000, maybeDisable);
      }
      delay.set(1000, maybeDisable);
    },
    clear: function() {
      var parent = this.horiz.parentNode;
      parent.removeChild(this.horiz);
      parent.removeChild(this.vert);
    }
  }, NativeScrollbars.prototype);

  function NullScrollbars() {}

  NullScrollbars.prototype = copyObj({
    update: function() { return {bottom: 0, right: 0}; },
    setScrollLeft: function() {},
    setScrollTop: function() {},
    clear: function() {}
  }, NullScrollbars.prototype);

  CodeMirror.scrollbarModel = {"native": NativeScrollbars, "null": NullScrollbars};

  function initScrollbars(cm) {
    if (cm.display.scrollbars) {
      cm.display.scrollbars.clear();
      if (cm.display.scrollbars.addClass)
        rmClass(cm.display.wrapper, cm.display.scrollbars.addClass);
    }

    cm.display.scrollbars = new CodeMirror.scrollbarModel[cm.options.scrollbarStyle](function(node) {
      cm.display.wrapper.insertBefore(node, cm.display.scrollbarFiller);
      // Prevent clicks in the scrollbars from killing focus
      on(node, "mousedown", function() {
        if (cm.state.focused) setTimeout(function() { cm.display.input.focus(); }, 0);
      });
      node.setAttribute("cm-not-content", "true");
    }, function(pos, axis) {
      if (axis == "horizontal") setScrollLeft(cm, pos);
      else setScrollTop(cm, pos);
    }, cm);
    if (cm.display.scrollbars.addClass)
      addClass(cm.display.wrapper, cm.display.scrollbars.addClass);
  }

  function updateScrollbars(cm, measure) {
    if (!measure) measure = measureForScrollbars(cm);
    var startWidth = cm.display.barWidth, startHeight = cm.display.barHeight;
    updateScrollbarsInner(cm, measure);
    for (var i = 0; i < 4 && startWidth != cm.display.barWidth || startHeight != cm.display.barHeight; i++) {
      if (startWidth != cm.display.barWidth && cm.options.lineWrapping)
        updateHeightsInViewport(cm);
      updateScrollbarsInner(cm, measureForScrollbars(cm));
      startWidth = cm.display.barWidth; startHeight = cm.display.barHeight;
    }
  }

  // Re-synchronize the fake scrollbars with the actual size of the
  // content.
  function updateScrollbarsInner(cm, measure) {
    var d = cm.display;
    var sizes = d.scrollbars.update(measure);

    d.sizer.style.paddingRight = (d.barWidth = sizes.right) + "px";
    d.sizer.style.paddingBottom = (d.barHeight = sizes.bottom) + "px";

    if (sizes.right && sizes.bottom) {
      d.scrollbarFiller.style.display = "block";
      d.scrollbarFiller.style.height = sizes.bottom + "px";
      d.scrollbarFiller.style.width = sizes.right + "px";
    } else d.scrollbarFiller.style.display = "";
    if (sizes.bottom && cm.options.coverGutterNextToScrollbar && cm.options.fixedGutter) {
      d.gutterFiller.style.display = "block";
      d.gutterFiller.style.height = sizes.bottom + "px";
      d.gutterFiller.style.width = measure.gutterWidth + "px";
    } else d.gutterFiller.style.display = "";
  }

  // Compute the lines that are visible in a given viewport (defaults
  // the the current scroll position). viewport may contain top,
  // height, and ensure (see op.scrollToPos) properties.
  function visibleLines(display, doc, viewport) {
    var top = viewport && viewport.top != null ? Math.max(0, viewport.top) : display.scroller.scrollTop;
    top = Math.floor(top - paddingTop(display));
    var bottom = viewport && viewport.bottom != null ? viewport.bottom : top + display.wrapper.clientHeight;

    var from = lineAtHeight(doc, top), to = lineAtHeight(doc, bottom);
    // Ensure is a {from: {line, ch}, to: {line, ch}} object, and
    // forces those lines into the viewport (if possible).
    if (viewport && viewport.ensure) {
      var ensureFrom = viewport.ensure.from.line, ensureTo = viewport.ensure.to.line;
      if (ensureFrom < from) {
        from = ensureFrom;
        to = lineAtHeight(doc, heightAtLine(getLine(doc, ensureFrom)) + display.wrapper.clientHeight);
      } else if (Math.min(ensureTo, doc.lastLine()) >= to) {
        from = lineAtHeight(doc, heightAtLine(getLine(doc, ensureTo)) - display.wrapper.clientHeight);
        to = ensureTo;
      }
    }
    return {from: from, to: Math.max(to, from + 1)};
  }

  // LINE NUMBERS

  // Re-align line numbers and gutter marks to compensate for
  // horizontal scrolling.
  function alignHorizontally(cm) {
    var display = cm.display, view = display.view;
    if (!display.alignWidgets && (!display.gutters.firstChild || !cm.options.fixedGutter)) return;
    var comp = compensateForHScroll(display) - display.scroller.scrollLeft + cm.doc.scrollLeft;
    var gutterW = display.gutters.offsetWidth, left = comp + "px";
    for (var i = 0; i < view.length; i++) if (!view[i].hidden) {
      if (cm.options.fixedGutter && view[i].gutter)
        view[i].gutter.style.left = left;
      var align = view[i].alignable;
      if (align) for (var j = 0; j < align.length; j++)
        align[j].style.left = left;
    }
    if (cm.options.fixedGutter)
      display.gutters.style.left = (comp + gutterW) + "px";
  }

  // Used to ensure that the line number gutter is still the right
  // size for the current document size. Returns true when an update
  // is needed.
  function maybeUpdateLineNumberWidth(cm) {
    if (!cm.options.lineNumbers) return false;
    var doc = cm.doc, last = lineNumberFor(cm.options, doc.first + doc.size - 1), display = cm.display;
    if (last.length != display.lineNumChars) {
      var test = display.measure.appendChild(elt("div", [elt("div", last)],
                                                 "CodeMirror-linenumber CodeMirror-gutter-elt"));
      var innerW = test.firstChild.offsetWidth, padding = test.offsetWidth - innerW;
      display.lineGutter.style.width = "";
      display.lineNumInnerWidth = Math.max(innerW, display.lineGutter.offsetWidth - padding) + 1;
      display.lineNumWidth = display.lineNumInnerWidth + padding;
      display.lineNumChars = display.lineNumInnerWidth ? last.length : -1;
      display.lineGutter.style.width = display.lineNumWidth + "px";
      updateGutterSpace(cm);
      return true;
    }
    return false;
  }

  function lineNumberFor(options, i) {
    return String(options.lineNumberFormatter(i + options.firstLineNumber));
  }

  // Computes display.scroller.scrollLeft + display.gutters.offsetWidth,
  // but using getBoundingClientRect to get a sub-pixel-accurate
  // result.
  function compensateForHScroll(display) {
    return display.scroller.getBoundingClientRect().left - display.sizer.getBoundingClientRect().left;
  }

  // DISPLAY DRAWING

  function DisplayUpdate(cm, viewport, force) {
    var display = cm.display;

    this.viewport = viewport;
    // Store some values that we'll need later (but don't want to force a relayout for)
    this.visible = visibleLines(display, cm.doc, viewport);
    this.editorIsHidden = !display.wrapper.offsetWidth;
    this.wrapperHeight = display.wrapper.clientHeight;
    this.wrapperWidth = display.wrapper.clientWidth;
    this.oldDisplayWidth = displayWidth(cm);
    this.force = force;
    this.dims = getDimensions(cm);
    this.events = [];
  }

  DisplayUpdate.prototype.signal = function(emitter, type) {
    if (hasHandler(emitter, type))
      this.events.push(arguments);
  };
  DisplayUpdate.prototype.finish = function() {
    for (var i = 0; i < this.events.length; i++)
      signal.apply(null, this.events[i]);
  };

  function maybeClipScrollbars(cm) {
    var display = cm.display;
    if (!display.scrollbarsClipped && display.scroller.offsetWidth) {
      display.nativeBarWidth = display.scroller.offsetWidth - display.scroller.clientWidth;
      display.heightForcer.style.height = scrollGap(cm) + "px";
      display.sizer.style.marginBottom = -display.nativeBarWidth + "px";
      display.sizer.style.borderRightWidth = scrollGap(cm) + "px";
      display.scrollbarsClipped = true;
    }
  }

  // Does the actual updating of the line display. Bails out
  // (returning false) when there is nothing to be done and forced is
  // false.
  function updateDisplayIfNeeded(cm, update) {
    var display = cm.display, doc = cm.doc;

    if (update.editorIsHidden) {
      resetView(cm);
      return false;
    }

    // Bail out if the visible area is already rendered and nothing changed.
    if (!update.force &&
        update.visible.from >= display.viewFrom && update.visible.to <= display.viewTo &&
        (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo) &&
        display.renderedView == display.view && countDirtyView(cm) == 0)
      return false;

    if (maybeUpdateLineNumberWidth(cm)) {
      resetView(cm);
      update.dims = getDimensions(cm);
    }

    // Compute a suitable new viewport (from & to)
    var end = doc.first + doc.size;
    var from = Math.max(update.visible.from - cm.options.viewportMargin, doc.first);
    var to = Math.min(end, update.visible.to + cm.options.viewportMargin);
    if (display.viewFrom < from && from - display.viewFrom < 20) from = Math.max(doc.first, display.viewFrom);
    if (display.viewTo > to && display.viewTo - to < 20) to = Math.min(end, display.viewTo);
    if (sawCollapsedSpans) {
      from = visualLineNo(cm.doc, from);
      to = visualLineEndNo(cm.doc, to);
    }

    var different = from != display.viewFrom || to != display.viewTo ||
      display.lastWrapHeight != update.wrapperHeight || display.lastWrapWidth != update.wrapperWidth;
    adjustView(cm, from, to);

    display.viewOffset = heightAtLine(getLine(cm.doc, display.viewFrom));
    // Position the mover div to align with the current scroll position
    cm.display.mover.style.top = display.viewOffset + "px";

    var toUpdate = countDirtyView(cm);
    if (!different && toUpdate == 0 && !update.force && display.renderedView == display.view &&
        (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo))
      return false;

    // For big changes, we hide the enclosing element during the
    // update, since that speeds up the operations on most browsers.
    var focused = activeElt();
    if (toUpdate > 4) display.lineDiv.style.display = "none";
    patchDisplay(cm, display.updateLineNumbers, update.dims);
    if (toUpdate > 4) display.lineDiv.style.display = "";
    display.renderedView = display.view;
    // There might have been a widget with a focused element that got
    // hidden or updated, if so re-focus it.
    if (focused && activeElt() != focused && focused.offsetHeight) focused.focus();

    // Prevent selection and cursors from interfering with the scroll
    // width and height.
    removeChildren(display.cursorDiv);
    removeChildren(display.selectionDiv);
    display.gutters.style.height = display.sizer.style.minHeight = 0;

    if (different) {
      display.lastWrapHeight = update.wrapperHeight;
      display.lastWrapWidth = update.wrapperWidth;
      startWorker(cm, 400);
    }

    display.updateLineNumbers = null;

    return true;
  }

  function postUpdateDisplay(cm, update) {
    var viewport = update.viewport;
    for (var first = true;; first = false) {
      if (!first || !cm.options.lineWrapping || update.oldDisplayWidth == displayWidth(cm)) {
        // Clip forced viewport to actual scrollable area.
        if (viewport && viewport.top != null)
          viewport = {top: Math.min(cm.doc.height + paddingVert(cm.display) - displayHeight(cm), viewport.top)};
        // Updated line heights might result in the drawn area not
        // actually covering the viewport. Keep looping until it does.
        update.visible = visibleLines(cm.display, cm.doc, viewport);
        if (update.visible.from >= cm.display.viewFrom && update.visible.to <= cm.display.viewTo)
          break;
      }
      if (!updateDisplayIfNeeded(cm, update)) break;
      updateHeightsInViewport(cm);
      var barMeasure = measureForScrollbars(cm);
      updateSelection(cm);
      setDocumentHeight(cm, barMeasure);
      updateScrollbars(cm, barMeasure);
    }

    update.signal(cm, "update", cm);
    if (cm.display.viewFrom != cm.display.reportedViewFrom || cm.display.viewTo != cm.display.reportedViewTo) {
      update.signal(cm, "viewportChange", cm, cm.display.viewFrom, cm.display.viewTo);
      cm.display.reportedViewFrom = cm.display.viewFrom; cm.display.reportedViewTo = cm.display.viewTo;
    }
  }

  function updateDisplaySimple(cm, viewport) {
    var update = new DisplayUpdate(cm, viewport);
    if (updateDisplayIfNeeded(cm, update)) {
      updateHeightsInViewport(cm);
      postUpdateDisplay(cm, update);
      var barMeasure = measureForScrollbars(cm);
      updateSelection(cm);
      setDocumentHeight(cm, barMeasure);
      updateScrollbars(cm, barMeasure);
      update.finish();
    }
  }

  function setDocumentHeight(cm, measure) {
    cm.display.sizer.style.minHeight = measure.docHeight + "px";
    var total = measure.docHeight + cm.display.barHeight;
    cm.display.heightForcer.style.top = total + "px";
    cm.display.gutters.style.height = Math.max(total + scrollGap(cm), measure.clientHeight) + "px";
  }

  // Read the actual heights of the rendered lines, and update their
  // stored heights to match.
  function updateHeightsInViewport(cm) {
    var display = cm.display;
    var prevBottom = display.lineDiv.offsetTop;
    for (var i = 0; i < display.view.length; i++) {
      var cur = display.view[i], height;
      if (cur.hidden) continue;
      if (ie && ie_version < 8) {
        var bot = cur.node.offsetTop + cur.node.offsetHeight;
        height = bot - prevBottom;
        prevBottom = bot;
      } else {
        var box = cur.node.getBoundingClientRect();
        height = box.bottom - box.top;
      }
      var diff = cur.line.height - height;
      if (height < 2) height = textHeight(display);
      if (diff > .001 || diff < -.001) {
        updateLineHeight(cur.line, height);
        updateWidgetHeight(cur.line);
        if (cur.rest) for (var j = 0; j < cur.rest.length; j++)
          updateWidgetHeight(cur.rest[j]);
      }
    }
  }

  // Read and store the height of line widgets associated with the
  // given line.
  function updateWidgetHeight(line) {
    if (line.widgets) for (var i = 0; i < line.widgets.length; ++i)
      line.widgets[i].height = line.widgets[i].node.parentNode.offsetHeight;
  }

  // Do a bulk-read of the DOM positions and sizes needed to draw the
  // view, so that we don't interleave reading and writing to the DOM.
  function getDimensions(cm) {
    var d = cm.display, left = {}, width = {};
    var gutterLeft = d.gutters.clientLeft;
    for (var n = d.gutters.firstChild, i = 0; n; n = n.nextSibling, ++i) {
      left[cm.options.gutters[i]] = n.offsetLeft + n.clientLeft + gutterLeft;
      width[cm.options.gutters[i]] = n.clientWidth;
    }
    return {fixedPos: compensateForHScroll(d),
            gutterTotalWidth: d.gutters.offsetWidth,
            gutterLeft: left,
            gutterWidth: width,
            wrapperWidth: d.wrapper.clientWidth};
  }

  // Sync the actual display DOM structure with display.view, removing
  // nodes for lines that are no longer in view, and creating the ones
  // that are not there yet, and updating the ones that are out of
  // date.
  function patchDisplay(cm, updateNumbersFrom, dims) {
    var display = cm.display, lineNumbers = cm.options.lineNumbers;
    var container = display.lineDiv, cur = container.firstChild;

    function rm(node) {
      var next = node.nextSibling;
      // Works around a throw-scroll bug in OS X Webkit
      if (webkit && mac && cm.display.currentWheelTarget == node)
        node.style.display = "none";
      else
        node.parentNode.removeChild(node);
      return next;
    }

    var view = display.view, lineN = display.viewFrom;
    // Loop over the elements in the view, syncing cur (the DOM nodes
    // in display.lineDiv) with the view as we go.
    for (var i = 0; i < view.length; i++) {
      var lineView = view[i];
      if (lineView.hidden) {
      } else if (!lineView.node || lineView.node.parentNode != container) { // Not drawn yet
        var node = buildLineElement(cm, lineView, lineN, dims);
        container.insertBefore(node, cur);
      } else { // Already drawn
        while (cur != lineView.node) cur = rm(cur);
        var updateNumber = lineNumbers && updateNumbersFrom != null &&
          updateNumbersFrom <= lineN && lineView.lineNumber;
        if (lineView.changes) {
          if (indexOf(lineView.changes, "gutter") > -1) updateNumber = false;
          updateLineForChanges(cm, lineView, lineN, dims);
        }
        if (updateNumber) {
          removeChildren(lineView.lineNumber);
          lineView.lineNumber.appendChild(document.createTextNode(lineNumberFor(cm.options, lineN)));
        }
        cur = lineView.node.nextSibling;
      }
      lineN += lineView.size;
    }
    while (cur) cur = rm(cur);
  }

  // When an aspect of a line changes, a string is added to
  // lineView.changes. This updates the relevant part of the line's
  // DOM structure.
  function updateLineForChanges(cm, lineView, lineN, dims) {
    for (var j = 0; j < lineView.changes.length; j++) {
      var type = lineView.changes[j];
      if (type == "text") updateLineText(cm, lineView);
      else if (type == "gutter") updateLineGutter(cm, lineView, lineN, dims);
      else if (type == "class") updateLineClasses(lineView);
      else if (type == "widget") updateLineWidgets(cm, lineView, dims);
    }
    lineView.changes = null;
  }

  // Lines with gutter elements, widgets or a background class need to
  // be wrapped, and have the extra elements added to the wrapper div
  function ensureLineWrapped(lineView) {
    if (lineView.node == lineView.text) {
      lineView.node = elt("div", null, null, "position: relative");
      if (lineView.text.parentNode)
        lineView.text.parentNode.replaceChild(lineView.node, lineView.text);
      lineView.node.appendChild(lineView.text);
      if (ie && ie_version < 8) lineView.node.style.zIndex = 2;
    }
    return lineView.node;
  }

  function updateLineBackground(lineView) {
    var cls = lineView.bgClass ? lineView.bgClass + " " + (lineView.line.bgClass || "") : lineView.line.bgClass;
    if (cls) cls += " CodeMirror-linebackground";
    if (lineView.background) {
      if (cls) lineView.background.className = cls;
      else { lineView.background.parentNode.removeChild(lineView.background); lineView.background = null; }
    } else if (cls) {
      var wrap = ensureLineWrapped(lineView);
      lineView.background = wrap.insertBefore(elt("div", null, cls), wrap.firstChild);
    }
  }

  // Wrapper around buildLineContent which will reuse the structure
  // in display.externalMeasured when possible.
  function getLineContent(cm, lineView) {
    var ext = cm.display.externalMeasured;
    if (ext && ext.line == lineView.line) {
      cm.display.externalMeasured = null;
      lineView.measure = ext.measure;
      return ext.built;
    }
    return buildLineContent(cm, lineView);
  }

  // Redraw the line's text. Interacts with the background and text
  // classes because the mode may output tokens that influence these
  // classes.
  function updateLineText(cm, lineView) {
    var cls = lineView.text.className;
    var built = getLineContent(cm, lineView);
    if (lineView.text == lineView.node) lineView.node = built.pre;
    lineView.text.parentNode.replaceChild(built.pre, lineView.text);
    lineView.text = built.pre;
    if (built.bgClass != lineView.bgClass || built.textClass != lineView.textClass) {
      lineView.bgClass = built.bgClass;
      lineView.textClass = built.textClass;
      updateLineClasses(lineView);
    } else if (cls) {
      lineView.text.className = cls;
    }
  }

  function updateLineClasses(lineView) {
    updateLineBackground(lineView);
    if (lineView.line.wrapClass)
      ensureLineWrapped(lineView).className = lineView.line.wrapClass;
    else if (lineView.node != lineView.text)
      lineView.node.className = "";
    var textClass = lineView.textClass ? lineView.textClass + " " + (lineView.line.textClass || "") : lineView.line.textClass;
    lineView.text.className = textClass || "";
  }

  function updateLineGutter(cm, lineView, lineN, dims) {
    if (lineView.gutter) {
      lineView.node.removeChild(lineView.gutter);
      lineView.gutter = null;
    }
    if (lineView.gutterBackground) {
      lineView.node.removeChild(lineView.gutterBackground);
      lineView.gutterBackground = null;
    }
    if (lineView.line.gutterClass) {
      var wrap = ensureLineWrapped(lineView);
      lineView.gutterBackground = elt("div", null, "CodeMirror-gutter-background " + lineView.line.gutterClass,
                                      "left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) +
                                      "px; width: " + dims.gutterTotalWidth + "px");
      wrap.insertBefore(lineView.gutterBackground, lineView.text);
    }
    var markers = lineView.line.gutterMarkers;
    if (cm.options.lineNumbers || markers) {
      var wrap = ensureLineWrapped(lineView);
      var gutterWrap = lineView.gutter = elt("div", null, "CodeMirror-gutter-wrapper", "left: " +
                                             (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px");
      cm.display.input.setUneditable(gutterWrap);
      wrap.insertBefore(gutterWrap, lineView.text);
      if (lineView.line.gutterClass)
        gutterWrap.className += " " + lineView.line.gutterClass;
      if (cm.options.lineNumbers && (!markers || !markers["CodeMirror-linenumbers"]))
        lineView.lineNumber = gutterWrap.appendChild(
          elt("div", lineNumberFor(cm.options, lineN),
              "CodeMirror-linenumber CodeMirror-gutter-elt",
              "left: " + dims.gutterLeft["CodeMirror-linenumbers"] + "px; width: "
              + cm.display.lineNumInnerWidth + "px"));
      if (markers) for (var k = 0; k < cm.options.gutters.length; ++k) {
        var id = cm.options.gutters[k], found = markers.hasOwnProperty(id) && markers[id];
        if (found)
          gutterWrap.appendChild(elt("div", [found], "CodeMirror-gutter-elt", "left: " +
                                     dims.gutterLeft[id] + "px; width: " + dims.gutterWidth[id] + "px"));
      }
    }
  }

  function updateLineWidgets(cm, lineView, dims) {
    if (lineView.alignable) lineView.alignable = null;
    for (var node = lineView.node.firstChild, next; node; node = next) {
      var next = node.nextSibling;
      if (node.className == "CodeMirror-linewidget")
        lineView.node.removeChild(node);
    }
    insertLineWidgets(cm, lineView, dims);
  }

  // Build a line's DOM representation from scratch
  function buildLineElement(cm, lineView, lineN, dims) {
    var built = getLineContent(cm, lineView);
    lineView.text = lineView.node = built.pre;
    if (built.bgClass) lineView.bgClass = built.bgClass;
    if (built.textClass) lineView.textClass = built.textClass;

    updateLineClasses(lineView);
    updateLineGutter(cm, lineView, lineN, dims);
    insertLineWidgets(cm, lineView, dims);
    return lineView.node;
  }

  // A lineView may contain multiple logical lines (when merged by
  // collapsed spans). The widgets for all of them need to be drawn.
  function insertLineWidgets(cm, lineView, dims) {
    insertLineWidgetsFor(cm, lineView.line, lineView, dims, true);
    if (lineView.rest) for (var i = 0; i < lineView.rest.length; i++)
      insertLineWidgetsFor(cm, lineView.rest[i], lineView, dims, false);
  }

  function insertLineWidgetsFor(cm, line, lineView, dims, allowAbove) {
    if (!line.widgets) return;
    var wrap = ensureLineWrapped(lineView);
    for (var i = 0, ws = line.widgets; i < ws.length; ++i) {
      var widget = ws[i], node = elt("div", [widget.node], "CodeMirror-linewidget");
      if (!widget.handleMouseEvents) node.setAttribute("cm-ignore-events", "true");
      positionLineWidget(widget, node, lineView, dims);
      cm.display.input.setUneditable(node);
      if (allowAbove && widget.above)
        wrap.insertBefore(node, lineView.gutter || lineView.text);
      else
        wrap.appendChild(node);
      signalLater(widget, "redraw");
    }
  }

  function positionLineWidget(widget, node, lineView, dims) {
    if (widget.noHScroll) {
      (lineView.alignable || (lineView.alignable = [])).push(node);
      var width = dims.wrapperWidth;
      node.style.left = dims.fixedPos + "px";
      if (!widget.coverGutter) {
        width -= dims.gutterTotalWidth;
        node.style.paddingLeft = dims.gutterTotalWidth + "px";
      }
      node.style.width = width + "px";
    }
    if (widget.coverGutter) {
      node.style.zIndex = 5;
      node.style.position = "relative";
      if (!widget.noHScroll) node.style.marginLeft = -dims.gutterTotalWidth + "px";
    }
  }

  // POSITION OBJECT

  // A Pos instance represents a position within the text.
  var Pos = CodeMirror.Pos = function(line, ch) {
    if (!(this instanceof Pos)) return new Pos(line, ch);
    this.line = line; this.ch = ch;
  };

  // Compare two positions, return 0 if they are the same, a negative
  // number when a is less, and a positive number otherwise.
  var cmp = CodeMirror.cmpPos = function(a, b) { return a.line - b.line || a.ch - b.ch; };

  function copyPos(x) {return Pos(x.line, x.ch);}
  function maxPos(a, b) { return cmp(a, b) < 0 ? b : a; }
  function minPos(a, b) { return cmp(a, b) < 0 ? a : b; }

  // INPUT HANDLING

  function ensureFocus(cm) {
    if (!cm.state.focused) { cm.display.input.focus(); onFocus(cm); }
  }

  // This will be set to an array of strings when copying, so that,
  // when pasting, we know what kind of selections the copied text
  // was made out of.
  var lastCopied = null;

  function applyTextInput(cm, inserted, deleted, sel, origin) {
    var doc = cm.doc;
    cm.display.shift = false;
    if (!sel) sel = doc.sel;

    var paste = cm.state.pasteIncoming || origin == "paste";
    var textLines = doc.splitLines(inserted), multiPaste = null;
    // When pasing N lines into N selections, insert one line per selection
    if (paste && sel.ranges.length > 1) {
      if (lastCopied && lastCopied.join("\n") == inserted) {
        if (sel.ranges.length % lastCopied.length == 0) {
          multiPaste = [];
          for (var i = 0; i < lastCopied.length; i++)
            multiPaste.push(doc.splitLines(lastCopied[i]));
        }
      } else if (textLines.length == sel.ranges.length) {
        multiPaste = map(textLines, function(l) { return [l]; });
      }
    }

    // Normal behavior is to insert the new text into every selection
    for (var i = sel.ranges.length - 1; i >= 0; i--) {
      var range = sel.ranges[i];
      var from = range.from(), to = range.to();
      if (range.empty()) {
        if (deleted && deleted > 0) // Handle deletion
          from = Pos(from.line, from.ch - deleted);
        else if (cm.state.overwrite && !paste) // Handle overwrite
          to = Pos(to.line, Math.min(getLine(doc, to.line).text.length, to.ch + lst(textLines).length));
      }
      var updateInput = cm.curOp.updateInput;
      var changeEvent = {from: from, to: to, text: multiPaste ? multiPaste[i % multiPaste.length] : textLines,
                         origin: origin || (paste ? "paste" : cm.state.cutIncoming ? "cut" : "+input")};
      makeChange(cm.doc, changeEvent);
      signalLater(cm, "inputRead", cm, changeEvent);
    }
    if (inserted && !paste)
      triggerElectric(cm, inserted);

    ensureCursorVisible(cm);
    cm.curOp.updateInput = updateInput;
    cm.curOp.typing = true;
    cm.state.pasteIncoming = cm.state.cutIncoming = false;
  }

  function handlePaste(e, cm) {
    var pasted = e.clipboardData && e.clipboardData.getData("text/plain");
    if (pasted) {
      e.preventDefault();
      if (!cm.isReadOnly() && !cm.options.disableInput)
        runInOp(cm, function() { applyTextInput(cm, pasted, 0, null, "paste"); });
      return true;
    }
  }

  function triggerElectric(cm, inserted) {
    // When an 'electric' character is inserted, immediately trigger a reindent
    if (!cm.options.electricChars || !cm.options.smartIndent) return;
    var sel = cm.doc.sel;

    for (var i = sel.ranges.length - 1; i >= 0; i--) {
      var range = sel.ranges[i];
      if (range.head.ch > 100 || (i && sel.ranges[i - 1].head.line == range.head.line)) continue;
      var mode = cm.getModeAt(range.head);
      var indented = false;
      if (mode.electricChars) {
        for (var j = 0; j < mode.electricChars.length; j++)
          if (inserted.indexOf(mode.electricChars.charAt(j)) > -1) {
            indented = indentLine(cm, range.head.line, "smart");
            break;
          }
      } else if (mode.electricInput) {
        if (mode.electricInput.test(getLine(cm.doc, range.head.line).text.slice(0, range.head.ch)))
          indented = indentLine(cm, range.head.line, "smart");
      }
      if (indented) signalLater(cm, "electricInput", cm, range.head.line);
    }
  }

  function copyableRanges(cm) {
    var text = [], ranges = [];
    for (var i = 0; i < cm.doc.sel.ranges.length; i++) {
      var line = cm.doc.sel.ranges[i].head.line;
      var lineRange = {anchor: Pos(line, 0), head: Pos(line + 1, 0)};
      ranges.push(lineRange);
      text.push(cm.getRange(lineRange.anchor, lineRange.head));
    }
    return {text: text, ranges: ranges};
  }

  function disableBrowserMagic(field) {
    field.setAttribute("autocorrect", "off");
    field.setAttribute("autocapitalize", "off");
    field.setAttribute("spellcheck", "false");
  }

  // TEXTAREA INPUT STYLE

  function TextareaInput(cm) {
    this.cm = cm;
    // See input.poll and input.reset
    this.prevInput = "";

    // Flag that indicates whether we expect input to appear real soon
    // now (after some event like 'keypress' or 'input') and are
    // polling intensively.
    this.pollingFast = false;
    // Self-resetting timeout for the poller
    this.polling = new Delayed();
    // Tracks when input.reset has punted to just putting a short
    // string into the textarea instead of the full selection.
    this.inaccurateSelection = false;
    // Used to work around IE issue with selection being forgotten when focus moves away from textarea
    this.hasSelection = false;
    this.composing = null;
  };

  function hiddenTextarea() {
    var te = elt("textarea", null, null, "position: absolute; padding: 0; width: 1px; height: 1em; outline: none");
    var div = elt("div", [te], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
    // The textarea is kept positioned near the cursor to prevent the
    // fact that it'll be scrolled into view on input from scrolling
    // our fake cursor out of view. On webkit, when wrap=off, paste is
    // very slow. So make the area wide instead.
    if (webkit) te.style.width = "1000px";
    else te.setAttribute("wrap", "off");
    // If border: 0; -- iOS fails to open keyboard (issue #1287)
    if (ios) te.style.border = "1px solid black";
    disableBrowserMagic(te);
    return div;
  }

  TextareaInput.prototype = copyObj({
    init: function(display) {
      var input = this, cm = this.cm;

      // Wraps and hides input textarea
      var div = this.wrapper = hiddenTextarea();
      // The semihidden textarea that is focused when the editor is
      // focused, and receives input.
      var te = this.textarea = div.firstChild;
      display.wrapper.insertBefore(div, display.wrapper.firstChild);

      // Needed to hide big blue blinking cursor on Mobile Safari (doesn't seem to work in iOS 8 anymore)
      if (ios) te.style.width = "0px";

      on(te, "input", function() {
        if (ie && ie_version >= 9 && input.hasSelection) input.hasSelection = null;
        input.poll();
      });

      on(te, "paste", function(e) {
        if (signalDOMEvent(cm, e) || handlePaste(e, cm)) return

        cm.state.pasteIncoming = true;
        input.fastPoll();
      });

      function prepareCopyCut(e) {
        if (cm.somethingSelected()) {
          lastCopied = cm.getSelections();
          if (input.inaccurateSelection) {
            input.prevInput = "";
            input.inaccurateSelection = false;
            te.value = lastCopied.join("\n");
            selectInput(te);
          }
        } else if (!cm.options.lineWiseCopyCut) {
          return;
        } else {
          var ranges = copyableRanges(cm);
          lastCopied = ranges.text;
          if (e.type == "cut") {
            cm.setSelections(ranges.ranges, null, sel_dontScroll);
          } else {
            input.prevInput = "";
            te.value = ranges.text.join("\n");
            selectInput(te);
          }
        }
        if (e.type == "cut") cm.state.cutIncoming = true;
      }
      on(te, "cut", prepareCopyCut);
      on(te, "copy", prepareCopyCut);

      on(display.scroller, "paste", function(e) {
        if (eventInWidget(display, e) || signalDOMEvent(cm, e)) return;
        cm.state.pasteIncoming = true;
        input.focus();
      });

      // Prevent normal selection in the editor (we handle our own)
      on(display.lineSpace, "selectstart", function(e) {
        if (!eventInWidget(display, e)) e_preventDefault(e);
      });

      on(te, "compositionstart", function() {
        var start = cm.getCursor("from");
        if (input.composing) input.composing.range.clear()
        input.composing = {
          start: start,
          range: cm.markText(start, cm.getCursor("to"), {className: "CodeMirror-composing"})
        };
      });
      on(te, "compositionend", function() {
        if (input.composing) {
          input.poll();
          input.composing.range.clear();
          input.composing = null;
        }
      });
    },

    prepareSelection: function() {
      // Redraw the selection and/or cursor
      var cm = this.cm, display = cm.display, doc = cm.doc;
      var result = prepareSelection(cm);

      // Move the hidden textarea near the cursor to prevent scrolling artifacts
      if (cm.options.moveInputWithCursor) {
        var headPos = cursorCoords(cm, doc.sel.primary().head, "div");
        var wrapOff = display.wrapper.getBoundingClientRect(), lineOff = display.lineDiv.getBoundingClientRect();
        result.teTop = Math.max(0, Math.min(display.wrapper.clientHeight - 10,
                                            headPos.top + lineOff.top - wrapOff.top));
        result.teLeft = Math.max(0, Math.min(display.wrapper.clientWidth - 10,
                                             headPos.left + lineOff.left - wrapOff.left));
      }

      return result;
    },

    showSelection: function(drawn) {
      var cm = this.cm, display = cm.display;
      removeChildrenAndAdd(display.cursorDiv, drawn.cursors);
      removeChildrenAndAdd(display.selectionDiv, drawn.selection);
      if (drawn.teTop != null) {
        this.wrapper.style.top = drawn.teTop + "px";
        this.wrapper.style.left = drawn.teLeft + "px";
      }
    },

    // Reset the input to correspond to the selection (or to be empty,
    // when not typing and nothing is selected)
    reset: function(typing) {
      if (this.contextMenuPending) return;
      var minimal, selected, cm = this.cm, doc = cm.doc;
      if (cm.somethingSelected()) {
        this.prevInput = "";
        var range = doc.sel.primary();
        minimal = hasCopyEvent &&
          (range.to().line - range.from().line > 100 || (selected = cm.getSelection()).length > 1000);
        var content = minimal ? "-" : selected || cm.getSelection();
        this.textarea.value = content;
        if (cm.state.focused) selectInput(this.textarea);
        if (ie && ie_version >= 9) this.hasSelection = content;
      } else if (!typing) {
        this.prevInput = this.textarea.value = "";
        if (ie && ie_version >= 9) this.hasSelection = null;
      }
      this.inaccurateSelection = minimal;
    },

    getField: function() { return this.textarea; },

    supportsTouch: function() { return false; },

    focus: function() {
      if (this.cm.options.readOnly != "nocursor" && (!mobile || activeElt() != this.textarea)) {
        try { this.textarea.focus(); }
        catch (e) {} // IE8 will throw if the textarea is display: none or not in DOM
      }
    },

    blur: function() { this.textarea.blur(); },

    resetPosition: function() {
      this.wrapper.style.top = this.wrapper.style.left = 0;
    },

    receivedFocus: function() { this.slowPoll(); },

    // Poll for input changes, using the normal rate of polling. This
    // runs as long as the editor is focused.
    slowPoll: function() {
      var input = this;
      if (input.pollingFast) return;
      input.polling.set(this.cm.options.pollInterval, function() {
        input.poll();
        if (input.cm.state.focused) input.slowPoll();
      });
    },

    // When an event has just come in that is likely to add or change
    // something in the input textarea, we poll faster, to ensure that
    // the change appears on the screen quickly.
    fastPoll: function() {
      var missed = false, input = this;
      input.pollingFast = true;
      function p() {
        var changed = input.poll();
        if (!changed && !missed) {missed = true; input.polling.set(60, p);}
        else {input.pollingFast = false; input.slowPoll();}
      }
      input.polling.set(20, p);
    },

    // Read input from the textarea, and update the document to match.
    // When something is selected, it is present in the textarea, and
    // selected (unless it is huge, in which case a placeholder is
    // used). When nothing is selected, the cursor sits after previously
    // seen text (can be empty), which is stored in prevInput (we must
    // not reset the textarea when typing, because that breaks IME).
    poll: function() {
      var cm = this.cm, input = this.textarea, prevInput = this.prevInput;
      // Since this is called a *lot*, try to bail out as cheaply as
      // possible when it is clear that nothing happened. hasSelection
      // will be the case when there is a lot of text in the textarea,
      // in which case reading its value would be expensive.
      if (this.contextMenuPending || !cm.state.focused ||
          (hasSelection(input) && !prevInput && !this.composing) ||
          cm.isReadOnly() || cm.options.disableInput || cm.state.keySeq)
        return false;

      var text = input.value;
      // If nothing changed, bail.
      if (text == prevInput && !cm.somethingSelected()) return false;
      // Work around nonsensical selection resetting in IE9/10, and
      // inexplicable appearance of private area unicode characters on
      // some key combos in Mac (#2689).
      if (ie && ie_version >= 9 && this.hasSelection === text ||
          mac && /[\uf700-\uf7ff]/.test(text)) {
        cm.display.input.reset();
        return false;
      }

      if (cm.doc.sel == cm.display.selForContextMenu) {
        var first = text.charCodeAt(0);
        if (first == 0x200b && !prevInput) prevInput = "\u200b";
        if (first == 0x21da) { this.reset(); return this.cm.execCommand("undo"); }
      }
      // Find the part of the input that is actually new
      var same = 0, l = Math.min(prevInput.length, text.length);
      while (same < l && prevInput.charCodeAt(same) == text.charCodeAt(same)) ++same;

      var self = this;
      runInOp(cm, function() {
        applyTextInput(cm, text.slice(same), prevInput.length - same,
                       null, self.composing ? "*compose" : null);

        // Don't leave long text in the textarea, since it makes further polling slow
        if (text.length > 1000 || text.indexOf("\n") > -1) input.value = self.prevInput = "";
        else self.prevInput = text;

        if (self.composing) {
          self.composing.range.clear();
          self.composing.range = cm.markText(self.composing.start, cm.getCursor("to"),
                                             {className: "CodeMirror-composing"});
        }
      });
      return true;
    },

    ensurePolled: function() {
      if (this.pollingFast && this.poll()) this.pollingFast = false;
    },

    onKeyPress: function() {
      if (ie && ie_version >= 9) this.hasSelection = null;
      this.fastPoll();
    },

    onContextMenu: function(e) {
      var input = this, cm = input.cm, display = cm.display, te = input.textarea;
      var pos = posFromMouse(cm, e), scrollPos = display.scroller.scrollTop;
      if (!pos || presto) return; // Opera is difficult.

      // Reset the current text selection only if the click is done outside of the selection
      // and 'resetSelectionOnContextMenu' option is true.
      var reset = cm.options.resetSelectionOnContextMenu;
      if (reset && cm.doc.sel.contains(pos) == -1)
        operation(cm, setSelection)(cm.doc, simpleSelection(pos), sel_dontScroll);

      var oldCSS = te.style.cssText;
      input.wrapper.style.position = "absolute";
      te.style.cssText = "position: fixed; width: 30px; height: 30px; top: " + (e.clientY - 5) +
        "px; left: " + (e.clientX - 5) + "px; z-index: 1000; background: " +
        (ie ? "rgba(255, 255, 255, .05)" : "transparent") +
        "; outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);";
      if (webkit) var oldScrollY = window.scrollY; // Work around Chrome issue (#2712)
      display.input.focus();
      if (webkit) window.scrollTo(null, oldScrollY);
      display.input.reset();
      // Adds "Select all" to context menu in FF
      if (!cm.somethingSelected()) te.value = input.prevInput = " ";
      input.contextMenuPending = true;
      display.selForContextMenu = cm.doc.sel;
      clearTimeout(display.detectingSelectAll);

      // Select-all will be greyed out if there's nothing to select, so
      // this adds a zero-width space so that we can later check whether
      // it got selected.
      function prepareSelectAllHack() {
        if (te.selectionStart != null) {
          var selected = cm.somethingSelected();
          var extval = "\u200b" + (selected ? te.value : "");
          te.value = "\u21da"; // Used to catch context-menu undo
          te.value = extval;
          input.prevInput = selected ? "" : "\u200b";
          te.selectionStart = 1; te.selectionEnd = extval.length;
          // Re-set this, in case some other handler touched the
          // selection in the meantime.
          display.selForContextMenu = cm.doc.sel;
        }
      }
      function rehide() {
        input.contextMenuPending = false;
        input.wrapper.style.position = "relative";
        te.style.cssText = oldCSS;
        if (ie && ie_version < 9) display.scrollbars.setScrollTop(display.scroller.scrollTop = scrollPos);

        // Try to detect the user choosing select-all
        if (te.selectionStart != null) {
          if (!ie || (ie && ie_version < 9)) prepareSelectAllHack();
          var i = 0, poll = function() {
            if (display.selForContextMenu == cm.doc.sel && te.selectionStart == 0 &&
                te.selectionEnd > 0 && input.prevInput == "\u200b")
              operation(cm, commands.selectAll)(cm);
            else if (i++ < 10) display.detectingSelectAll = setTimeout(poll, 500);
            else display.input.reset();
          };
          display.detectingSelectAll = setTimeout(poll, 200);
        }
      }

      if (ie && ie_version >= 9) prepareSelectAllHack();
      if (captureRightClick) {
        e_stop(e);
        var mouseup = function() {
          off(window, "mouseup", mouseup);
          setTimeout(rehide, 20);
        };
        on(window, "mouseup", mouseup);
      } else {
        setTimeout(rehide, 50);
      }
    },

    readOnlyChanged: function(val) {
      if (!val) this.reset();
    },

    setUneditable: nothing,

    needsContentAttribute: false
  }, TextareaInput.prototype);

  // CONTENTEDITABLE INPUT STYLE

  function ContentEditableInput(cm) {
    this.cm = cm;
    this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null;
    this.polling = new Delayed();
    this.gracePeriod = false;
  }

  ContentEditableInput.prototype = copyObj({
    init: function(display) {
      var input = this, cm = input.cm;
      var div = input.div = display.lineDiv;
      disableBrowserMagic(div);

      on(div, "paste", function(e) {
        if (!signalDOMEvent(cm, e)) handlePaste(e, cm);
      })

      on(div, "compositionstart", function(e) {
        var data = e.data;
        input.composing = {sel: cm.doc.sel, data: data, startData: data};
        if (!data) return;
        var prim = cm.doc.sel.primary();
        var line = cm.getLine(prim.head.line);
        var found = line.indexOf(data, Math.max(0, prim.head.ch - data.length));
        if (found > -1 && found <= prim.head.ch)
          input.composing.sel = simpleSelection(Pos(prim.head.line, found),
                                                Pos(prim.head.line, found + data.length));
      });
      on(div, "compositionupdate", function(e) {
        input.composing.data = e.data;
      });
      on(div, "compositionend", function(e) {
        var ours = input.composing;
        if (!ours) return;
        if (e.data != ours.startData && !/\u200b/.test(e.data))
          ours.data = e.data;
        // Need a small delay to prevent other code (input event,
        // selection polling) from doing damage when fired right after
        // compositionend.
        setTimeout(function() {
          if (!ours.handled)
            input.applyComposition(ours);
          if (input.composing == ours)
            input.composing = null;
        }, 50);
      });

      on(div, "touchstart", function() {
        input.forceCompositionEnd();
      });

      on(div, "input", function() {
        if (input.composing) return;
        if (cm.isReadOnly() || !input.pollContent())
          runInOp(input.cm, function() {regChange(cm);});
      });

      function onCopyCut(e) {
        if (cm.somethingSelected()) {
          lastCopied = cm.getSelections();
          if (e.type == "cut") cm.replaceSelection("", null, "cut");
        } else if (!cm.options.lineWiseCopyCut) {
          return;
        } else {
          var ranges = copyableRanges(cm);
          lastCopied = ranges.text;
          if (e.type == "cut") {
            cm.operation(function() {
              cm.setSelections(ranges.ranges, 0, sel_dontScroll);
              cm.replaceSelection("", null, "cut");
            });
          }
        }
        // iOS exposes the clipboard API, but seems to discard content inserted into it
        if (e.clipboardData && !ios) {
          e.preventDefault();
          e.clipboardData.clearData();
          e.clipboardData.setData("text/plain", lastCopied.join("\n"));
        } else {
          // Old-fashioned briefly-focus-a-textarea hack
          var kludge = hiddenTextarea(), te = kludge.firstChild;
          cm.display.lineSpace.insertBefore(kludge, cm.display.lineSpace.firstChild);
          te.value = lastCopied.join("\n");
          var hadFocus = document.activeElement;
          selectInput(te);
          setTimeout(function() {
            cm.display.lineSpace.removeChild(kludge);
            hadFocus.focus();
          }, 50);
        }
      }
      on(div, "copy", onCopyCut);
      on(div, "cut", onCopyCut);
    },

    prepareSelection: function() {
      var result = prepareSelection(this.cm, false);
      result.focus = this.cm.state.focused;
      return result;
    },

    showSelection: function(info) {
      if (!info || !this.cm.display.view.length) return;
      if (info.focus) this.showPrimarySelection();
      this.showMultipleSelections(info);
    },

    showPrimarySelection: function() {
      var sel = window.getSelection(), prim = this.cm.doc.sel.primary();
      var curAnchor = domToPos(this.cm, sel.anchorNode, sel.anchorOffset);
      var curFocus = domToPos(this.cm, sel.focusNode, sel.focusOffset);
      if (curAnchor && !curAnchor.bad && curFocus && !curFocus.bad &&
          cmp(minPos(curAnchor, curFocus), prim.from()) == 0 &&
          cmp(maxPos(curAnchor, curFocus), prim.to()) == 0)
        return;

      var start = posToDOM(this.cm, prim.from());
      var end = posToDOM(this.cm, prim.to());
      if (!start && !end) return;

      var view = this.cm.display.view;
      var old = sel.rangeCount && sel.getRangeAt(0);
      if (!start) {
        start = {node: view[0].measure.map[2], offset: 0};
      } else if (!end) { // FIXME dangerously hacky
        var measure = view[view.length - 1].measure;
        var map = measure.maps ? measure.maps[measure.maps.length - 1] : measure.map;
        end = {node: map[map.length - 1], offset: map[map.length - 2] - map[map.length - 3]};
      }

      try { var rng = range(start.node, start.offset, end.offset, end.node); }
      catch(e) {} // Our model of the DOM might be outdated, in which case the range we try to set can be impossible
      if (rng) {
        if (!gecko && this.cm.state.focused) {
          sel.collapse(start.node, start.offset);
          if (!rng.collapsed) sel.addRange(rng);
        } else {
          sel.removeAllRanges();
          sel.addRange(rng);
        }
        if (old && sel.anchorNode == null) sel.addRange(old);
        else if (gecko) this.startGracePeriod();
      }
      this.rememberSelection();
    },

    startGracePeriod: function() {
      var input = this;
      clearTimeout(this.gracePeriod);
      this.gracePeriod = setTimeout(function() {
        input.gracePeriod = false;
        if (input.selectionChanged())
          input.cm.operation(function() { input.cm.curOp.selectionChanged = true; });
      }, 20);
    },

    showMultipleSelections: function(info) {
      removeChildrenAndAdd(this.cm.display.cursorDiv, info.cursors);
      removeChildrenAndAdd(this.cm.display.selectionDiv, info.selection);
    },

    rememberSelection: function() {
      var sel = window.getSelection();
      this.lastAnchorNode = sel.anchorNode; this.lastAnchorOffset = sel.anchorOffset;
      this.lastFocusNode = sel.focusNode; this.lastFocusOffset = sel.focusOffset;
    },

    selectionInEditor: function() {
      var sel = window.getSelection();
      if (!sel.rangeCount) return false;
      var node = sel.getRangeAt(0).commonAncestorContainer;
      return contains(this.div, node);
    },

    focus: function() {
      if (this.cm.options.readOnly != "nocursor") this.div.focus();
    },
    blur: function() { this.div.blur(); },
    getField: function() { return this.div; },

    supportsTouch: function() { return true; },

    receivedFocus: function() {
      var input = this;
      if (this.selectionInEditor())
        this.pollSelection();
      else
        runInOp(this.cm, function() { input.cm.curOp.selectionChanged = true; });

      function poll() {
        if (input.cm.state.focused) {
          input.pollSelection();
          input.polling.set(input.cm.options.pollInterval, poll);
        }
      }
      this.polling.set(this.cm.options.pollInterval, poll);
    },

    selectionChanged: function() {
      var sel = window.getSelection();
      return sel.anchorNode != this.lastAnchorNode || sel.anchorOffset != this.lastAnchorOffset ||
        sel.focusNode != this.lastFocusNode || sel.focusOffset != this.lastFocusOffset;
    },

    pollSelection: function() {
      if (!this.composing && !this.gracePeriod && this.selectionChanged()) {
        var sel = window.getSelection(), cm = this.cm;
        this.rememberSelection();
        var anchor = domToPos(cm, sel.anchorNode, sel.anchorOffset);
        var head = domToPos(cm, sel.focusNode, sel.focusOffset);
        if (anchor && head) runInOp(cm, function() {
          setSelection(cm.doc, simpleSelection(anchor, head), sel_dontScroll);
          if (anchor.bad || head.bad) cm.curOp.selectionChanged = true;
        });
      }
    },

    pollContent: function() {
      var cm = this.cm, display = cm.display, sel = cm.doc.sel.primary();
      var from = sel.from(), to = sel.to();
      if (from.line < display.viewFrom || to.line > display.viewTo - 1) return false;

      var fromIndex;
      if (from.line == display.viewFrom || (fromIndex = findViewIndex(cm, from.line)) == 0) {
        var fromLine = lineNo(display.view[0].line);
        var fromNode = display.view[0].node;
      } else {
        var fromLine = lineNo(display.view[fromIndex].line);
        var fromNode = display.view[fromIndex - 1].node.nextSibling;
      }
      var toIndex = findViewIndex(cm, to.line);
      if (toIndex == display.view.length - 1) {
        var toLine = display.viewTo - 1;
        var toNode = display.lineDiv.lastChild;
      } else {
        var toLine = lineNo(display.view[toIndex + 1].line) - 1;
        var toNode = display.view[toIndex + 1].node.previousSibling;
      }

      var newText = cm.doc.splitLines(domTextBetween(cm, fromNode, toNode, fromLine, toLine));
      var oldText = getBetween(cm.doc, Pos(fromLine, 0), Pos(toLine, getLine(cm.doc, toLine).text.length));
      while (newText.length > 1 && oldText.length > 1) {
        if (lst(newText) == lst(oldText)) { newText.pop(); oldText.pop(); toLine--; }
        else if (newText[0] == oldText[0]) { newText.shift(); oldText.shift(); fromLine++; }
        else break;
      }

      var cutFront = 0, cutEnd = 0;
      var newTop = newText[0], oldTop = oldText[0], maxCutFront = Math.min(newTop.length, oldTop.length);
      while (cutFront < maxCutFront && newTop.charCodeAt(cutFront) == oldTop.charCodeAt(cutFront))
        ++cutFront;
      var newBot = lst(newText), oldBot = lst(oldText);
      var maxCutEnd = Math.min(newBot.length - (newText.length == 1 ? cutFront : 0),
                               oldBot.length - (oldText.length == 1 ? cutFront : 0));
      while (cutEnd < maxCutEnd &&
             newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1))
        ++cutEnd;

      newText[newText.length - 1] = newBot.slice(0, newBot.length - cutEnd);
      newText[0] = newText[0].slice(cutFront);

      var chFrom = Pos(fromLine, cutFront);
      var chTo = Pos(toLine, oldText.length ? lst(oldText).length - cutEnd : 0);
      if (newText.length > 1 || newText[0] || cmp(chFrom, chTo)) {
        replaceRange(cm.doc, newText, chFrom, chTo, "+input");
        return true;
      }
    },

    ensurePolled: function() {
      this.forceCompositionEnd();
    },
    reset: function() {
      this.forceCompositionEnd();
    },
    forceCompositionEnd: function() {
      if (!this.composing || this.composing.handled) return;
      this.applyComposition(this.composing);
      this.composing.handled = true;
      this.div.blur();
      this.div.focus();
    },
    applyComposition: function(composing) {
      if (this.cm.isReadOnly())
        operation(this.cm, regChange)(this.cm)
      else if (composing.data && composing.data != composing.startData)
        operation(this.cm, applyTextInput)(this.cm, composing.data, 0, composing.sel);
    },

    setUneditable: function(node) {
      node.contentEditable = "false"
    },

    onKeyPress: function(e) {
      e.preventDefault();
      if (!this.cm.isReadOnly())
        operation(this.cm, applyTextInput)(this.cm, String.fromCharCode(e.charCode == null ? e.keyCode : e.charCode), 0);
    },

    readOnlyChanged: function(val) {
      this.div.contentEditable = String(val != "nocursor")
    },

    onContextMenu: nothing,
    resetPosition: nothing,

    needsContentAttribute: true
  }, ContentEditableInput.prototype);

  function posToDOM(cm, pos) {
    var view = findViewForLine(cm, pos.line);
    if (!view || view.hidden) return null;
    var line = getLine(cm.doc, pos.line);
    var info = mapFromLineView(view, line, pos.line);

    var order = getOrder(line), side = "left";
    if (order) {
      var partPos = getBidiPartAt(order, pos.ch);
      side = partPos % 2 ? "right" : "left";
    }
    var result = nodeAndOffsetInLineMap(info.map, pos.ch, side);
    result.offset = result.collapse == "right" ? result.end : result.start;
    return result;
  }

  function badPos(pos, bad) { if (bad) pos.bad = true; return pos; }

  function domToPos(cm, node, offset) {
    var lineNode;
    if (node == cm.display.lineDiv) {
      lineNode = cm.display.lineDiv.childNodes[offset];
      if (!lineNode) return badPos(cm.clipPos(Pos(cm.display.viewTo - 1)), true);
      node = null; offset = 0;
    } else {
      for (lineNode = node;; lineNode = lineNode.parentNode) {
        if (!lineNode || lineNode == cm.display.lineDiv) return null;
        if (lineNode.parentNode && lineNode.parentNode == cm.display.lineDiv) break;
      }
    }
    for (var i = 0; i < cm.display.view.length; i++) {
      var lineView = cm.display.view[i];
      if (lineView.node == lineNode)
        return locateNodeInLineView(lineView, node, offset);
    }
  }

  function locateNodeInLineView(lineView, node, offset) {
    var wrapper = lineView.text.firstChild, bad = false;
    if (!node || !contains(wrapper, node)) return badPos(Pos(lineNo(lineView.line), 0), true);
    if (node == wrapper) {
      bad = true;
      node = wrapper.childNodes[offset];
      offset = 0;
      if (!node) {
        var line = lineView.rest ? lst(lineView.rest) : lineView.line;
        return badPos(Pos(lineNo(line), line.text.length), bad);
      }
    }

    var textNode = node.nodeType == 3 ? node : null, topNode = node;
    if (!textNode && node.childNodes.length == 1 && node.firstChild.nodeType == 3) {
      textNode = node.firstChild;
      if (offset) offset = textNode.nodeValue.length;
    }
    while (topNode.parentNode != wrapper) topNode = topNode.parentNode;
    var measure = lineView.measure, maps = measure.maps;

    function find(textNode, topNode, offset) {
      for (var i = -1; i < (maps ? maps.length : 0); i++) {
        var map = i < 0 ? measure.map : maps[i];
        for (var j = 0; j < map.length; j += 3) {
          var curNode = map[j + 2];
          if (curNode == textNode || curNode == topNode) {
            var line = lineNo(i < 0 ? lineView.line : lineView.rest[i]);
            var ch = map[j] + offset;
            if (offset < 0 || curNode != textNode) ch = map[j + (offset ? 1 : 0)];
            return Pos(line, ch);
          }
        }
      }
    }
    var found = find(textNode, topNode, offset);
    if (found) return badPos(found, bad);

    // FIXME this is all really shaky. might handle the few cases it needs to handle, but likely to cause problems
    for (var after = topNode.nextSibling, dist = textNode ? textNode.nodeValue.length - offset : 0; after; after = after.nextSibling) {
      found = find(after, after.firstChild, 0);
      if (found)
        return badPos(Pos(found.line, found.ch - dist), bad);
      else
        dist += after.textContent.length;
    }
    for (var before = topNode.previousSibling, dist = offset; before; before = before.previousSibling) {
      found = find(before, before.firstChild, -1);
      if (found)
        return badPos(Pos(found.line, found.ch + dist), bad);
      else
        dist += after.textContent.length;
    }
  }

  function domTextBetween(cm, from, to, fromLine, toLine) {
    var text = "", closing = false, lineSep = cm.doc.lineSeparator();
    function recognizeMarker(id) { return function(marker) { return marker.id == id; }; }
    function walk(node) {
      if (node.nodeType == 1) {
        var cmText = node.getAttribute("cm-text");
        if (cmText != null) {
          if (cmText == "") cmText = node.textContent.replace(/\u200b/g, "");
          text += cmText;
          return;
        }
        var markerID = node.getAttribute("cm-marker"), range;
        if (markerID) {
          var found = cm.findMarks(Pos(fromLine, 0), Pos(toLine + 1, 0), recognizeMarker(+markerID));
          if (found.length && (range = found[0].find()))
            text += getBetween(cm.doc, range.from, range.to).join(lineSep);
          return;
        }
        if (node.getAttribute("contenteditable") == "false") return;
        for (var i = 0; i < node.childNodes.length; i++)
          walk(node.childNodes[i]);
        if (/^(pre|div|p)$/i.test(node.nodeName))
          closing = true;
      } else if (node.nodeType == 3) {
        var val = node.nodeValue;
        if (!val) return;
        if (closing) {
          text += lineSep;
          closing = false;
        }
        text += val;
      }
    }
    for (;;) {
      walk(from);
      if (from == to) break;
      from = from.nextSibling;
    }
    return text;
  }

  CodeMirror.inputStyles = {"textarea": TextareaInput, "contenteditable": ContentEditableInput};

  // SELECTION / CURSOR

  // Selection objects are immutable. A new one is created every time
  // the selection changes. A selection is one or more non-overlapping
  // (and non-touching) ranges, sorted, and an integer that indicates
  // which one is the primary selection (the one that's scrolled into
  // view, that getCursor returns, etc).
  function Selection(ranges, primIndex) {
    this.ranges = ranges;
    this.primIndex = primIndex;
  }

  Selection.prototype = {
    primary: function() { return this.ranges[this.primIndex]; },
    equals: function(other) {
      if (other == this) return true;
      if (other.primIndex != this.primIndex || other.ranges.length != this.ranges.length) return false;
      for (var i = 0; i < this.ranges.length; i++) {
        var here = this.ranges[i], there = other.ranges[i];
        if (cmp(here.anchor, there.anchor) != 0 || cmp(here.head, there.head) != 0) return false;
      }
      return true;
    },
    deepCopy: function() {
      for (var out = [], i = 0; i < this.ranges.length; i++)
        out[i] = new Range(copyPos(this.ranges[i].anchor), copyPos(this.ranges[i].head));
      return new Selection(out, this.primIndex);
    },
    somethingSelected: function() {
      for (var i = 0; i < this.ranges.length; i++)
        if (!this.ranges[i].empty()) return true;
      return false;
    },
    contains: function(pos, end) {
      if (!end) end = pos;
      for (var i = 0; i < this.ranges.length; i++) {
        var range = this.ranges[i];
        if (cmp(end, range.from()) >= 0 && cmp(pos, range.to()) <= 0)
          return i;
      }
      return -1;
    }
  };

  function Range(anchor, head) {
    this.anchor = anchor; this.head = head;
  }

  Range.prototype = {
    from: function() { return minPos(this.anchor, this.head); },
    to: function() { return maxPos(this.anchor, this.head); },
    empty: function() {
      return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch;
    }
  };

  // Take an unsorted, potentially overlapping set of ranges, and
  // build a selection out of it. 'Consumes' ranges array (modifying
  // it).
  function normalizeSelection(ranges, primIndex) {
    var prim = ranges[primIndex];
    ranges.sort(function(a, b) { return cmp(a.from(), b.from()); });
    primIndex = indexOf(ranges, prim);
    for (var i = 1; i < ranges.length; i++) {
      var cur = ranges[i], prev = ranges[i - 1];
      if (cmp(prev.to(), cur.from()) >= 0) {
        var from = minPos(prev.from(), cur.from()), to = maxPos(prev.to(), cur.to());
        var inv = prev.empty() ? cur.from() == cur.head : prev.from() == prev.head;
        if (i <= primIndex) --primIndex;
        ranges.splice(--i, 2, new Range(inv ? to : from, inv ? from : to));
      }
    }
    return new Selection(ranges, primIndex);
  }

  function simpleSelection(anchor, head) {
    return new Selection([new Range(anchor, head || anchor)], 0);
  }

  // Most of the external API clips given positions to make sure they
  // actually exist within the document.
  function clipLine(doc, n) {return Math.max(doc.first, Math.min(n, doc.first + doc.size - 1));}
  function clipPos(doc, pos) {
    if (pos.line < doc.first) return Pos(doc.first, 0);
    var last = doc.first + doc.size - 1;
    if (pos.line > last) return Pos(last, getLine(doc, last).text.length);
    return clipToLen(pos, getLine(doc, pos.line).text.length);
  }
  function clipToLen(pos, linelen) {
    var ch = pos.ch;
    if (ch == null || ch > linelen) return Pos(pos.line, linelen);
    else if (ch < 0) return Pos(pos.line, 0);
    else return pos;
  }
  function isLine(doc, l) {return l >= doc.first && l < doc.first + doc.size;}
  function clipPosArray(doc, array) {
    for (var out = [], i = 0; i < array.length; i++) out[i] = clipPos(doc, array[i]);
    return out;
  }

  // SELECTION UPDATES

  // The 'scroll' parameter given to many of these indicated whether
  // the new cursor position should be scrolled into view after
  // modifying the selection.

  // If shift is held or the extend flag is set, extends a range to
  // include a given position (and optionally a second position).
  // Otherwise, simply returns the range between the given positions.
  // Used for cursor motion and such.
  function extendRange(doc, range, head, other) {
    if (doc.cm && doc.cm.display.shift || doc.extend) {
      var anchor = range.anchor;
      if (other) {
        var posBefore = cmp(head, anchor) < 0;
        if (posBefore != (cmp(other, anchor) < 0)) {
          anchor = head;
          head = other;
        } else if (posBefore != (cmp(head, other) < 0)) {
          head = other;
        }
      }
      return new Range(anchor, head);
    } else {
      return new Range(other || head, head);
    }
  }

  // Extend the primary selection range, discard the rest.
  function extendSelection(doc, head, other, options) {
    setSelection(doc, new Selection([extendRange(doc, doc.sel.primary(), head, other)], 0), options);
  }

  // Extend all selections (pos is an array of selections with length
  // equal the number of selections)
  function extendSelections(doc, heads, options) {
    for (var out = [], i = 0; i < doc.sel.ranges.length; i++)
      out[i] = extendRange(doc, doc.sel.ranges[i], heads[i], null);
    var newSel = normalizeSelection(out, doc.sel.primIndex);
    setSelection(doc, newSel, options);
  }

  // Updates a single range in the selection.
  function replaceOneSelection(doc, i, range, options) {
    var ranges = doc.sel.ranges.slice(0);
    ranges[i] = range;
    setSelection(doc, normalizeSelection(ranges, doc.sel.primIndex), options);
  }

  // Reset the selection to a single range.
  function setSimpleSelection(doc, anchor, head, options) {
    setSelection(doc, simpleSelection(anchor, head), options);
  }

  // Give beforeSelectionChange handlers a change to influence a
  // selection update.
  function filterSelectionChange(doc, sel, options) {
    var obj = {
      ranges: sel.ranges,
      update: function(ranges) {
        this.ranges = [];
        for (var i = 0; i < ranges.length; i++)
          this.ranges[i] = new Range(clipPos(doc, ranges[i].anchor),
                                     clipPos(doc, ranges[i].head));
      },
      origin: options && options.origin
    };
    signal(doc, "beforeSelectionChange", doc, obj);
    if (doc.cm) signal(doc.cm, "beforeSelectionChange", doc.cm, obj);
    if (obj.ranges != sel.ranges) return normalizeSelection(obj.ranges, obj.ranges.length - 1);
    else return sel;
  }

  function setSelectionReplaceHistory(doc, sel, options) {
    var done = doc.history.done, last = lst(done);
    if (last && last.ranges) {
      done[done.length - 1] = sel;
      setSelectionNoUndo(doc, sel, options);
    } else {
      setSelection(doc, sel, options);
    }
  }

  // Set a new selection.
  function setSelection(doc, sel, options) {
    setSelectionNoUndo(doc, sel, options);
    addSelectionToHistory(doc, doc.sel, doc.cm ? doc.cm.curOp.id : NaN, options);
  }

  function setSelectionNoUndo(doc, sel, options) {
    if (hasHandler(doc, "beforeSelectionChange") || doc.cm && hasHandler(doc.cm, "beforeSelectionChange"))
      sel = filterSelectionChange(doc, sel, options);

    var bias = options && options.bias ||
      (cmp(sel.primary().head, doc.sel.primary().head) < 0 ? -1 : 1);
    setSelectionInner(doc, skipAtomicInSelection(doc, sel, bias, true));

    if (!(options && options.scroll === false) && doc.cm)
      ensureCursorVisible(doc.cm);
  }

  function setSelectionInner(doc, sel) {
    if (sel.equals(doc.sel)) return;

    doc.sel = sel;

    if (doc.cm) {
      doc.cm.curOp.updateInput = doc.cm.curOp.selectionChanged = true;
      signalCursorActivity(doc.cm);
    }
    signalLater(doc, "cursorActivity", doc);
  }

  // Verify that the selection does not partially select any atomic
  // marked ranges.
  function reCheckSelection(doc) {
    setSelectionInner(doc, skipAtomicInSelection(doc, doc.sel, null, false), sel_dontScroll);
  }

  // Return a selection that does not partially select any atomic
  // ranges.
  function skipAtomicInSelection(doc, sel, bias, mayClear) {
    var out;
    for (var i = 0; i < sel.ranges.length; i++) {
      var range = sel.ranges[i];
      var old = sel.ranges.length == doc.sel.ranges.length && doc.sel.ranges[i];
      var newAnchor = skipAtomic(doc, range.anchor, old && old.anchor, bias, mayClear);
      var newHead = skipAtomic(doc, range.head, old && old.head, bias, mayClear);
      if (out || newAnchor != range.anchor || newHead != range.head) {
        if (!out) out = sel.ranges.slice(0, i);
        out[i] = new Range(newAnchor, newHead);
      }
    }
    return out ? normalizeSelection(out, sel.primIndex) : sel;
  }

  function skipAtomicInner(doc, pos, oldPos, dir, mayClear) {
    var line = getLine(doc, pos.line);
    if (line.markedSpans) for (var i = 0; i < line.markedSpans.length; ++i) {
      var sp = line.markedSpans[i], m = sp.marker;
      if ((sp.from == null || (m.inclusiveLeft ? sp.from <= pos.ch : sp.from < pos.ch)) &&
          (sp.to == null || (m.inclusiveRight ? sp.to >= pos.ch : sp.to > pos.ch))) {
        if (mayClear) {
          signal(m, "beforeCursorEnter");
          if (m.explicitlyCleared) {
            if (!line.markedSpans) break;
            else {--i; continue;}
          }
        }
        if (!m.atomic) continue;

        if (oldPos) {
          var near = m.find(dir < 0 ? 1 : -1), diff;
          if (dir < 0 ? m.inclusiveRight : m.inclusiveLeft) near = movePos(doc, near, -dir, line);
          if (near && near.line == pos.line && (diff = cmp(near, oldPos)) && (dir < 0 ? diff < 0 : diff > 0))
            return skipAtomicInner(doc, near, pos, dir, mayClear);
        }

        var far = m.find(dir < 0 ? -1 : 1);
        if (dir < 0 ? m.inclusiveLeft : m.inclusiveRight) far = movePos(doc, far, dir, line);
        return far ? skipAtomicInner(doc, far, pos, dir, mayClear) : null;
      }
    }
    return pos;
  }

  // Ensure a given position is not inside an atomic range.
  function skipAtomic(doc, pos, oldPos, bias, mayClear) {
    var dir = bias || 1;
    var found = skipAtomicInner(doc, pos, oldPos, dir, mayClear) ||
        (!mayClear && skipAtomicInner(doc, pos, oldPos, dir, true)) ||
        skipAtomicInner(doc, pos, oldPos, -dir, mayClear) ||
        (!mayClear && skipAtomicInner(doc, pos, oldPos, -dir, true));
    if (!found) {
      doc.cantEdit = true;
      return Pos(doc.first, 0);
    }
    return found;
  }

  function movePos(doc, pos, dir, line) {
    if (dir < 0 && pos.ch == 0) {
      if (pos.line > doc.first) return clipPos(doc, Pos(pos.line - 1));
      else return null;
    } else if (dir > 0 && pos.ch == (line || getLine(doc, pos.line)).text.length) {
      if (pos.line < doc.first + doc.size - 1) return Pos(pos.line + 1, 0);
      else return null;
    } else {
      return new Pos(pos.line, pos.ch + dir);
    }
  }

  // SELECTION DRAWING

  function updateSelection(cm) {
    cm.display.input.showSelection(cm.display.input.prepareSelection());
  }

  function prepareSelection(cm, primary) {
    var doc = cm.doc, result = {};
    var curFragment = result.cursors = document.createDocumentFragment();
    var selFragment = result.selection = document.createDocumentFragment();

    for (var i = 0; i < doc.sel.ranges.length; i++) {
      if (primary === false && i == doc.sel.primIndex) continue;
      var range = doc.sel.ranges[i];
      var collapsed = range.empty();
      if (collapsed || cm.options.showCursorWhenSelecting)
        drawSelectionCursor(cm, range.head, curFragment);
      if (!collapsed)
        drawSelectionRange(cm, range, selFragment);
    }
    return result;
  }

  // Draws a cursor for the given range
  function drawSelectionCursor(cm, head, output) {
    var pos = cursorCoords(cm, head, "div", null, null, !cm.options.singleCursorHeightPerLine);

    var cursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor"));
    cursor.style.left = pos.left + "px";
    cursor.style.top = pos.top + "px";
    cursor.style.height = Math.max(0, pos.bottom - pos.top) * cm.options.cursorHeight + "px";

    if (pos.other) {
      // Secondary cursor, shown when on a 'jump' in bi-directional text
      var otherCursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor CodeMirror-secondarycursor"));
      otherCursor.style.display = "";
      otherCursor.style.left = pos.other.left + "px";
      otherCursor.style.top = pos.other.top + "px";
      otherCursor.style.height = (pos.other.bottom - pos.other.top) * .85 + "px";
    }
  }

  // Draws the given range as a highlighted selection
  function drawSelectionRange(cm, range, output) {
    var display = cm.display, doc = cm.doc;
    var fragment = document.createDocumentFragment();
    var padding = paddingH(cm.display), leftSide = padding.left;
    var rightSide = Math.max(display.sizerWidth, displayWidth(cm) - display.sizer.offsetLeft) - padding.right;

    function add(left, top, width, bottom) {
      if (top < 0) top = 0;
      top = Math.round(top);
      bottom = Math.round(bottom);
      fragment.appendChild(elt("div", null, "CodeMirror-selected", "position: absolute; left: " + left +
                               "px; top: " + top + "px; width: " + (width == null ? rightSide - left : width) +
                               "px; height: " + (bottom - top) + "px"));
    }

    function drawForLine(line, fromArg, toArg) {
      var lineObj = getLine(doc, line);
      var lineLen = lineObj.text.length;
      var start, end;
      function coords(ch, bias) {
        return charCoords(cm, Pos(line, ch), "div", lineObj, bias);
      }

      iterateBidiSections(getOrder(lineObj), fromArg || 0, toArg == null ? lineLen : toArg, function(from, to, dir) {
        var leftPos = coords(from, "left"), rightPos, left, right;
        if (from == to) {
          rightPos = leftPos;
          left = right = leftPos.left;
        } else {
          rightPos = coords(to - 1, "right");
          if (dir == "rtl") { var tmp = leftPos; leftPos = rightPos; rightPos = tmp; }
          left = leftPos.left;
          right = rightPos.right;
        }
        if (fromArg == null && from == 0) left = leftSide;
        if (rightPos.top - leftPos.top > 3) { // Different lines, draw top part
          add(left, leftPos.top, null, leftPos.bottom);
          left = leftSide;
          if (leftPos.bottom < rightPos.top) add(left, leftPos.bottom, null, rightPos.top);
        }
        if (toArg == null && to == lineLen) right = rightSide;
        if (!start || leftPos.top < start.top || leftPos.top == start.top && leftPos.left < start.left)
          start = leftPos;
        if (!end || rightPos.bottom > end.bottom || rightPos.bottom == end.bottom && rightPos.right > end.right)
          end = rightPos;
        if (left < leftSide + 1) left = leftSide;
        add(left, rightPos.top, right - left, rightPos.bottom);
      });
      return {start: start, end: end};
    }

    var sFrom = range.from(), sTo = range.to();
    if (sFrom.line == sTo.line) {
      drawForLine(sFrom.line, sFrom.ch, sTo.ch);
    } else {
      var fromLine = getLine(doc, sFrom.line), toLine = getLine(doc, sTo.line);
      var singleVLine = visualLine(fromLine) == visualLine(toLine);
      var leftEnd = drawForLine(sFrom.line, sFrom.ch, singleVLine ? fromLine.text.length + 1 : null).end;
      var rightStart = drawForLine(sTo.line, singleVLine ? 0 : null, sTo.ch).start;
      if (singleVLine) {
        if (leftEnd.top < rightStart.top - 2) {
          add(leftEnd.right, leftEnd.top, null, leftEnd.bottom);
          add(leftSide, rightStart.top, rightStart.left, rightStart.bottom);
        } else {
          add(leftEnd.right, leftEnd.top, rightStart.left - leftEnd.right, leftEnd.bottom);
        }
      }
      if (leftEnd.bottom < rightStart.top)
        add(leftSide, leftEnd.bottom, null, rightStart.top);
    }

    output.appendChild(fragment);
  }

  // Cursor-blinking
  function restartBlink(cm) {
    if (!cm.state.focused) return;
    var display = cm.display;
    clearInterval(display.blinker);
    var on = true;
    display.cursorDiv.style.visibility = "";
    if (cm.options.cursorBlinkRate > 0)
      display.blinker = setInterval(function() {
        display.cursorDiv.style.visibility = (on = !on) ? "" : "hidden";
      }, cm.options.cursorBlinkRate);
    else if (cm.options.cursorBlinkRate < 0)
      display.cursorDiv.style.visibility = "hidden";
  }

  // HIGHLIGHT WORKER

  function startWorker(cm, time) {
    if (cm.doc.mode.startState && cm.doc.frontier < cm.display.viewTo)
      cm.state.highlight.set(time, bind(highlightWorker, cm));
  }

  function highlightWorker(cm) {
    var doc = cm.doc;
    if (doc.frontier < doc.first) doc.frontier = doc.first;
    if (doc.frontier >= cm.display.viewTo) return;
    var end = +new Date + cm.options.workTime;
    var state = copyState(doc.mode, getStateBefore(cm, doc.frontier));
    var changedLines = [];

    doc.iter(doc.frontier, Math.min(doc.first + doc.size, cm.display.viewTo + 500), function(line) {
      if (doc.frontier >= cm.display.viewFrom) { // Visible
        var oldStyles = line.styles, tooLong = line.text.length > cm.options.maxHighlightLength;
        var highlighted = highlightLine(cm, line, tooLong ? copyState(doc.mode, state) : state, true);
        line.styles = highlighted.styles;
        var oldCls = line.styleClasses, newCls = highlighted.classes;
        if (newCls) line.styleClasses = newCls;
        else if (oldCls) line.styleClasses = null;
        var ischange = !oldStyles || oldStyles.length != line.styles.length ||
          oldCls != newCls && (!oldCls || !newCls || oldCls.bgClass != newCls.bgClass || oldCls.textClass != newCls.textClass);
        for (var i = 0; !ischange && i < oldStyles.length; ++i) ischange = oldStyles[i] != line.styles[i];
        if (ischange) changedLines.push(doc.frontier);
        line.stateAfter = tooLong ? state : copyState(doc.mode, state);
      } else {
        if (line.text.length <= cm.options.maxHighlightLength)
          processLine(cm, line.text, state);
        line.stateAfter = doc.frontier % 5 == 0 ? copyState(doc.mode, state) : null;
      }
      ++doc.frontier;
      if (+new Date > end) {
        startWorker(cm, cm.options.workDelay);
        return true;
      }
    });
    if (changedLines.length) runInOp(cm, function() {
      for (var i = 0; i < changedLines.length; i++)
        regLineChange(cm, changedLines[i], "text");
    });
  }

  // Finds the line to start with when starting a parse. Tries to
  // find a line with a stateAfter, so that it can start with a
  // valid state. If that fails, it returns the line with the
  // smallest indentation, which tends to need the least context to
  // parse correctly.
  function findStartLine(cm, n, precise) {
    var minindent, minline, doc = cm.doc;
    var lim = precise ? -1 : n - (cm.doc.mode.innerMode ? 1000 : 100);
    for (var search = n; search > lim; --search) {
      if (search <= doc.first) return doc.first;
      var line = getLine(doc, search - 1);
      if (line.stateAfter && (!precise || search <= doc.frontier)) return search;
      var indented = countColumn(line.text, null, cm.options.tabSize);
      if (minline == null || minindent > indented) {
        minline = search - 1;
        minindent = indented;
      }
    }
    return minline;
  }

  function getStateBefore(cm, n, precise) {
    var doc = cm.doc, display = cm.display;
    if (!doc.mode.startState) return true;
    var pos = findStartLine(cm, n, precise), state = pos > doc.first && getLine(doc, pos-1).stateAfter;
    if (!state) state = startState(doc.mode);
    else state = copyState(doc.mode, state);
    doc.iter(pos, n, function(line) {
      processLine(cm, line.text, state);
      var save = pos == n - 1 || pos % 5 == 0 || pos >= display.viewFrom && pos < display.viewTo;
      line.stateAfter = save ? copyState(doc.mode, state) : null;
      ++pos;
    });
    if (precise) doc.frontier = pos;
    return state;
  }

  // POSITION MEASUREMENT

  function paddingTop(display) {return display.lineSpace.offsetTop;}
  function paddingVert(display) {return display.mover.offsetHeight - display.lineSpace.offsetHeight;}
  function paddingH(display) {
    if (display.cachedPaddingH) return display.cachedPaddingH;
    var e = removeChildrenAndAdd(display.measure, elt("pre", "x"));
    var style = window.getComputedStyle ? window.getComputedStyle(e) : e.currentStyle;
    var data = {left: parseInt(style.paddingLeft), right: parseInt(style.paddingRight)};
    if (!isNaN(data.left) && !isNaN(data.right)) display.cachedPaddingH = data;
    return data;
  }

  function scrollGap(cm) { return scrollerGap - cm.display.nativeBarWidth; }
  function displayWidth(cm) {
    return cm.display.scroller.clientWidth - scrollGap(cm) - cm.display.barWidth;
  }
  function displayHeight(cm) {
    return cm.display.scroller.clientHeight - scrollGap(cm) - cm.display.barHeight;
  }

  // Ensure the lineView.wrapping.heights array is populated. This is
  // an array of bottom offsets for the lines that make up a drawn
  // line. When lineWrapping is on, there might be more than one
  // height.
  function ensureLineHeights(cm, lineView, rect) {
    var wrapping = cm.options.lineWrapping;
    var curWidth = wrapping && displayWidth(cm);
    if (!lineView.measure.heights || wrapping && lineView.measure.width != curWidth) {
      var heights = lineView.measure.heights = [];
      if (wrapping) {
        lineView.measure.width = curWidth;
        var rects = lineView.text.firstChild.getClientRects();
        for (var i = 0; i < rects.length - 1; i++) {
          var cur = rects[i], next = rects[i + 1];
          if (Math.abs(cur.bottom - next.bottom) > 2)
            heights.push((cur.bottom + next.top) / 2 - rect.top);
        }
      }
      heights.push(rect.bottom - rect.top);
    }
  }

  // Find a line map (mapping character offsets to text nodes) and a
  // measurement cache for the given line number. (A line view might
  // contain multiple lines when collapsed ranges are present.)
  function mapFromLineView(lineView, line, lineN) {
    if (lineView.line == line)
      return {map: lineView.measure.map, cache: lineView.measure.cache};
    for (var i = 0; i < lineView.rest.length; i++)
      if (lineView.rest[i] == line)
        return {map: lineView.measure.maps[i], cache: lineView.measure.caches[i]};
    for (var i = 0; i < lineView.rest.length; i++)
      if (lineNo(lineView.rest[i]) > lineN)
        return {map: lineView.measure.maps[i], cache: lineView.measure.caches[i], before: true};
  }

  // Render a line into the hidden node display.externalMeasured. Used
  // when measurement is needed for a line that's not in the viewport.
  function updateExternalMeasurement(cm, line) {
    line = visualLine(line);
    var lineN = lineNo(line);
    var view = cm.display.externalMeasured = new LineView(cm.doc, line, lineN);
    view.lineN = lineN;
    var built = view.built = buildLineContent(cm, view);
    view.text = built.pre;
    removeChildrenAndAdd(cm.display.lineMeasure, built.pre);
    return view;
  }

  // Get a {top, bottom, left, right} box (in line-local coordinates)
  // for a given character.
  function measureChar(cm, line, ch, bias) {
    return measureCharPrepared(cm, prepareMeasureForLine(cm, line), ch, bias);
  }

  // Find a line view that corresponds to the given line number.
  function findViewForLine(cm, lineN) {
    if (lineN >= cm.display.viewFrom && lineN < cm.display.viewTo)
      return cm.display.view[findViewIndex(cm, lineN)];
    var ext = cm.display.externalMeasured;
    if (ext && lineN >= ext.lineN && lineN < ext.lineN + ext.size)
      return ext;
  }

  // Measurement can be split in two steps, the set-up work that
  // applies to the whole line, and the measurement of the actual
  // character. Functions like coordsChar, that need to do a lot of
  // measurements in a row, can thus ensure that the set-up work is
  // only done once.
  function prepareMeasureForLine(cm, line) {
    var lineN = lineNo(line);
    var view = findViewForLine(cm, lineN);
    if (view && !view.text) {
      view = null;
    } else if (view && view.changes) {
      updateLineForChanges(cm, view, lineN, getDimensions(cm));
      cm.curOp.forceUpdate = true;
    }
    if (!view)
      view = updateExternalMeasurement(cm, line);

    var info = mapFromLineView(view, line, lineN);
    return {
      line: line, view: view, rect: null,
      map: info.map, cache: info.cache, before: info.before,
      hasHeights: false
    };
  }

  // Given a prepared measurement object, measures the position of an
  // actual character (or fetches it from the cache).
  function measureCharPrepared(cm, prepared, ch, bias, varHeight) {
    if (prepared.before) ch = -1;
    var key = ch + (bias || ""), found;
    if (prepared.cache.hasOwnProperty(key)) {
      found = prepared.cache[key];
    } else {
      if (!prepared.rect)
        prepared.rect = prepared.view.text.getBoundingClientRect();
      if (!prepared.hasHeights) {
        ensureLineHeights(cm, prepared.view, prepared.rect);
        prepared.hasHeights = true;
      }
      found = measureCharInner(cm, prepared, ch, bias);
      if (!found.bogus) prepared.cache[key] = found;
    }
    return {left: found.left, right: found.right,
            top: varHeight ? found.rtop : found.top,
            bottom: varHeight ? found.rbottom : found.bottom};
  }

  var nullRect = {left: 0, right: 0, top: 0, bottom: 0};

  function nodeAndOffsetInLineMap(map, ch, bias) {
    var node, start, end, collapse;
    // First, search the line map for the text node corresponding to,
    // or closest to, the target character.
    for (var i = 0; i < map.length; i += 3) {
      var mStart = map[i], mEnd = map[i + 1];
      if (ch < mStart) {
        start = 0; end = 1;
        collapse = "left";
      } else if (ch < mEnd) {
        start = ch - mStart;
        end = start + 1;
      } else if (i == map.length - 3 || ch == mEnd && map[i + 3] > ch) {
        end = mEnd - mStart;
        start = end - 1;
        if (ch >= mEnd) collapse = "right";
      }
      if (start != null) {
        node = map[i + 2];
        if (mStart == mEnd && bias == (node.insertLeft ? "left" : "right"))
          collapse = bias;
        if (bias == "left" && start == 0)
          while (i && map[i - 2] == map[i - 3] && map[i - 1].insertLeft) {
            node = map[(i -= 3) + 2];
            collapse = "left";
          }
        if (bias == "right" && start == mEnd - mStart)
          while (i < map.length - 3 && map[i + 3] == map[i + 4] && !map[i + 5].insertLeft) {
            node = map[(i += 3) + 2];
            collapse = "right";
          }
        break;
      }
    }
    return {node: node, start: start, end: end, collapse: collapse, coverStart: mStart, coverEnd: mEnd};
  }

  function measureCharInner(cm, prepared, ch, bias) {
    var place = nodeAndOffsetInLineMap(prepared.map, ch, bias);
    var node = place.node, start = place.start, end = place.end, collapse = place.collapse;

    var rect;
    if (node.nodeType == 3) { // If it is a text node, use a range to retrieve the coordinates.
      for (var i = 0; i < 4; i++) { // Retry a maximum of 4 times when nonsense rectangles are returned
        while (start && isExtendingChar(prepared.line.text.charAt(place.coverStart + start))) --start;
        while (place.coverStart + end < place.coverEnd && isExtendingChar(prepared.line.text.charAt(place.coverStart + end))) ++end;
        if (ie && ie_version < 9 && start == 0 && end == place.coverEnd - place.coverStart) {
          rect = node.parentNode.getBoundingClientRect();
        } else if (ie && cm.options.lineWrapping) {
          var rects = range(node, start, end).getClientRects();
          if (rects.length)
            rect = rects[bias == "right" ? rects.length - 1 : 0];
          else
            rect = nullRect;
        } else {
          rect = range(node, start, end).getBoundingClientRect() || nullRect;
        }
        if (rect.left || rect.right || start == 0) break;
        end = start;
        start = start - 1;
        collapse = "right";
      }
      if (ie && ie_version < 11) rect = maybeUpdateRectForZooming(cm.display.measure, rect);
    } else { // If it is a widget, simply get the box for the whole widget.
      if (start > 0) collapse = bias = "right";
      var rects;
      if (cm.options.lineWrapping && (rects = node.getClientRects()).length > 1)
        rect = rects[bias == "right" ? rects.length - 1 : 0];
      else
        rect = node.getBoundingClientRect();
    }
    if (ie && ie_version < 9 && !start && (!rect || !rect.left && !rect.right)) {
      var rSpan = node.parentNode.getClientRects()[0];
      if (rSpan)
        rect = {left: rSpan.left, right: rSpan.left + charWidth(cm.display), top: rSpan.top, bottom: rSpan.bottom};
      else
        rect = nullRect;
    }

    var rtop = rect.top - prepared.rect.top, rbot = rect.bottom - prepared.rect.top;
    var mid = (rtop + rbot) / 2;
    var heights = prepared.view.measure.heights;
    for (var i = 0; i < heights.length - 1; i++)
      if (mid < heights[i]) break;
    var top = i ? heights[i - 1] : 0, bot = heights[i];
    var result = {left: (collapse == "right" ? rect.right : rect.left) - prepared.rect.left,
                  right: (collapse == "left" ? rect.left : rect.right) - prepared.rect.left,
                  top: top, bottom: bot};
    if (!rect.left && !rect.right) result.bogus = true;
    if (!cm.options.singleCursorHeightPerLine) { result.rtop = rtop; result.rbottom = rbot; }

    return result;
  }

  // Work around problem with bounding client rects on ranges being
  // returned incorrectly when zoomed on IE10 and below.
  function maybeUpdateRectForZooming(measure, rect) {
    if (!window.screen || screen.logicalXDPI == null ||
        screen.logicalXDPI == screen.deviceXDPI || !hasBadZoomedRects(measure))
      return rect;
    var scaleX = screen.logicalXDPI / screen.deviceXDPI;
    var scaleY = screen.logicalYDPI / screen.deviceYDPI;
    return {left: rect.left * scaleX, right: rect.right * scaleX,
            top: rect.top * scaleY, bottom: rect.bottom * scaleY};
  }

  function clearLineMeasurementCacheFor(lineView) {
    if (lineView.measure) {
      lineView.measure.cache = {};
      lineView.measure.heights = null;
      if (lineView.rest) for (var i = 0; i < lineView.rest.length; i++)
        lineView.measure.caches[i] = {};
    }
  }

  function clearLineMeasurementCache(cm) {
    cm.display.externalMeasure = null;
    removeChildren(cm.display.lineMeasure);
    for (var i = 0; i < cm.display.view.length; i++)
      clearLineMeasurementCacheFor(cm.display.view[i]);
  }

  function clearCaches(cm) {
    clearLineMeasurementCache(cm);
    cm.display.cachedCharWidth = cm.display.cachedTextHeight = cm.display.cachedPaddingH = null;
    if (!cm.options.lineWrapping) cm.display.maxLineChanged = true;
    cm.display.lineNumChars = null;
  }

  function pageScrollX() { return window.pageXOffset || (document.documentElement || document.body).scrollLeft; }
  function pageScrollY() { return window.pageYOffset || (document.documentElement || document.body).scrollTop; }

  // Converts a {top, bottom, left, right} box from line-local
  // coordinates into another coordinate system. Context may be one of
  // "line", "div" (display.lineDiv), "local"/null (editor), "window",
  // or "page".
  function intoCoordSystem(cm, lineObj, rect, context) {
    if (lineObj.widgets) for (var i = 0; i < lineObj.widgets.length; ++i) if (lineObj.widgets[i].above) {
      var size = widgetHeight(lineObj.widgets[i]);
      rect.top += size; rect.bottom += size;
    }
    if (context == "line") return rect;
    if (!context) context = "local";
    var yOff = heightAtLine(lineObj);
    if (context == "local") yOff += paddingTop(cm.display);
    else yOff -= cm.display.viewOffset;
    if (context == "page" || context == "window") {
      var lOff = cm.display.lineSpace.getBoundingClientRect();
      yOff += lOff.top + (context == "window" ? 0 : pageScrollY());
      var xOff = lOff.left + (context == "window" ? 0 : pageScrollX());
      rect.left += xOff; rect.right += xOff;
    }
    rect.top += yOff; rect.bottom += yOff;
    return rect;
  }

  // Coverts a box from "div" coords to another coordinate system.
  // Context may be "window", "page", "div", or "local"/null.
  function fromCoordSystem(cm, coords, context) {
    if (context == "div") return coords;
    var left = coords.left, top = coords.top;
    // First move into "page" coordinate system
    if (context == "page") {
      left -= pageScrollX();
      top -= pageScrollY();
    } else if (context == "local" || !context) {
      var localBox = cm.display.sizer.getBoundingClientRect();
      left += localBox.left;
      top += localBox.top;
    }

    var lineSpaceBox = cm.display.lineSpace.getBoundingClientRect();
    return {left: left - lineSpaceBox.left, top: top - lineSpaceBox.top};
  }

  function charCoords(cm, pos, context, lineObj, bias) {
    if (!lineObj) lineObj = getLine(cm.doc, pos.line);
    return intoCoordSystem(cm, lineObj, measureChar(cm, lineObj, pos.ch, bias), context);
  }

  // Returns a box for a given cursor position, which may have an
  // 'other' property containing the position of the secondary cursor
  // on a bidi boundary.
  function cursorCoords(cm, pos, context, lineObj, preparedMeasure, varHeight) {
    lineObj = lineObj || getLine(cm.doc, pos.line);
    if (!preparedMeasure) preparedMeasure = prepareMeasureForLine(cm, lineObj);
    function get(ch, right) {
      var m = measureCharPrepared(cm, preparedMeasure, ch, right ? "right" : "left", varHeight);
      if (right) m.left = m.right; else m.right = m.left;
      return intoCoordSystem(cm, lineObj, m, context);
    }
    function getBidi(ch, partPos) {
      var part = order[partPos], right = part.level % 2;
      if (ch == bidiLeft(part) && partPos && part.level < order[partPos - 1].level) {
        part = order[--partPos];
        ch = bidiRight(part) - (part.level % 2 ? 0 : 1);
        right = true;
      } else if (ch == bidiRight(part) && partPos < order.length - 1 && part.level < order[partPos + 1].level) {
        part = order[++partPos];
        ch = bidiLeft(part) - part.level % 2;
        right = false;
      }
      if (right && ch == part.to && ch > part.from) return get(ch - 1);
      return get(ch, right);
    }
    var order = getOrder(lineObj), ch = pos.ch;
    if (!order) return get(ch);
    var partPos = getBidiPartAt(order, ch);
    var val = getBidi(ch, partPos);
    if (bidiOther != null) val.other = getBidi(ch, bidiOther);
    return val;
  }

  // Used to cheaply estimate the coordinates for a position. Used for
  // intermediate scroll updates.
  function estimateCoords(cm, pos) {
    var left = 0, pos = clipPos(cm.doc, pos);
    if (!cm.options.lineWrapping) left = charWidth(cm.display) * pos.ch;
    var lineObj = getLine(cm.doc, pos.line);
    var top = heightAtLine(lineObj) + paddingTop(cm.display);
    return {left: left, right: left, top: top, bottom: top + lineObj.height};
  }

  // Positions returned by coordsChar contain some extra information.
  // xRel is the relative x position of the input coordinates compared
  // to the found position (so xRel > 0 means the coordinates are to
  // the right of the character position, for example). When outside
  // is true, that means the coordinates lie outside the line's
  // vertical range.
  function PosWithInfo(line, ch, outside, xRel) {
    var pos = Pos(line, ch);
    pos.xRel = xRel;
    if (outside) pos.outside = true;
    return pos;
  }

  // Compute the character position closest to the given coordinates.
  // Input must be lineSpace-local ("div" coordinate system).
  function coordsChar(cm, x, y) {
    var doc = cm.doc;
    y += cm.display.viewOffset;
    if (y < 0) return PosWithInfo(doc.first, 0, true, -1);
    var lineN = lineAtHeight(doc, y), last = doc.first + doc.size - 1;
    if (lineN > last)
      return PosWithInfo(doc.first + doc.size - 1, getLine(doc, last).text.length, true, 1);
    if (x < 0) x = 0;

    var lineObj = getLine(doc, lineN);
    for (;;) {
      var found = coordsCharInner(cm, lineObj, lineN, x, y);
      var merged = collapsedSpanAtEnd(lineObj);
      var mergedPos = merged && merged.find(0, true);
      if (merged && (found.ch > mergedPos.from.ch || found.ch == mergedPos.from.ch && found.xRel > 0))
        lineN = lineNo(lineObj = mergedPos.to.line);
      else
        return found;
    }
  }

  function coordsCharInner(cm, lineObj, lineNo, x, y) {
    var innerOff = y - heightAtLine(lineObj);
    var wrongLine = false, adjust = 2 * cm.display.wrapper.clientWidth;
    var preparedMeasure = prepareMeasureForLine(cm, lineObj);

    function getX(ch) {
      var sp = cursorCoords(cm, Pos(lineNo, ch), "line", lineObj, preparedMeasure);
      wrongLine = true;
      if (innerOff > sp.bottom) return sp.left - adjust;
      else if (innerOff < sp.top) return sp.left + adjust;
      else wrongLine = false;
      return sp.left;
    }

    var bidi = getOrder(lineObj), dist = lineObj.text.length;
    var from = lineLeft(lineObj), to = lineRight(lineObj);
    var fromX = getX(from), fromOutside = wrongLine, toX = getX(to), toOutside = wrongLine;

    if (x > toX) return PosWithInfo(lineNo, to, toOutside, 1);
    // Do a binary search between these bounds.
    for (;;) {
      if (bidi ? to == from || to == moveVisually(lineObj, from, 1) : to - from <= 1) {
        var ch = x < fromX || x - fromX <= toX - x ? from : to;
        var xDiff = x - (ch == from ? fromX : toX);
        while (isExtendingChar(lineObj.text.charAt(ch))) ++ch;
        var pos = PosWithInfo(lineNo, ch, ch == from ? fromOutside : toOutside,
                              xDiff < -1 ? -1 : xDiff > 1 ? 1 : 0);
        return pos;
      }
      var step = Math.ceil(dist / 2), middle = from + step;
      if (bidi) {
        middle = from;
        for (var i = 0; i < step; ++i) middle = moveVisually(lineObj, middle, 1);
      }
      var middleX = getX(middle);
      if (middleX > x) {to = middle; toX = middleX; if (toOutside = wrongLine) toX += 1000; dist = step;}
      else {from = middle; fromX = middleX; fromOutside = wrongLine; dist -= step;}
    }
  }

  var measureText;
  // Compute the default text height.
  function textHeight(display) {
    if (display.cachedTextHeight != null) return display.cachedTextHeight;
    if (measureText == null) {
      measureText = elt("pre");
      // Measure a bunch of lines, for browsers that compute
      // fractional heights.
      for (var i = 0; i < 49; ++i) {
        measureText.appendChild(document.createTextNode("x"));
        measureText.appendChild(elt("br"));
      }
      measureText.appendChild(document.createTextNode("x"));
    }
    removeChildrenAndAdd(display.measure, measureText);
    var height = measureText.offsetHeight / 50;
    if (height > 3) display.cachedTextHeight = height;
    removeChildren(display.measure);
    return height || 1;
  }

  // Compute the default character width.
  function charWidth(display) {
    if (display.cachedCharWidth != null) return display.cachedCharWidth;
    var anchor = elt("span", "xxxxxxxxxx");
    var pre = elt("pre", [anchor]);
    removeChildrenAndAdd(display.measure, pre);
    var rect = anchor.getBoundingClientRect(), width = (rect.right - rect.left) / 10;
    if (width > 2) display.cachedCharWidth = width;
    return width || 10;
  }

  // OPERATIONS

  // Operations are used to wrap a series of changes to the editor
  // state in such a way that each change won't have to update the
  // cursor and display (which would be awkward, slow, and
  // error-prone). Instead, display updates are batched and then all
  // combined and executed at once.

  var operationGroup = null;

  var nextOpId = 0;
  // Start a new operation.
  function startOperation(cm) {
    cm.curOp = {
      cm: cm,
      viewChanged: false,      // Flag that indicates that lines might need to be redrawn
      startHeight: cm.doc.height, // Used to detect need to update scrollbar
      forceUpdate: false,      // Used to force a redraw
      updateInput: null,       // Whether to reset the input textarea
      typing: false,           // Whether this reset should be careful to leave existing text (for compositing)
      changeObjs: null,        // Accumulated changes, for firing change events
      cursorActivityHandlers: null, // Set of handlers to fire cursorActivity on
      cursorActivityCalled: 0, // Tracks which cursorActivity handlers have been called already
      selectionChanged: false, // Whether the selection needs to be redrawn
      updateMaxLine: false,    // Set when the widest line needs to be determined anew
      scrollLeft: null, scrollTop: null, // Intermediate scroll position, not pushed to DOM yet
      scrollToPos: null,       // Used to scroll to a specific position
      focus: false,
      id: ++nextOpId           // Unique ID
    };
    if (operationGroup) {
      operationGroup.ops.push(cm.curOp);
    } else {
      cm.curOp.ownsGroup = operationGroup = {
        ops: [cm.curOp],
        delayedCallbacks: []
      };
    }
  }

  function fireCallbacksForOps(group) {
    // Calls delayed callbacks and cursorActivity handlers until no
    // new ones appear
    var callbacks = group.delayedCallbacks, i = 0;
    do {
      for (; i < callbacks.length; i++)
        callbacks[i].call(null);
      for (var j = 0; j < group.ops.length; j++) {
        var op = group.ops[j];
        if (op.cursorActivityHandlers)
          while (op.cursorActivityCalled < op.cursorActivityHandlers.length)
            op.cursorActivityHandlers[op.cursorActivityCalled++].call(null, op.cm);
      }
    } while (i < callbacks.length);
  }

  // Finish an operation, updating the display and signalling delayed events
  function endOperation(cm) {
    var op = cm.curOp, group = op.ownsGroup;
    if (!group) return;

    try { fireCallbacksForOps(group); }
    finally {
      operationGroup = null;
      for (var i = 0; i < group.ops.length; i++)
        group.ops[i].cm.curOp = null;
      endOperations(group);
    }
  }

  // The DOM updates done when an operation finishes are batched so
  // that the minimum number of relayouts are required.
  function endOperations(group) {
    var ops = group.ops;
    for (var i = 0; i < ops.length; i++) // Read DOM
      endOperation_R1(ops[i]);
    for (var i = 0; i < ops.length; i++) // Write DOM (maybe)
      endOperation_W1(ops[i]);
    for (var i = 0; i < ops.length; i++) // Read DOM
      endOperation_R2(ops[i]);
    for (var i = 0; i < ops.length; i++) // Write DOM (maybe)
      endOperation_W2(ops[i]);
    for (var i = 0; i < ops.length; i++) // Read DOM
      endOperation_finish(ops[i]);
  }

  function endOperation_R1(op) {
    var cm = op.cm, display = cm.display;
    maybeClipScrollbars(cm);
    if (op.updateMaxLine) findMaxLine(cm);

    op.mustUpdate = op.viewChanged || op.forceUpdate || op.scrollTop != null ||
      op.scrollToPos && (op.scrollToPos.from.line < display.viewFrom ||
                         op.scrollToPos.to.line >= display.viewTo) ||
      display.maxLineChanged && cm.options.lineWrapping;
    op.update = op.mustUpdate &&
      new DisplayUpdate(cm, op.mustUpdate && {top: op.scrollTop, ensure: op.scrollToPos}, op.forceUpdate);
  }

  function endOperation_W1(op) {
    op.updatedDisplay = op.mustUpdate && updateDisplayIfNeeded(op.cm, op.update);
  }

  function endOperation_R2(op) {
    var cm = op.cm, display = cm.display;
    if (op.updatedDisplay) updateHeightsInViewport(cm);

    op.barMeasure = measureForScrollbars(cm);

    // If the max line changed since it was last measured, measure it,
    // and ensure the document's width matches it.
    // updateDisplay_W2 will use these properties to do the actual resizing
    if (display.maxLineChanged && !cm.options.lineWrapping) {
      op.adjustWidthTo = measureChar(cm, display.maxLine, display.maxLine.text.length).left + 3;
      cm.display.sizerWidth = op.adjustWidthTo;
      op.barMeasure.scrollWidth =
        Math.max(display.scroller.clientWidth, display.sizer.offsetLeft + op.adjustWidthTo + scrollGap(cm) + cm.display.barWidth);
      op.maxScrollLeft = Math.max(0, display.sizer.offsetLeft + op.adjustWidthTo - displayWidth(cm));
    }

    if (op.updatedDisplay || op.selectionChanged)
      op.preparedSelection = display.input.prepareSelection();
  }

  function endOperation_W2(op) {
    var cm = op.cm;

    if (op.adjustWidthTo != null) {
      cm.display.sizer.style.minWidth = op.adjustWidthTo + "px";
      if (op.maxScrollLeft < cm.doc.scrollLeft)
        setScrollLeft(cm, Math.min(cm.display.scroller.scrollLeft, op.maxScrollLeft), true);
      cm.display.maxLineChanged = false;
    }

    if (op.preparedSelection)
      cm.display.input.showSelection(op.preparedSelection);
    if (op.updatedDisplay)
      setDocumentHeight(cm, op.barMeasure);
    if (op.updatedDisplay || op.startHeight != cm.doc.height)
      updateScrollbars(cm, op.barMeasure);

    if (op.selectionChanged) restartBlink(cm);

    if (cm.state.focused && op.updateInput)
      cm.display.input.reset(op.typing);
    if (op.focus && op.focus == activeElt() && (!document.hasFocus || document.hasFocus()))
      ensureFocus(op.cm);
  }

  function endOperation_finish(op) {
    var cm = op.cm, display = cm.display, doc = cm.doc;

    if (op.updatedDisplay) postUpdateDisplay(cm, op.update);

    // Abort mouse wheel delta measurement, when scrolling explicitly
    if (display.wheelStartX != null && (op.scrollTop != null || op.scrollLeft != null || op.scrollToPos))
      display.wheelStartX = display.wheelStartY = null;

    // Propagate the scroll position to the actual DOM scroller
    if (op.scrollTop != null && (display.scroller.scrollTop != op.scrollTop || op.forceScroll)) {
      doc.scrollTop = Math.max(0, Math.min(display.scroller.scrollHeight - display.scroller.clientHeight, op.scrollTop));
      display.scrollbars.setScrollTop(doc.scrollTop);
      display.scroller.scrollTop = doc.scrollTop;
    }
    if (op.scrollLeft != null && (display.scroller.scrollLeft != op.scrollLeft || op.forceScroll)) {
      doc.scrollLeft = Math.max(0, Math.min(display.scroller.scrollWidth - displayWidth(cm), op.scrollLeft));
      display.scrollbars.setScrollLeft(doc.scrollLeft);
      display.scroller.scrollLeft = doc.scrollLeft;
      alignHorizontally(cm);
    }
    // If we need to scroll a specific position into view, do so.
    if (op.scrollToPos) {
      var coords = scrollPosIntoView(cm, clipPos(doc, op.scrollToPos.from),
                                     clipPos(doc, op.scrollToPos.to), op.scrollToPos.margin);
      if (op.scrollToPos.isCursor && cm.state.focused) maybeScrollWindow(cm, coords);
    }

    // Fire events for markers that are hidden/unidden by editing or
    // undoing
    var hidden = op.maybeHiddenMarkers, unhidden = op.maybeUnhiddenMarkers;
    if (hidden) for (var i = 0; i < hidden.length; ++i)
      if (!hidden[i].lines.length) signal(hidden[i], "hide");
    if (unhidden) for (var i = 0; i < unhidden.length; ++i)
      if (unhidden[i].lines.length) signal(unhidden[i], "unhide");

    if (display.wrapper.offsetHeight)
      doc.scrollTop = cm.display.scroller.scrollTop;

    // Fire change events, and delayed event handlers
    if (op.changeObjs)
      signal(cm, "changes", cm, op.changeObjs);
    if (op.update)
      op.update.finish();
  }

  // Run the given function in an operation
  function runInOp(cm, f) {
    if (cm.curOp) return f();
    startOperation(cm);
    try { return f(); }
    finally { endOperation(cm); }
  }
  // Wraps a function in an operation. Returns the wrapped function.
  function operation(cm, f) {
    return function() {
      if (cm.curOp) return f.apply(cm, arguments);
      startOperation(cm);
      try { return f.apply(cm, arguments); }
      finally { endOperation(cm); }
    };
  }
  // Used to add methods to editor and doc instances, wrapping them in
  // operations.
  function methodOp(f) {
    return function() {
      if (this.curOp) return f.apply(this, arguments);
      startOperation(this);
      try { return f.apply(this, arguments); }
      finally { endOperation(this); }
    };
  }
  function docMethodOp(f) {
    return function() {
      var cm = this.cm;
      if (!cm || cm.curOp) return f.apply(this, arguments);
      startOperation(cm);
      try { return f.apply(this, arguments); }
      finally { endOperation(cm); }
    };
  }

  // VIEW TRACKING

  // These objects are used to represent the visible (currently drawn)
  // part of the document. A LineView may correspond to multiple
  // logical lines, if those are connected by collapsed ranges.
  function LineView(doc, line, lineN) {
    // The starting line
    this.line = line;
    // Continuing lines, if any
    this.rest = visualLineContinued(line);
    // Number of logical lines in this visual line
    this.size = this.rest ? lineNo(lst(this.rest)) - lineN + 1 : 1;
    this.node = this.text = null;
    this.hidden = lineIsHidden(doc, line);
  }

  // Create a range of LineView objects for the given lines.
  function buildViewArray(cm, from, to) {
    var array = [], nextPos;
    for (var pos = from; pos < to; pos = nextPos) {
      var view = new LineView(cm.doc, getLine(cm.doc, pos), pos);
      nextPos = pos + view.size;
      array.push(view);
    }
    return array;
  }

  // Updates the display.view data structure for a given change to the
  // document. From and to are in pre-change coordinates. Lendiff is
  // the amount of lines added or subtracted by the change. This is
  // used for changes that span multiple lines, or change the way
  // lines are divided into visual lines. regLineChange (below)
  // registers single-line changes.
  function regChange(cm, from, to, lendiff) {
    if (from == null) from = cm.doc.first;
    if (to == null) to = cm.doc.first + cm.doc.size;
    if (!lendiff) lendiff = 0;

    var display = cm.display;
    if (lendiff && to < display.viewTo &&
        (display.updateLineNumbers == null || display.updateLineNumbers > from))
      display.updateLineNumbers = from;

    cm.curOp.viewChanged = true;

    if (from >= display.viewTo) { // Change after
      if (sawCollapsedSpans && visualLineNo(cm.doc, from) < display.viewTo)
        resetView(cm);
    } else if (to <= display.viewFrom) { // Change before
      if (sawCollapsedSpans && visualLineEndNo(cm.doc, to + lendiff) > display.viewFrom) {
        resetView(cm);
      } else {
        display.viewFrom += lendiff;
        display.viewTo += lendiff;
      }
    } else if (from <= display.viewFrom && to >= display.viewTo) { // Full overlap
      resetView(cm);
    } else if (from <= display.viewFrom) { // Top overlap
      var cut = viewCuttingPoint(cm, to, to + lendiff, 1);
      if (cut) {
        display.view = display.view.slice(cut.index);
        display.viewFrom = cut.lineN;
        display.viewTo += lendiff;
      } else {
        resetView(cm);
      }
    } else if (to >= display.viewTo) { // Bottom overlap
      var cut = viewCuttingPoint(cm, from, from, -1);
      if (cut) {
        display.view = display.view.slice(0, cut.index);
        display.viewTo = cut.lineN;
      } else {
        resetView(cm);
      }
    } else { // Gap in the middle
      var cutTop = viewCuttingPoint(cm, from, from, -1);
      var cutBot = viewCuttingPoint(cm, to, to + lendiff, 1);
      if (cutTop && cutBot) {
        display.view = display.view.slice(0, cutTop.index)
          .concat(buildViewArray(cm, cutTop.lineN, cutBot.lineN))
          .concat(display.view.slice(cutBot.index));
        display.viewTo += lendiff;
      } else {
        resetView(cm);
      }
    }

    var ext = display.externalMeasured;
    if (ext) {
      if (to < ext.lineN)
        ext.lineN += lendiff;
      else if (from < ext.lineN + ext.size)
        display.externalMeasured = null;
    }
  }

  // Register a change to a single line. Type must be one of "text",
  // "gutter", "class", "widget"
  function regLineChange(cm, line, type) {
    cm.curOp.viewChanged = true;
    var display = cm.display, ext = cm.display.externalMeasured;
    if (ext && line >= ext.lineN && line < ext.lineN + ext.size)
      display.externalMeasured = null;

    if (line < display.viewFrom || line >= display.viewTo) return;
    var lineView = display.view[findViewIndex(cm, line)];
    if (lineView.node == null) return;
    var arr = lineView.changes || (lineView.changes = []);
    if (indexOf(arr, type) == -1) arr.push(type);
  }

  // Clear the view.
  function resetView(cm) {
    cm.display.viewFrom = cm.display.viewTo = cm.doc.first;
    cm.display.view = [];
    cm.display.viewOffset = 0;
  }

  // Find the view element corresponding to a given line. Return null
  // when the line isn't visible.
  function findViewIndex(cm, n) {
    if (n >= cm.display.viewTo) return null;
    n -= cm.display.viewFrom;
    if (n < 0) return null;
    var view = cm.display.view;
    for (var i = 0; i < view.length; i++) {
      n -= view[i].size;
      if (n < 0) return i;
    }
  }

  function viewCuttingPoint(cm, oldN, newN, dir) {
    var index = findViewIndex(cm, oldN), diff, view = cm.display.view;
    if (!sawCollapsedSpans || newN == cm.doc.first + cm.doc.size)
      return {index: index, lineN: newN};
    for (var i = 0, n = cm.display.viewFrom; i < index; i++)
      n += view[i].size;
    if (n != oldN) {
      if (dir > 0) {
        if (index == view.length - 1) return null;
        diff = (n + view[index].size) - oldN;
        index++;
      } else {
        diff = n - oldN;
      }
      oldN += diff; newN += diff;
    }
    while (visualLineNo(cm.doc, newN) != newN) {
      if (index == (dir < 0 ? 0 : view.length - 1)) return null;
      newN += dir * view[index - (dir < 0 ? 1 : 0)].size;
      index += dir;
    }
    return {index: index, lineN: newN};
  }

  // Force the view to cover a given range, adding empty view element
  // or clipping off existing ones as needed.
  function adjustView(cm, from, to) {
    var display = cm.display, view = display.view;
    if (view.length == 0 || from >= display.viewTo || to <= display.viewFrom) {
      display.view = buildViewArray(cm, from, to);
      display.viewFrom = from;
    } else {
      if (display.viewFrom > from)
        display.view = buildViewArray(cm, from, display.viewFrom).concat(display.view);
      else if (display.viewFrom < from)
        display.view = display.view.slice(findViewIndex(cm, from));
      display.viewFrom = from;
      if (display.viewTo < to)
        display.view = display.view.concat(buildViewArray(cm, display.viewTo, to));
      else if (display.viewTo > to)
        display.view = display.view.slice(0, findViewIndex(cm, to));
    }
    display.viewTo = to;
  }

  // Count the number of lines in the view whose DOM representation is
  // out of date (or nonexistent).
  function countDirtyView(cm) {
    var view = cm.display.view, dirty = 0;
    for (var i = 0; i < view.length; i++) {
      var lineView = view[i];
      if (!lineView.hidden && (!lineView.node || lineView.changes)) ++dirty;
    }
    return dirty;
  }

  // EVENT HANDLERS

  // Attach the necessary event handlers when initializing the editor
  function registerEventHandlers(cm) {
    var d = cm.display;
    on(d.scroller, "mousedown", operation(cm, onMouseDown));
    // Older IE's will not fire a second mousedown for a double click
    if (ie && ie_version < 11)
      on(d.scroller, "dblclick", operation(cm, function(e) {
        if (signalDOMEvent(cm, e)) return;
        var pos = posFromMouse(cm, e);
        if (!pos || clickInGutter(cm, e) || eventInWidget(cm.display, e)) return;
        e_preventDefault(e);
        var word = cm.findWordAt(pos);
        extendSelection(cm.doc, word.anchor, word.head);
      }));
    else
      on(d.scroller, "dblclick", function(e) { signalDOMEvent(cm, e) || e_preventDefault(e); });
    // Some browsers fire contextmenu *after* opening the menu, at
    // which point we can't mess with it anymore. Context menu is
    // handled in onMouseDown for these browsers.
    if (!captureRightClick) on(d.scroller, "contextmenu", function(e) {onContextMenu(cm, e);});

    // Used to suppress mouse event handling when a touch happens
    var touchFinished, prevTouch = {end: 0};
    function finishTouch() {
      if (d.activeTouch) {
        touchFinished = setTimeout(function() {d.activeTouch = null;}, 1000);
        prevTouch = d.activeTouch;
        prevTouch.end = +new Date;
      }
    };
    function isMouseLikeTouchEvent(e) {
      if (e.touches.length != 1) return false;
      var touch = e.touches[0];
      return touch.radiusX <= 1 && touch.radiusY <= 1;
    }
    function farAway(touch, other) {
      if (other.left == null) return true;
      var dx = other.left - touch.left, dy = other.top - touch.top;
      return dx * dx + dy * dy > 20 * 20;
    }
    on(d.scroller, "touchstart", function(e) {
      if (!isMouseLikeTouchEvent(e)) {
        clearTimeout(touchFinished);
        var now = +new Date;
        d.activeTouch = {start: now, moved: false,
                         prev: now - prevTouch.end <= 300 ? prevTouch : null};
        if (e.touches.length == 1) {
          d.activeTouch.left = e.touches[0].pageX;
          d.activeTouch.top = e.touches[0].pageY;
        }
      }
    });
    on(d.scroller, "touchmove", function() {
      if (d.activeTouch) d.activeTouch.moved = true;
    });
    on(d.scroller, "touchend", function(e) {
      var touch = d.activeTouch;
      if (touch && !eventInWidget(d, e) && touch.left != null &&
          !touch.moved && new Date - touch.start < 300) {
        var pos = cm.coordsChar(d.activeTouch, "page"), range;
        if (!touch.prev || farAway(touch, touch.prev)) // Single tap
          range = new Range(pos, pos);
        else if (!touch.prev.prev || farAway(touch, touch.prev.prev)) // Double tap
          range = cm.findWordAt(pos);
        else // Triple tap
          range = new Range(Pos(pos.line, 0), clipPos(cm.doc, Pos(pos.line + 1, 0)));
        cm.setSelection(range.anchor, range.head);
        cm.focus();
        e_preventDefault(e);
      }
      finishTouch();
    });
    on(d.scroller, "touchcancel", finishTouch);

    // Sync scrolling between fake scrollbars and real scrollable
    // area, ensure viewport is updated when scrolling.
    on(d.scroller, "scroll", function() {
      if (d.scroller.clientHeight) {
        setScrollTop(cm, d.scroller.scrollTop);
        setScrollLeft(cm, d.scroller.scrollLeft, true);
        signal(cm, "scroll", cm);
      }
    });

    // Listen to wheel events in order to try and update the viewport on time.
    on(d.scroller, "mousewheel", function(e){onScrollWheel(cm, e);});
    on(d.scroller, "DOMMouseScroll", function(e){onScrollWheel(cm, e);});

    // Prevent wrapper from ever scrolling
    on(d.wrapper, "scroll", function() { d.wrapper.scrollTop = d.wrapper.scrollLeft = 0; });

    d.dragFunctions = {
      enter: function(e) {if (!signalDOMEvent(cm, e)) e_stop(e);},
      over: function(e) {if (!signalDOMEvent(cm, e)) { onDragOver(cm, e); e_stop(e); }},
      start: function(e){onDragStart(cm, e);},
      drop: operation(cm, onDrop),
      leave: function() {clearDragCursor(cm);}
    };

    var inp = d.input.getField();
    on(inp, "keyup", function(e) { onKeyUp.call(cm, e); });
    on(inp, "keydown", operation(cm, onKeyDown));
    on(inp, "keypress", operation(cm, onKeyPress));
    on(inp, "focus", bind(onFocus, cm));
    on(inp, "blur", bind(onBlur, cm));
  }

  function dragDropChanged(cm, value, old) {
    var wasOn = old && old != CodeMirror.Init;
    if (!value != !wasOn) {
      var funcs = cm.display.dragFunctions;
      var toggle = value ? on : off;
      toggle(cm.display.scroller, "dragstart", funcs.start);
      toggle(cm.display.scroller, "dragenter", funcs.enter);
      toggle(cm.display.scroller, "dragover", funcs.over);
      toggle(cm.display.scroller, "dragleave", funcs.leave);
      toggle(cm.display.scroller, "drop", funcs.drop);
    }
  }

  // Called when the window resizes
  function onResize(cm) {
    var d = cm.display;
    if (d.lastWrapHeight == d.wrapper.clientHeight && d.lastWrapWidth == d.wrapper.clientWidth)
      return;
    // Might be a text scaling operation, clear size caches.
    d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;
    d.scrollbarsClipped = false;
    cm.setSize();
  }

  // MOUSE EVENTS

  // Return true when the given mouse event happened in a widget
  function eventInWidget(display, e) {
    for (var n = e_target(e); n != display.wrapper; n = n.parentNode) {
      if (!n || (n.nodeType == 1 && n.getAttribute("cm-ignore-events") == "true") ||
          (n.parentNode == display.sizer && n != display.mover))
        return true;
    }
  }

  // Given a mouse event, find the corresponding position. If liberal
  // is false, it checks whether a gutter or scrollbar was clicked,
  // and returns null if it was. forRect is used by rectangular
  // selections, and tries to estimate a character position even for
  // coordinates beyond the right of the text.
  function posFromMouse(cm, e, liberal, forRect) {
    var display = cm.display;
    if (!liberal && e_target(e).getAttribute("cm-not-content") == "true") return null;

    var x, y, space = display.lineSpace.getBoundingClientRect();
    // Fails unpredictably on IE[67] when mouse is dragged around quickly.
    try { x = e.clientX - space.left; y = e.clientY - space.top; }
    catch (e) { return null; }
    var coords = coordsChar(cm, x, y), line;
    if (forRect && coords.xRel == 1 && (line = getLine(cm.doc, coords.line).text).length == coords.ch) {
      var colDiff = countColumn(line, line.length, cm.options.tabSize) - line.length;
      coords = Pos(coords.line, Math.max(0, Math.round((x - paddingH(cm.display).left) / charWidth(cm.display)) - colDiff));
    }
    return coords;
  }

  // A mouse down can be a single click, double click, triple click,
  // start of selection drag, start of text drag, new cursor
  // (ctrl-click), rectangle drag (alt-drag), or xwin
  // middle-click-paste. Or it might be a click on something we should
  // not interfere with, such as a scrollbar or widget.
  function onMouseDown(e) {
    var cm = this, display = cm.display;
    if (display.activeTouch && display.input.supportsTouch() || signalDOMEvent(cm, e)) return;
    display.shift = e.shiftKey;

    if (eventInWidget(display, e)) {
      if (!webkit) {
        // Briefly turn off draggability, to allow widgets to do
        // normal dragging things.
        display.scroller.draggable = false;
        setTimeout(function(){display.scroller.draggable = true;}, 100);
      }
      return;
    }
    if (clickInGutter(cm, e)) return;
    var start = posFromMouse(cm, e);
    window.focus();

    switch (e_button(e)) {
    case 1:
      // #3261: make sure, that we're not starting a second selection
      if (cm.state.selectingText)
        cm.state.selectingText(e);
      else if (start)
        leftButtonDown(cm, e, start);
      else if (e_target(e) == display.scroller)
        e_preventDefault(e);
      break;
    case 2:
      if (webkit) cm.state.lastMiddleDown = +new Date;
      if (start) extendSelection(cm.doc, start);
      setTimeout(function() {display.input.focus();}, 20);
      e_preventDefault(e);
      break;
    case 3:
      if (captureRightClick) onContextMenu(cm, e);
      else delayBlurEvent(cm);
      break;
    }
  }

  var lastClick, lastDoubleClick;
  function leftButtonDown(cm, e, start) {
    if (ie) setTimeout(bind(ensureFocus, cm), 0);
    else cm.curOp.focus = activeElt();

    var now = +new Date, type;
    if (lastDoubleClick && lastDoubleClick.time > now - 400 && cmp(lastDoubleClick.pos, start) == 0) {
      type = "triple";
    } else if (lastClick && lastClick.time > now - 400 && cmp(lastClick.pos, start) == 0) {
      type = "double";
      lastDoubleClick = {time: now, pos: start};
    } else {
      type = "single";
      lastClick = {time: now, pos: start};
    }

    var sel = cm.doc.sel, modifier = mac ? e.metaKey : e.ctrlKey, contained;
    if (cm.options.dragDrop && dragAndDrop && !cm.isReadOnly() &&
        type == "single" && (contained = sel.contains(start)) > -1 &&
        (cmp((contained = sel.ranges[contained]).from(), start) < 0 || start.xRel > 0) &&
        (cmp(contained.to(), start) > 0 || start.xRel < 0))
      leftButtonStartDrag(cm, e, start, modifier);
    else
      leftButtonSelect(cm, e, start, type, modifier);
  }

  // Start a text drag. When it ends, see if any dragging actually
  // happen, and treat as a click if it didn't.
  function leftButtonStartDrag(cm, e, start, modifier) {
    var display = cm.display, startTime = +new Date;
    var dragEnd = operation(cm, function(e2) {
      if (webkit) display.scroller.draggable = false;
      cm.state.draggingText = false;
      off(document, "mouseup", dragEnd);
      off(display.scroller, "drop", dragEnd);
      if (Math.abs(e.clientX - e2.clientX) + Math.abs(e.clientY - e2.clientY) < 10) {
        e_preventDefault(e2);
        if (!modifier && +new Date - 200 < startTime)
          extendSelection(cm.doc, start);
        // Work around unexplainable focus problem in IE9 (#2127) and Chrome (#3081)
        if (webkit || ie && ie_version == 9)
          setTimeout(function() {document.body.focus(); display.input.focus();}, 20);
        else
          display.input.focus();
      }
    });
    // Let the drag handler handle this.
    if (webkit) display.scroller.draggable = true;
    cm.state.draggingText = dragEnd;
    // IE's approach to draggable
    if (display.scroller.dragDrop) display.scroller.dragDrop();
    on(document, "mouseup", dragEnd);
    on(display.scroller, "drop", dragEnd);
  }

  // Normal selection, as opposed to text dragging.
  function leftButtonSelect(cm, e, start, type, addNew) {
    var display = cm.display, doc = cm.doc;
    e_preventDefault(e);

    var ourRange, ourIndex, startSel = doc.sel, ranges = startSel.ranges;
    if (addNew && !e.shiftKey) {
      ourIndex = doc.sel.contains(start);
      if (ourIndex > -1)
        ourRange = ranges[ourIndex];
      else
        ourRange = new Range(start, start);
    } else {
      ourRange = doc.sel.primary();
      ourIndex = doc.sel.primIndex;
    }

    if (e.altKey) {
      type = "rect";
      if (!addNew) ourRange = new Range(start, start);
      start = posFromMouse(cm, e, true, true);
      ourIndex = -1;
    } else if (type == "double") {
      var word = cm.findWordAt(start);
      if (cm.display.shift || doc.extend)
        ourRange = extendRange(doc, ourRange, word.anchor, word.head);
      else
        ourRange = word;
    } else if (type == "triple") {
      var line = new Range(Pos(start.line, 0), clipPos(doc, Pos(start.line + 1, 0)));
      if (cm.display.shift || doc.extend)
        ourRange = extendRange(doc, ourRange, line.anchor, line.head);
      else
        ourRange = line;
    } else {
      ourRange = extendRange(doc, ourRange, start);
    }

    if (!addNew) {
      ourIndex = 0;
      setSelection(doc, new Selection([ourRange], 0), sel_mouse);
      startSel = doc.sel;
    } else if (ourIndex == -1) {
      ourIndex = ranges.length;
      setSelection(doc, normalizeSelection(ranges.concat([ourRange]), ourIndex),
                   {scroll: false, origin: "*mouse"});
    } else if (ranges.length > 1 && ranges[ourIndex].empty() && type == "single" && !e.shiftKey) {
      setSelection(doc, normalizeSelection(ranges.slice(0, ourIndex).concat(ranges.slice(ourIndex + 1)), 0),
                   {scroll: false, origin: "*mouse"});
      startSel = doc.sel;
    } else {
      replaceOneSelection(doc, ourIndex, ourRange, sel_mouse);
    }

    var lastPos = start;
    function extendTo(pos) {
      if (cmp(lastPos, pos) == 0) return;
      lastPos = pos;

      if (type == "rect") {
        var ranges = [], tabSize = cm.options.tabSize;
        var startCol = countColumn(getLine(doc, start.line).text, start.ch, tabSize);
        var posCol = countColumn(getLine(doc, pos.line).text, pos.ch, tabSize);
        var left = Math.min(startCol, posCol), right = Math.max(startCol, posCol);
        for (var line = Math.min(start.line, pos.line), end = Math.min(cm.lastLine(), Math.max(start.line, pos.line));
             line <= end; line++) {
          var text = getLine(doc, line).text, leftPos = findColumn(text, left, tabSize);
          if (left == right)
            ranges.push(new Range(Pos(line, leftPos), Pos(line, leftPos)));
          else if (text.length > leftPos)
            ranges.push(new Range(Pos(line, leftPos), Pos(line, findColumn(text, right, tabSize))));
        }
        if (!ranges.length) ranges.push(new Range(start, start));
        setSelection(doc, normalizeSelection(startSel.ranges.slice(0, ourIndex).concat(ranges), ourIndex),
                     {origin: "*mouse", scroll: false});
        cm.scrollIntoView(pos);
      } else {
        var oldRange = ourRange;
        var anchor = oldRange.anchor, head = pos;
        if (type != "single") {
          if (type == "double")
            var range = cm.findWordAt(pos);
          else
            var range = new Range(Pos(pos.line, 0), clipPos(doc, Pos(pos.line + 1, 0)));
          if (cmp(range.anchor, anchor) > 0) {
            head = range.head;
            anchor = minPos(oldRange.from(), range.anchor);
          } else {
            head = range.anchor;
            anchor = maxPos(oldRange.to(), range.head);
          }
        }
        var ranges = startSel.ranges.slice(0);
        ranges[ourIndex] = new Range(clipPos(doc, anchor), head);
        setSelection(doc, normalizeSelection(ranges, ourIndex), sel_mouse);
      }
    }

    var editorSize = display.wrapper.getBoundingClientRect();
    // Used to ensure timeout re-tries don't fire when another extend
    // happened in the meantime (clearTimeout isn't reliable -- at
    // least on Chrome, the timeouts still happen even when cleared,
    // if the clear happens after their scheduled firing time).
    var counter = 0;

    function extend(e) {
      var curCount = ++counter;
      var cur = posFromMouse(cm, e, true, type == "rect");
      if (!cur) return;
      if (cmp(cur, lastPos) != 0) {
        cm.curOp.focus = activeElt();
        extendTo(cur);
        var visible = visibleLines(display, doc);
        if (cur.line >= visible.to || cur.line < visible.from)
          setTimeout(operation(cm, function(){if (counter == curCount) extend(e);}), 150);
      } else {
        var outside = e.clientY < editorSize.top ? -20 : e.clientY > editorSize.bottom ? 20 : 0;
        if (outside) setTimeout(operation(cm, function() {
          if (counter != curCount) return;
          display.scroller.scrollTop += outside;
          extend(e);
        }), 50);
      }
    }

    function done(e) {
      cm.state.selectingText = false;
      counter = Infinity;
      e_preventDefault(e);
      display.input.focus();
      off(document, "mousemove", move);
      off(document, "mouseup", up);
      doc.history.lastSelOrigin = null;
    }

    var move = operation(cm, function(e) {
      if (!e_button(e)) done(e);
      else extend(e);
    });
    var up = operation(cm, done);
    cm.state.selectingText = up;
    on(document, "mousemove", move);
    on(document, "mouseup", up);
  }

  // Determines whether an event happened in the gutter, and fires the
  // handlers for the corresponding event.
  function gutterEvent(cm, e, type, prevent) {
    try { var mX = e.clientX, mY = e.clientY; }
    catch(e) { return false; }
    if (mX >= Math.floor(cm.display.gutters.getBoundingClientRect().right)) return false;
    if (prevent) e_preventDefault(e);

    var display = cm.display;
    var lineBox = display.lineDiv.getBoundingClientRect();

    if (mY > lineBox.bottom || !hasHandler(cm, type)) return e_defaultPrevented(e);
    mY -= lineBox.top - display.viewOffset;

    for (var i = 0; i < cm.options.gutters.length; ++i) {
      var g = display.gutters.childNodes[i];
      if (g && g.getBoundingClientRect().right >= mX) {
        var line = lineAtHeight(cm.doc, mY);
        var gutter = cm.options.gutters[i];
        signal(cm, type, cm, line, gutter, e);
        return e_defaultPrevented(e);
      }
    }
  }

  function clickInGutter(cm, e) {
    return gutterEvent(cm, e, "gutterClick", true);
  }

  // Kludge to work around strange IE behavior where it'll sometimes
  // re-fire a series of drag-related events right after the drop (#1551)
  var lastDrop = 0;

  function onDrop(e) {
    var cm = this;
    clearDragCursor(cm);
    if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e))
      return;
    e_preventDefault(e);
    if (ie) lastDrop = +new Date;
    var pos = posFromMouse(cm, e, true), files = e.dataTransfer.files;
    if (!pos || cm.isReadOnly()) return;
    // Might be a file drop, in which case we simply extract the text
    // and insert it.
    if (files && files.length && window.FileReader && window.File) {
      var n = files.length, text = Array(n), read = 0;
      var loadFile = function(file, i) {
        if (cm.options.allowDropFileTypes &&
            indexOf(cm.options.allowDropFileTypes, file.type) == -1)
          return;

        var reader = new FileReader;
        reader.onload = operation(cm, function() {
          var content = reader.result;
          if (/[\x00-\x08\x0e-\x1f]{2}/.test(content)) content = "";
          text[i] = content;
          if (++read == n) {
            pos = clipPos(cm.doc, pos);
            var change = {from: pos, to: pos,
                          text: cm.doc.splitLines(text.join(cm.doc.lineSeparator())),
                          origin: "paste"};
            makeChange(cm.doc, change);
            setSelectionReplaceHistory(cm.doc, simpleSelection(pos, changeEnd(change)));
          }
        });
        reader.readAsText(file);
      };
      for (var i = 0; i < n; ++i) loadFile(files[i], i);
    } else { // Normal drop
      // Don't do a replace if the drop happened inside of the selected text.
      if (cm.state.draggingText && cm.doc.sel.contains(pos) > -1) {
        cm.state.draggingText(e);
        // Ensure the editor is re-focused
        setTimeout(function() {cm.display.input.focus();}, 20);
        return;
      }
      try {
        var text = e.dataTransfer.getData("Text");
        if (text) {
          if (cm.state.draggingText && !(mac ? e.altKey : e.ctrlKey))
            var selected = cm.listSelections();
          setSelectionNoUndo(cm.doc, simpleSelection(pos, pos));
          if (selected) for (var i = 0; i < selected.length; ++i)
            replaceRange(cm.doc, "", selected[i].anchor, selected[i].head, "drag");
          cm.replaceSelection(text, "around", "paste");
          cm.display.input.focus();
        }
      }
      catch(e){}
    }
  }

  function onDragStart(cm, e) {
    if (ie && (!cm.state.draggingText || +new Date - lastDrop < 100)) { e_stop(e); return; }
    if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e)) return;

    e.dataTransfer.setData("Text", cm.getSelection());

    // Use dummy image instead of default browsers image.
    // Recent Safari (~6.0.2) have a tendency to segfault when this happens, so we don't do it there.
    if (e.dataTransfer.setDragImage && !safari) {
      var img = elt("img", null, null, "position: fixed; left: 0; top: 0;");
      img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
      if (presto) {
        img.width = img.height = 1;
        cm.display.wrapper.appendChild(img);
        // Force a relayout, or Opera won't use our image for some obscure reason
        img._top = img.offsetTop;
      }
      e.dataTransfer.setDragImage(img, 0, 0);
      if (presto) img.parentNode.removeChild(img);
    }
  }

  function onDragOver(cm, e) {
    var pos = posFromMouse(cm, e);
    if (!pos) return;
    var frag = document.createDocumentFragment();
    drawSelectionCursor(cm, pos, frag);
    if (!cm.display.dragCursor) {
      cm.display.dragCursor = elt("div", null, "CodeMirror-cursors CodeMirror-dragcursors");
      cm.display.lineSpace.insertBefore(cm.display.dragCursor, cm.display.cursorDiv);
    }
    removeChildrenAndAdd(cm.display.dragCursor, frag);
  }

  function clearDragCursor(cm) {
    if (cm.display.dragCursor) {
      cm.display.lineSpace.removeChild(cm.display.dragCursor);
      cm.display.dragCursor = null;
    }
  }

  // SCROLL EVENTS

  // Sync the scrollable area and scrollbars, ensure the viewport
  // covers the visible area.
  function setScrollTop(cm, val) {
    if (Math.abs(cm.doc.scrollTop - val) < 2) return;
    cm.doc.scrollTop = val;
    if (!gecko) updateDisplaySimple(cm, {top: val});
    if (cm.display.scroller.scrollTop != val) cm.display.scroller.scrollTop = val;
    cm.display.scrollbars.setScrollTop(val);
    if (gecko) updateDisplaySimple(cm);
    startWorker(cm, 100);
  }
  // Sync scroller and scrollbar, ensure the gutter elements are
  // aligned.
  function setScrollLeft(cm, val, isScroller) {
    if (isScroller ? val == cm.doc.scrollLeft : Math.abs(cm.doc.scrollLeft - val) < 2) return;
    val = Math.min(val, cm.display.scroller.scrollWidth - cm.display.scroller.clientWidth);
    cm.doc.scrollLeft = val;
    alignHorizontally(cm);
    if (cm.display.scroller.scrollLeft != val) cm.display.scroller.scrollLeft = val;
    cm.display.scrollbars.setScrollLeft(val);
  }

  // Since the delta values reported on mouse wheel events are
  // unstandardized between browsers and even browser versions, and
  // generally horribly unpredictable, this code starts by measuring
  // the scroll effect that the first few mouse wheel events have,
  // and, from that, detects the way it can convert deltas to pixel
  // offsets afterwards.
  //
  // The reason we want to know the amount a wheel event will scroll
  // is that it gives us a chance to update the display before the
  // actual scrolling happens, reducing flickering.

  var wheelSamples = 0, wheelPixelsPerUnit = null;
  // Fill in a browser-detected starting value on browsers where we
  // know one. These don't have to be accurate -- the result of them
  // being wrong would just be a slight flicker on the first wheel
  // scroll (if it is large enough).
  if (ie) wheelPixelsPerUnit = -.53;
  else if (gecko) wheelPixelsPerUnit = 15;
  else if (chrome) wheelPixelsPerUnit = -.7;
  else if (safari) wheelPixelsPerUnit = -1/3;

  var wheelEventDelta = function(e) {
    var dx = e.wheelDeltaX, dy = e.wheelDeltaY;
    if (dx == null && e.detail && e.axis == e.HORIZONTAL_AXIS) dx = e.detail;
    if (dy == null && e.detail && e.axis == e.VERTICAL_AXIS) dy = e.detail;
    else if (dy == null) dy = e.wheelDelta;
    return {x: dx, y: dy};
  };
  CodeMirror.wheelEventPixels = function(e) {
    var delta = wheelEventDelta(e);
    delta.x *= wheelPixelsPerUnit;
    delta.y *= wheelPixelsPerUnit;
    return delta;
  };

  function onScrollWheel(cm, e) {
    var delta = wheelEventDelta(e), dx = delta.x, dy = delta.y;

    var display = cm.display, scroll = display.scroller;
    // Quit if there's nothing to scroll here
    var canScrollX = scroll.scrollWidth > scroll.clientWidth;
    var canScrollY = scroll.scrollHeight > scroll.clientHeight;
    if (!(dx && canScrollX || dy && canScrollY)) return;

    // Webkit browsers on OS X abort momentum scrolls when the target
    // of the scroll event is removed from the scrollable element.
    // This hack (see related code in patchDisplay) makes sure the
    // element is kept around.
    if (dy && mac && webkit) {
      outer: for (var cur = e.target, view = display.view; cur != scroll; cur = cur.parentNode) {
        for (var i = 0; i < view.length; i++) {
          if (view[i].node == cur) {
            cm.display.currentWheelTarget = cur;
            break outer;
          }
        }
      }
    }

    // On some browsers, horizontal scrolling will cause redraws to
    // happen before the gutter has been realigned, causing it to
    // wriggle around in a most unseemly way. When we have an
    // estimated pixels/delta value, we just handle horizontal
    // scrolling entirely here. It'll be slightly off from native, but
    // better than glitching out.
    if (dx && !gecko && !presto && wheelPixelsPerUnit != null) {
      if (dy && canScrollY)
        setScrollTop(cm, Math.max(0, Math.min(scroll.scrollTop + dy * wheelPixelsPerUnit, scroll.scrollHeight - scroll.clientHeight)));
      setScrollLeft(cm, Math.max(0, Math.min(scroll.scrollLeft + dx * wheelPixelsPerUnit, scroll.scrollWidth - scroll.clientWidth)));
      // Only prevent default scrolling if vertical scrolling is
      // actually possible. Otherwise, it causes vertical scroll
      // jitter on OSX trackpads when deltaX is small and deltaY
      // is large (issue #3579)
      if (!dy || (dy && canScrollY))
        e_preventDefault(e);
      display.wheelStartX = null; // Abort measurement, if in progress
      return;
    }

    // 'Project' the visible viewport to cover the area that is being
    // scrolled into view (if we know enough to estimate it).
    if (dy && wheelPixelsPerUnit != null) {
      var pixels = dy * wheelPixelsPerUnit;
      var top = cm.doc.scrollTop, bot = top + display.wrapper.clientHeight;
      if (pixels < 0) top = Math.max(0, top + pixels - 50);
      else bot = Math.min(cm.doc.height, bot + pixels + 50);
      updateDisplaySimple(cm, {top: top, bottom: bot});
    }

    if (wheelSamples < 20) {
      if (display.wheelStartX == null) {
        display.wheelStartX = scroll.scrollLeft; display.wheelStartY = scroll.scrollTop;
        display.wheelDX = dx; display.wheelDY = dy;
        setTimeout(function() {
          if (display.wheelStartX == null) return;
          var movedX = scroll.scrollLeft - display.wheelStartX;
          var movedY = scroll.scrollTop - display.wheelStartY;
          var sample = (movedY && display.wheelDY && movedY / display.wheelDY) ||
            (movedX && display.wheelDX && movedX / display.wheelDX);
          display.wheelStartX = display.wheelStartY = null;
          if (!sample) return;
          wheelPixelsPerUnit = (wheelPixelsPerUnit * wheelSamples + sample) / (wheelSamples + 1);
          ++wheelSamples;
        }, 200);
      } else {
        display.wheelDX += dx; display.wheelDY += dy;
      }
    }
  }

  // KEY EVENTS

  // Run a handler that was bound to a key.
  function doHandleBinding(cm, bound, dropShift) {
    if (typeof bound == "string") {
      bound = commands[bound];
      if (!bound) return false;
    }
    // Ensure previous input has been read, so that the handler sees a
    // consistent view of the document
    cm.display.input.ensurePolled();
    var prevShift = cm.display.shift, done = false;
    try {
      if (cm.isReadOnly()) cm.state.suppressEdits = true;
      if (dropShift) cm.display.shift = false;
      done = bound(cm) != Pass;
    } finally {
      cm.display.shift = prevShift;
      cm.state.suppressEdits = false;
    }
    return done;
  }

  function lookupKeyForEditor(cm, name, handle) {
    for (var i = 0; i < cm.state.keyMaps.length; i++) {
      var result = lookupKey(name, cm.state.keyMaps[i], handle, cm);
      if (result) return result;
    }
    return (cm.options.extraKeys && lookupKey(name, cm.options.extraKeys, handle, cm))
      || lookupKey(name, cm.options.keyMap, handle, cm);
  }

  var stopSeq = new Delayed;
  function dispatchKey(cm, name, e, handle) {
    var seq = cm.state.keySeq;
    if (seq) {
      if (isModifierKey(name)) return "handled";
      stopSeq.set(50, function() {
        if (cm.state.keySeq == seq) {
          cm.state.keySeq = null;
          cm.display.input.reset();
        }
      });
      name = seq + " " + name;
    }
    var result = lookupKeyForEditor(cm, name, handle);

    if (result == "multi")
      cm.state.keySeq = name;
    if (result == "handled")
      signalLater(cm, "keyHandled", cm, name, e);

    if (result == "handled" || result == "multi") {
      e_preventDefault(e);
      restartBlink(cm);
    }

    if (seq && !result && /\'$/.test(name)) {
      e_preventDefault(e);
      return true;
    }
    return !!result;
  }

  // Handle a key from the keydown event.
  function handleKeyBinding(cm, e) {
    var name = keyName(e, true);
    if (!name) return false;

    if (e.shiftKey && !cm.state.keySeq) {
      // First try to resolve full name (including 'Shift-'). Failing
      // that, see if there is a cursor-motion command (starting with
      // 'go') bound to the keyname without 'Shift-'.
      return dispatchKey(cm, "Shift-" + name, e, function(b) {return doHandleBinding(cm, b, true);})
          || dispatchKey(cm, name, e, function(b) {
               if (typeof b == "string" ? /^go[A-Z]/.test(b) : b.motion)
                 return doHandleBinding(cm, b);
             });
    } else {
      return dispatchKey(cm, name, e, function(b) { return doHandleBinding(cm, b); });
    }
  }

  // Handle a key from the keypress event
  function handleCharBinding(cm, e, ch) {
    return dispatchKey(cm, "'" + ch + "'", e,
                       function(b) { return doHandleBinding(cm, b, true); });
  }

  var lastStoppedKey = null;
  function onKeyDown(e) {
    var cm = this;
    cm.curOp.focus = activeElt();
    if (signalDOMEvent(cm, e)) return;
    // IE does strange things with escape.
    if (ie && ie_version < 11 && e.keyCode == 27) e.returnValue = false;
    var code = e.keyCode;
    cm.display.shift = code == 16 || e.shiftKey;
    var handled = handleKeyBinding(cm, e);
    if (presto) {
      lastStoppedKey = handled ? code : null;
      // Opera has no cut event... we try to at least catch the key combo
      if (!handled && code == 88 && !hasCopyEvent && (mac ? e.metaKey : e.ctrlKey))
        cm.replaceSelection("", null, "cut");
    }

    // Turn mouse into crosshair when Alt is held on Mac.
    if (code == 18 && !/\bCodeMirror-crosshair\b/.test(cm.display.lineDiv.className))
      showCrossHair(cm);
  }

  function showCrossHair(cm) {
    var lineDiv = cm.display.lineDiv;
    addClass(lineDiv, "CodeMirror-crosshair");

    function up(e) {
      if (e.keyCode == 18 || !e.altKey) {
        rmClass(lineDiv, "CodeMirror-crosshair");
        off(document, "keyup", up);
        off(document, "mouseover", up);
      }
    }
    on(document, "keyup", up);
    on(document, "mouseover", up);
  }

  function onKeyUp(e) {
    if (e.keyCode == 16) this.doc.sel.shift = false;
    signalDOMEvent(this, e);
  }

  function onKeyPress(e) {
    var cm = this;
    if (eventInWidget(cm.display, e) || signalDOMEvent(cm, e) || e.ctrlKey && !e.altKey || mac && e.metaKey) return;
    var keyCode = e.keyCode, charCode = e.charCode;
    if (presto && keyCode == lastStoppedKey) {lastStoppedKey = null; e_preventDefault(e); return;}
    if ((presto && (!e.which || e.which < 10)) && handleKeyBinding(cm, e)) return;
    var ch = String.fromCharCode(charCode == null ? keyCode : charCode);
    if (handleCharBinding(cm, e, ch)) return;
    cm.display.input.onKeyPress(e);
  }

  // FOCUS/BLUR EVENTS

  function delayBlurEvent(cm) {
    cm.state.delayingBlurEvent = true;
    setTimeout(function() {
      if (cm.state.delayingBlurEvent) {
        cm.state.delayingBlurEvent = false;
        onBlur(cm);
      }
    }, 100);
  }

  function onFocus(cm) {
    if (cm.state.delayingBlurEvent) cm.state.delayingBlurEvent = false;

    if (cm.options.readOnly == "nocursor") return;
    if (!cm.state.focused) {
      signal(cm, "focus", cm);
      cm.state.focused = true;
      addClass(cm.display.wrapper, "CodeMirror-focused");
      // This test prevents this from firing when a context
      // menu is closed (since the input reset would kill the
      // select-all detection hack)
      if (!cm.curOp && cm.display.selForContextMenu != cm.doc.sel) {
        cm.display.input.reset();
        if (webkit) setTimeout(function() { cm.display.input.reset(true); }, 20); // Issue #1730
      }
      cm.display.input.receivedFocus();
    }
    restartBlink(cm);
  }
  function onBlur(cm) {
    if (cm.state.delayingBlurEvent) return;

    if (cm.state.focused) {
      signal(cm, "blur", cm);
      cm.state.focused = false;
      rmClass(cm.display.wrapper, "CodeMirror-focused");
    }
    clearInterval(cm.display.blinker);
    setTimeout(function() {if (!cm.state.focused) cm.display.shift = false;}, 150);
  }

  // CONTEXT MENU HANDLING

  // To make the context menu work, we need to briefly unhide the
  // textarea (making it as unobtrusive as possible) to let the
  // right-click take effect on it.
  function onContextMenu(cm, e) {
    if (eventInWidget(cm.display, e) || contextMenuInGutter(cm, e)) return;
    if (signalDOMEvent(cm, e, "contextmenu")) return;
    cm.display.input.onContextMenu(e);
  }

  function contextMenuInGutter(cm, e) {
    if (!hasHandler(cm, "gutterContextMenu")) return false;
    return gutterEvent(cm, e, "gutterContextMenu", false);
  }

  // UPDATING

  // Compute the position of the end of a change (its 'to' property
  // refers to the pre-change end).
  var changeEnd = CodeMirror.changeEnd = function(change) {
    if (!change.text) return change.to;
    return Pos(change.from.line + change.text.length - 1,
               lst(change.text).length + (change.text.length == 1 ? change.from.ch : 0));
  };

  // Adjust a position to refer to the post-change position of the
  // same text, or the end of the change if the change covers it.
  function adjustForChange(pos, change) {
    if (cmp(pos, change.from) < 0) return pos;
    if (cmp(pos, change.to) <= 0) return changeEnd(change);

    var line = pos.line + change.text.length - (change.to.line - change.from.line) - 1, ch = pos.ch;
    if (pos.line == change.to.line) ch += changeEnd(change).ch - change.to.ch;
    return Pos(line, ch);
  }

  function computeSelAfterChange(doc, change) {
    var out = [];
    for (var i = 0; i < doc.sel.ranges.length; i++) {
      var range = doc.sel.ranges[i];
      out.push(new Range(adjustForChange(range.anchor, change),
                         adjustForChange(range.head, change)));
    }
    return normalizeSelection(out, doc.sel.primIndex);
  }

  function offsetPos(pos, old, nw) {
    if (pos.line == old.line)
      return Pos(nw.line, pos.ch - old.ch + nw.ch);
    else
      return Pos(nw.line + (pos.line - old.line), pos.ch);
  }

  // Used by replaceSelections to allow moving the selection to the
  // start or around the replaced test. Hint may be "start" or "around".
  function computeReplacedSel(doc, changes, hint) {
    var out = [];
    var oldPrev = Pos(doc.first, 0), newPrev = oldPrev;
    for (var i = 0; i < changes.length; i++) {
      var change = changes[i];
      var from = offsetPos(change.from, oldPrev, newPrev);
      var to = offsetPos(changeEnd(change), oldPrev, newPrev);
      oldPrev = change.to;
      newPrev = to;
      if (hint == "around") {
        var range = doc.sel.ranges[i], inv = cmp(range.head, range.anchor) < 0;
        out[i] = new Range(inv ? to : from, inv ? from : to);
      } else {
        out[i] = new Range(from, from);
      }
    }
    return new Selection(out, doc.sel.primIndex);
  }

  // Allow "beforeChange" event handlers to influence a change
  function filterChange(doc, change, update) {
    var obj = {
      canceled: false,
      from: change.from,
      to: change.to,
      text: change.text,
      origin: change.origin,
      cancel: function() { this.canceled = true; }
    };
    if (update) obj.update = function(from, to, text, origin) {
      if (from) this.from = clipPos(doc, from);
      if (to) this.to = clipPos(doc, to);
      if (text) this.text = text;
      if (origin !== undefined) this.origin = origin;
    };
    signal(doc, "beforeChange", doc, obj);
    if (doc.cm) signal(doc.cm, "beforeChange", doc.cm, obj);

    if (obj.canceled) return null;
    return {from: obj.from, to: obj.to, text: obj.text, origin: obj.origin};
  }

  // Apply a change to a document, and add it to the document's
  // history, and propagating it to all linked documents.
  function makeChange(doc, change, ignoreReadOnly) {
    if (doc.cm) {
      if (!doc.cm.curOp) return operation(doc.cm, makeChange)(doc, change, ignoreReadOnly);
      if (doc.cm.state.suppressEdits) return;
    }

    if (hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange")) {
      change = filterChange(doc, change, true);
      if (!change) return;
    }

    // Possibly split or suppress the update based on the presence
    // of read-only spans in its range.
    var split = sawReadOnlySpans && !ignoreReadOnly && removeReadOnlyRanges(doc, change.from, change.to);
    if (split) {
      for (var i = split.length - 1; i >= 0; --i)
        makeChangeInner(doc, {from: split[i].from, to: split[i].to, text: i ? [""] : change.text});
    } else {
      makeChangeInner(doc, change);
    }
  }

  function makeChangeInner(doc, change) {
    if (change.text.length == 1 && change.text[0] == "" && cmp(change.from, change.to) == 0) return;
    var selAfter = computeSelAfterChange(doc, change);
    addChangeToHistory(doc, change, selAfter, doc.cm ? doc.cm.curOp.id : NaN);

    makeChangeSingleDoc(doc, change, selAfter, stretchSpansOverChange(doc, change));
    var rebased = [];

    linkedDocs(doc, function(doc, sharedHist) {
      if (!sharedHist && indexOf(rebased, doc.history) == -1) {
        rebaseHist(doc.history, change);
        rebased.push(doc.history);
      }
      makeChangeSingleDoc(doc, change, null, stretchSpansOverChange(doc, change));
    });
  }

  // Revert a change stored in a document's history.
  function makeChangeFromHistory(doc, type, allowSelectionOnly) {
    if (doc.cm && doc.cm.state.suppressEdits) return;

    var hist = doc.history, event, selAfter = doc.sel;
    var source = type == "undo" ? hist.done : hist.undone, dest = type == "undo" ? hist.undone : hist.done;

    // Verify that there is a useable event (so that ctrl-z won't
    // needlessly clear selection events)
    for (var i = 0; i < source.length; i++) {
      event = source[i];
      if (allowSelectionOnly ? event.ranges && !event.equals(doc.sel) : !event.ranges)
        break;
    }
    if (i == source.length) return;
    hist.lastOrigin = hist.lastSelOrigin = null;

    for (;;) {
      event = source.pop();
      if (event.ranges) {
        pushSelectionToHistory(event, dest);
        if (allowSelectionOnly && !event.equals(doc.sel)) {
          setSelection(doc, event, {clearRedo: false});
          return;
        }
        selAfter = event;
      }
      else break;
    }

    // Build up a reverse change object to add to the opposite history
    // stack (redo when undoing, and vice versa).
    var antiChanges = [];
    pushSelectionToHistory(selAfter, dest);
    dest.push({changes: antiChanges, generation: hist.generation});
    hist.generation = event.generation || ++hist.maxGeneration;

    var filter = hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange");

    for (var i = event.changes.length - 1; i >= 0; --i) {
      var change = event.changes[i];
      change.origin = type;
      if (filter && !filterChange(doc, change, false)) {
        source.length = 0;
        return;
      }

      antiChanges.push(historyChangeFromChange(doc, change));

      var after = i ? computeSelAfterChange(doc, change) : lst(source);
      makeChangeSingleDoc(doc, change, after, mergeOldSpans(doc, change));
      if (!i && doc.cm) doc.cm.scrollIntoView({from: change.from, to: changeEnd(change)});
      var rebased = [];

      // Propagate to the linked documents
      linkedDocs(doc, function(doc, sharedHist) {
        if (!sharedHist && indexOf(rebased, doc.history) == -1) {
          rebaseHist(doc.history, change);
          rebased.push(doc.history);
        }
        makeChangeSingleDoc(doc, change, null, mergeOldSpans(doc, change));
      });
    }
  }

  // Sub-views need their line numbers shifted when text is added
  // above or below them in the parent document.
  function shiftDoc(doc, distance) {
    if (distance == 0) return;
    doc.first += distance;
    doc.sel = new Selection(map(doc.sel.ranges, function(range) {
      return new Range(Pos(range.anchor.line + distance, range.anchor.ch),
                       Pos(range.head.line + distance, range.head.ch));
    }), doc.sel.primIndex);
    if (doc.cm) {
      regChange(doc.cm, doc.first, doc.first - distance, distance);
      for (var d = doc.cm.display, l = d.viewFrom; l < d.viewTo; l++)
        regLineChange(doc.cm, l, "gutter");
    }
  }

  // More lower-level change function, handling only a single document
  // (not linked ones).
  function makeChangeSingleDoc(doc, change, selAfter, spans) {
    if (doc.cm && !doc.cm.curOp)
      return operation(doc.cm, makeChangeSingleDoc)(doc, change, selAfter, spans);

    if (change.to.line < doc.first) {
      shiftDoc(doc, change.text.length - 1 - (change.to.line - change.from.line));
      return;
    }
    if (change.from.line > doc.lastLine()) return;

    // Clip the change to the size of this doc
    if (change.from.line < doc.first) {
      var shift = change.text.length - 1 - (doc.first - change.from.line);
      shiftDoc(doc, shift);
      change = {from: Pos(doc.first, 0), to: Pos(change.to.line + shift, change.to.ch),
                text: [lst(change.text)], origin: change.origin};
    }
    var last = doc.lastLine();
    if (change.to.line > last) {
      change = {from: change.from, to: Pos(last, getLine(doc, last).text.length),
                text: [change.text[0]], origin: change.origin};
    }

    change.removed = getBetween(doc, change.from, change.to);

    if (!selAfter) selAfter = computeSelAfterChange(doc, change);
    if (doc.cm) makeChangeSingleDocInEditor(doc.cm, change, spans);
    else updateDoc(doc, change, spans);
    setSelectionNoUndo(doc, selAfter, sel_dontScroll);
  }

  // Handle the interaction of a change to a document with the editor
  // that this document is part of.
  function makeChangeSingleDocInEditor(cm, change, spans) {
    var doc = cm.doc, display = cm.display, from = change.from, to = change.to;

    var recomputeMaxLength = false, checkWidthStart = from.line;
    if (!cm.options.lineWrapping) {
      checkWidthStart = lineNo(visualLine(getLine(doc, from.line)));
      doc.iter(checkWidthStart, to.line + 1, function(line) {
        if (line == display.maxLine) {
          recomputeMaxLength = true;
          return true;
        }
      });
    }

    if (doc.sel.contains(change.from, change.to) > -1)
      signalCursorActivity(cm);

    updateDoc(doc, change, spans, estimateHeight(cm));

    if (!cm.options.lineWrapping) {
      doc.iter(checkWidthStart, from.line + change.text.length, function(line) {
        var len = lineLength(line);
        if (len > display.maxLineLength) {
          display.maxLine = line;
          display.maxLineLength = len;
          display.maxLineChanged = true;
          recomputeMaxLength = false;
        }
      });
      if (recomputeMaxLength) cm.curOp.updateMaxLine = true;
    }

    // Adjust frontier, schedule worker
    doc.frontier = Math.min(doc.frontier, from.line);
    startWorker(cm, 400);

    var lendiff = change.text.length - (to.line - from.line) - 1;
    // Remember that these lines changed, for updating the display
    if (change.full)
      regChange(cm);
    else if (from.line == to.line && change.text.length == 1 && !isWholeLineUpdate(cm.doc, change))
      regLineChange(cm, from.line, "text");
    else
      regChange(cm, from.line, to.line + 1, lendiff);

    var changesHandler = hasHandler(cm, "changes"), changeHandler = hasHandler(cm, "change");
    if (changeHandler || changesHandler) {
      var obj = {
        from: from, to: to,
        text: change.text,
        removed: change.removed,
        origin: change.origin
      };
      if (changeHandler) signalLater(cm, "change", cm, obj);
      if (changesHandler) (cm.curOp.changeObjs || (cm.curOp.changeObjs = [])).push(obj);
    }
    cm.display.selForContextMenu = null;
  }

  function replaceRange(doc, code, from, to, origin) {
    if (!to) to = from;
    if (cmp(to, from) < 0) { var tmp = to; to = from; from = tmp; }
    if (typeof code == "string") code = doc.splitLines(code);
    makeChange(doc, {from: from, to: to, text: code, origin: origin});
  }

  // SCROLLING THINGS INTO VIEW

  // If an editor sits on the top or bottom of the window, partially
  // scrolled out of view, this ensures that the cursor is visible.
  function maybeScrollWindow(cm, coords) {
    if (signalDOMEvent(cm, "scrollCursorIntoView")) return;

    var display = cm.display, box = display.sizer.getBoundingClientRect(), doScroll = null;
    if (coords.top + box.top < 0) doScroll = true;
    else if (coords.bottom + box.top > (window.innerHeight || document.documentElement.clientHeight)) doScroll = false;
    if (doScroll != null && !phantom) {
      var scrollNode = elt("div", "\u200b", null, "position: absolute; top: " +
                           (coords.top - display.viewOffset - paddingTop(cm.display)) + "px; height: " +
                           (coords.bottom - coords.top + scrollGap(cm) + display.barHeight) + "px; left: " +
                           coords.left + "px; width: 2px;");
      cm.display.lineSpace.appendChild(scrollNode);
      scrollNode.scrollIntoView(doScroll);
      cm.display.lineSpace.removeChild(scrollNode);
    }
  }

  // Scroll a given position into view (immediately), verifying that
  // it actually became visible (as line heights are accurately
  // measured, the position of something may 'drift' during drawing).
  function scrollPosIntoView(cm, pos, end, margin) {
    if (margin == null) margin = 0;
    for (var limit = 0; limit < 5; limit++) {
      var changed = false, coords = cursorCoords(cm, pos);
      var endCoords = !end || end == pos ? coords : cursorCoords(cm, end);
      var scrollPos = calculateScrollPos(cm, Math.min(coords.left, endCoords.left),
                                         Math.min(coords.top, endCoords.top) - margin,
                                         Math.max(coords.left, endCoords.left),
                                         Math.max(coords.bottom, endCoords.bottom) + margin);
      var startTop = cm.doc.scrollTop, startLeft = cm.doc.scrollLeft;
      if (scrollPos.scrollTop != null) {
        setScrollTop(cm, scrollPos.scrollTop);
        if (Math.abs(cm.doc.scrollTop - startTop) > 1) changed = true;
      }
      if (scrollPos.scrollLeft != null) {
        setScrollLeft(cm, scrollPos.scrollLeft);
        if (Math.abs(cm.doc.scrollLeft - startLeft) > 1) changed = true;
      }
      if (!changed) break;
    }
    return coords;
  }

  // Scroll a given set of coordinates into view (immediately).
  function scrollIntoView(cm, x1, y1, x2, y2) {
    var scrollPos = calculateScrollPos(cm, x1, y1, x2, y2);
    if (scrollPos.scrollTop != null) setScrollTop(cm, scrollPos.scrollTop);
    if (scrollPos.scrollLeft != null) setScrollLeft(cm, scrollPos.scrollLeft);
  }

  // Calculate a new scroll position needed to scroll the given
  // rectangle into view. Returns an object with scrollTop and
  // scrollLeft properties. When these are undefined, the
  // vertical/horizontal position does not need to be adjusted.
  function calculateScrollPos(cm, x1, y1, x2, y2) {
    var display = cm.display, snapMargin = textHeight(cm.display);
    if (y1 < 0) y1 = 0;
    var screentop = cm.curOp && cm.curOp.scrollTop != null ? cm.curOp.scrollTop : display.scroller.scrollTop;
    var screen = displayHeight(cm), result = {};
    if (y2 - y1 > screen) y2 = y1 + screen;
    var docBottom = cm.doc.height + paddingVert(display);
    var atTop = y1 < snapMargin, atBottom = y2 > docBottom - snapMargin;
    if (y1 < screentop) {
      result.scrollTop = atTop ? 0 : y1;
    } else if (y2 > screentop + screen) {
      var newTop = Math.min(y1, (atBottom ? docBottom : y2) - screen);
      if (newTop != screentop) result.scrollTop = newTop;
    }

    var screenleft = cm.curOp && cm.curOp.scrollLeft != null ? cm.curOp.scrollLeft : display.scroller.scrollLeft;
    var screenw = displayWidth(cm) - (cm.options.fixedGutter ? display.gutters.offsetWidth : 0);
    var tooWide = x2 - x1 > screenw;
    if (tooWide) x2 = x1 + screenw;
    if (x1 < 10)
      result.scrollLeft = 0;
    else if (x1 < screenleft)
      result.scrollLeft = Math.max(0, x1 - (tooWide ? 0 : 10));
    else if (x2 > screenw + screenleft - 3)
      result.scrollLeft = x2 + (tooWide ? 0 : 10) - screenw;
    return result;
  }

  // Store a relative adjustment to the scroll position in the current
  // operation (to be applied when the operation finishes).
  function addToScrollPos(cm, left, top) {
    if (left != null || top != null) resolveScrollToPos(cm);
    if (left != null)
      cm.curOp.scrollLeft = (cm.curOp.scrollLeft == null ? cm.doc.scrollLeft : cm.curOp.scrollLeft) + left;
    if (top != null)
      cm.curOp.scrollTop = (cm.curOp.scrollTop == null ? cm.doc.scrollTop : cm.curOp.scrollTop) + top;
  }

  // Make sure that at the end of the operation the current cursor is
  // shown.
  function ensureCursorVisible(cm) {
    resolveScrollToPos(cm);
    var cur = cm.getCursor(), from = cur, to = cur;
    if (!cm.options.lineWrapping) {
      from = cur.ch ? Pos(cur.line, cur.ch - 1) : cur;
      to = Pos(cur.line, cur.ch + 1);
    }
    cm.curOp.scrollToPos = {from: from, to: to, margin: cm.options.cursorScrollMargin, isCursor: true};
  }

  // When an operation has its scrollToPos property set, and another
  // scroll action is applied before the end of the operation, this
  // 'simulates' scrolling that position into view in a cheap way, so
  // that the effect of intermediate scroll commands is not ignored.
  function resolveScrollToPos(cm) {
    var range = cm.curOp.scrollToPos;
    if (range) {
      cm.curOp.scrollToPos = null;
      var from = estimateCoords(cm, range.from), to = estimateCoords(cm, range.to);
      var sPos = calculateScrollPos(cm, Math.min(from.left, to.left),
                                    Math.min(from.top, to.top) - range.margin,
                                    Math.max(from.right, to.right),
                                    Math.max(from.bottom, to.bottom) + range.margin);
      cm.scrollTo(sPos.scrollLeft, sPos.scrollTop);
    }
  }

  // API UTILITIES

  // Indent the given line. The how parameter can be "smart",
  // "add"/null, "subtract", or "prev". When aggressive is false
  // (typically set to true for forced single-line indents), empty
  // lines are not indented, and places where the mode returns Pass
  // are left alone.
  function indentLine(cm, n, how, aggressive) {
    var doc = cm.doc, state;
    if (how == null) how = "add";
    if (how == "smart") {
      // Fall back to "prev" when the mode doesn't have an indentation
      // method.
      if (!doc.mode.indent) how = "prev";
      else state = getStateBefore(cm, n);
    }

    var tabSize = cm.options.tabSize;
    var line = getLine(doc, n), curSpace = countColumn(line.text, null, tabSize);
    if (line.stateAfter) line.stateAfter = null;
    var curSpaceString = line.text.match(/^\s*/)[0], indentation;
    if (!aggressive && !/\S/.test(line.text)) {
      indentation = 0;
      how = "not";
    } else if (how == "smart") {
      indentation = doc.mode.indent(state, line.text.slice(curSpaceString.length), line.text);
      if (indentation == Pass || indentation > 150) {
        if (!aggressive) return;
        how = "prev";
      }
    }
    if (how == "prev") {
      if (n > doc.first) indentation = countColumn(getLine(doc, n-1).text, null, tabSize);
      else indentation = 0;
    } else if (how == "add") {
      indentation = curSpace + cm.options.indentUnit;
    } else if (how == "subtract") {
      indentation = curSpace - cm.options.indentUnit;
    } else if (typeof how == "number") {
      indentation = curSpace + how;
    }
    indentation = Math.max(0, indentation);

    var indentString = "", pos = 0;
    if (cm.options.indentWithTabs)
      for (var i = Math.floor(indentation / tabSize); i; --i) {pos += tabSize; indentString += "\t";}
    if (pos < indentation) indentString += spaceStr(indentation - pos);

    if (indentString != curSpaceString) {
      replaceRange(doc, indentString, Pos(n, 0), Pos(n, curSpaceString.length), "+input");
      line.stateAfter = null;
      return true;
    } else {
      // Ensure that, if the cursor was in the whitespace at the start
      // of the line, it is moved to the end of that space.
      for (var i = 0; i < doc.sel.ranges.length; i++) {
        var range = doc.sel.ranges[i];
        if (range.head.line == n && range.head.ch < curSpaceString.length) {
          var pos = Pos(n, curSpaceString.length);
          replaceOneSelection(doc, i, new Range(pos, pos));
          break;
        }
      }
    }
  }

  // Utility for applying a change to a line by handle or number,
  // returning the number and optionally registering the line as
  // changed.
  function changeLine(doc, handle, changeType, op) {
    var no = handle, line = handle;
    if (typeof handle == "number") line = getLine(doc, clipLine(doc, handle));
    else no = lineNo(handle);
    if (no == null) return null;
    if (op(line, no) && doc.cm) regLineChange(doc.cm, no, changeType);
    return line;
  }

  // Helper for deleting text near the selection(s), used to implement
  // backspace, delete, and similar functionality.
  function deleteNearSelection(cm, compute) {
    var ranges = cm.doc.sel.ranges, kill = [];
    // Build up a set of ranges to kill first, merging overlapping
    // ranges.
    for (var i = 0; i < ranges.length; i++) {
      var toKill = compute(ranges[i]);
      while (kill.length && cmp(toKill.from, lst(kill).to) <= 0) {
        var replaced = kill.pop();
        if (cmp(replaced.from, toKill.from) < 0) {
          toKill.from = replaced.from;
          break;
        }
      }
      kill.push(toKill);
    }
    // Next, remove those actual ranges.
    runInOp(cm, function() {
      for (var i = kill.length - 1; i >= 0; i--)
        replaceRange(cm.doc, "", kill[i].from, kill[i].to, "+delete");
      ensureCursorVisible(cm);
    });
  }

  // Used for horizontal relative motion. Dir is -1 or 1 (left or
  // right), unit can be "char", "column" (like char, but doesn't
  // cross line boundaries), "word" (across next word), or "group" (to
  // the start of next group of word or non-word-non-whitespace
  // chars). The visually param controls whether, in right-to-left
  // text, direction 1 means to move towards the next index in the
  // string, or towards the character to the right of the current
  // position. The resulting position will have a hitSide=true
  // property if it reached the end of the document.
  function findPosH(doc, pos, dir, unit, visually) {
    var line = pos.line, ch = pos.ch, origDir = dir;
    var lineObj = getLine(doc, line);
    var possible = true;
    function findNextLine() {
      var l = line + dir;
      if (l < doc.first || l >= doc.first + doc.size) return (possible = false);
      line = l;
      return lineObj = getLine(doc, l);
    }
    function moveOnce(boundToLine) {
      var next = (visually ? moveVisually : moveLogically)(lineObj, ch, dir, true);
      if (next == null) {
        if (!boundToLine && findNextLine()) {
          if (visually) ch = (dir < 0 ? lineRight : lineLeft)(lineObj);
          else ch = dir < 0 ? lineObj.text.length : 0;
        } else return (possible = false);
      } else ch = next;
      return true;
    }

    if (unit == "char") moveOnce();
    else if (unit == "column") moveOnce(true);
    else if (unit == "word" || unit == "group") {
      var sawType = null, group = unit == "group";
      var helper = doc.cm && doc.cm.getHelper(pos, "wordChars");
      for (var first = true;; first = false) {
        if (dir < 0 && !moveOnce(!first)) break;
        var cur = lineObj.text.charAt(ch) || "\n";
        var type = isWordChar(cur, helper) ? "w"
          : group && cur == "\n" ? "n"
          : !group || /\s/.test(cur) ? null
          : "p";
        if (group && !first && !type) type = "s";
        if (sawType && sawType != type) {
          if (dir < 0) {dir = 1; moveOnce();}
          break;
        }

        if (type) sawType = type;
        if (dir > 0 && !moveOnce(!first)) break;
      }
    }
    var result = skipAtomic(doc, Pos(line, ch), pos, origDir, true);
    if (!possible) result.hitSide = true;
    return result;
  }

  // For relative vertical movement. Dir may be -1 or 1. Unit can be
  // "page" or "line". The resulting position will have a hitSide=true
  // property if it reached the end of the document.
  function findPosV(cm, pos, dir, unit) {
    var doc = cm.doc, x = pos.left, y;
    if (unit == "page") {
      var pageSize = Math.min(cm.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight);
      y = pos.top + dir * (pageSize - (dir < 0 ? 1.5 : .5) * textHeight(cm.display));
    } else if (unit == "line") {
      y = dir > 0 ? pos.bottom + 3 : pos.top - 3;
    }
    for (;;) {
      var target = coordsChar(cm, x, y);
      if (!target.outside) break;
      if (dir < 0 ? y <= 0 : y >= doc.height) { target.hitSide = true; break; }
      y += dir * 5;
    }
    return target;
  }

  // EDITOR METHODS

  // The publicly visible API. Note that methodOp(f) means
  // 'wrap f in an operation, performed on its `this` parameter'.

  // This is not the complete set of editor methods. Most of the
  // methods defined on the Doc type are also injected into
  // CodeMirror.prototype, for backwards compatibility and
  // convenience.

  CodeMirror.prototype = {
    constructor: CodeMirror,
    focus: function(){window.focus(); this.display.input.focus();},

    setOption: function(option, value) {
      var options = this.options, old = options[option];
      if (options[option] == value && option != "mode") return;
      options[option] = value;
      if (optionHandlers.hasOwnProperty(option))
        operation(this, optionHandlers[option])(this, value, old);
    },

    getOption: function(option) {return this.options[option];},
    getDoc: function() {return this.doc;},

    addKeyMap: function(map, bottom) {
      this.state.keyMaps[bottom ? "push" : "unshift"](getKeyMap(map));
    },
    removeKeyMap: function(map) {
      var maps = this.state.keyMaps;
      for (var i = 0; i < maps.length; ++i)
        if (maps[i] == map || maps[i].name == map) {
          maps.splice(i, 1);
          return true;
        }
    },

    addOverlay: methodOp(function(spec, options) {
      var mode = spec.token ? spec : CodeMirror.getMode(this.options, spec);
      if (mode.startState) throw new Error("Overlays may not be stateful.");
      this.state.overlays.push({mode: mode, modeSpec: spec, opaque: options && options.opaque});
      this.state.modeGen++;
      regChange(this);
    }),
    removeOverlay: methodOp(function(spec) {
      var overlays = this.state.overlays;
      for (var i = 0; i < overlays.length; ++i) {
        var cur = overlays[i].modeSpec;
        if (cur == spec || typeof spec == "string" && cur.name == spec) {
          overlays.splice(i, 1);
          this.state.modeGen++;
          regChange(this);
          return;
        }
      }
    }),

    indentLine: methodOp(function(n, dir, aggressive) {
      if (typeof dir != "string" && typeof dir != "number") {
        if (dir == null) dir = this.options.smartIndent ? "smart" : "prev";
        else dir = dir ? "add" : "subtract";
      }
      if (isLine(this.doc, n)) indentLine(this, n, dir, aggressive);
    }),
    indentSelection: methodOp(function(how) {
      var ranges = this.doc.sel.ranges, end = -1;
      for (var i = 0; i < ranges.length; i++) {
        var range = ranges[i];
        if (!range.empty()) {
          var from = range.from(), to = range.to();
          var start = Math.max(end, from.line);
          end = Math.min(this.lastLine(), to.line - (to.ch ? 0 : 1)) + 1;
          for (var j = start; j < end; ++j)
            indentLine(this, j, how);
          var newRanges = this.doc.sel.ranges;
          if (from.ch == 0 && ranges.length == newRanges.length && newRanges[i].from().ch > 0)
            replaceOneSelection(this.doc, i, new Range(from, newRanges[i].to()), sel_dontScroll);
        } else if (range.head.line > end) {
          indentLine(this, range.head.line, how, true);
          end = range.head.line;
          if (i == this.doc.sel.primIndex) ensureCursorVisible(this);
        }
      }
    }),

    // Fetch the parser token for a given character. Useful for hacks
    // that want to inspect the mode state (say, for completion).
    getTokenAt: function(pos, precise) {
      return takeToken(this, pos, precise);
    },

    getLineTokens: function(line, precise) {
      return takeToken(this, Pos(line), precise, true);
    },

    getTokenTypeAt: function(pos) {
      pos = clipPos(this.doc, pos);
      var styles = getLineStyles(this, getLine(this.doc, pos.line));
      var before = 0, after = (styles.length - 1) / 2, ch = pos.ch;
      var type;
      if (ch == 0) type = styles[2];
      else for (;;) {
        var mid = (before + after) >> 1;
        if ((mid ? styles[mid * 2 - 1] : 0) >= ch) after = mid;
        else if (styles[mid * 2 + 1] < ch) before = mid + 1;
        else { type = styles[mid * 2 + 2]; break; }
      }
      var cut = type ? type.indexOf("cm-overlay ") : -1;
      return cut < 0 ? type : cut == 0 ? null : type.slice(0, cut - 1);
    },

    getModeAt: function(pos) {
      var mode = this.doc.mode;
      if (!mode.innerMode) return mode;
      return CodeMirror.innerMode(mode, this.getTokenAt(pos).state).mode;
    },

    getHelper: function(pos, type) {
      return this.getHelpers(pos, type)[0];
    },

    getHelpers: function(pos, type) {
      var found = [];
      if (!helpers.hasOwnProperty(type)) return found;
      var help = helpers[type], mode = this.getModeAt(pos);
      if (typeof mode[type] == "string") {
        if (help[mode[type]]) found.push(help[mode[type]]);
      } else if (mode[type]) {
        for (var i = 0; i < mode[type].length; i++) {
          var val = help[mode[type][i]];
          if (val) found.push(val);
        }
      } else if (mode.helperType && help[mode.helperType]) {
        found.push(help[mode.helperType]);
      } else if (help[mode.name]) {
        found.push(help[mode.name]);
      }
      for (var i = 0; i < help._global.length; i++) {
        var cur = help._global[i];
        if (cur.pred(mode, this) && indexOf(found, cur.val) == -1)
          found.push(cur.val);
      }
      return found;
    },

    getStateAfter: function(line, precise) {
      var doc = this.doc;
      line = clipLine(doc, line == null ? doc.first + doc.size - 1: line);
      return getStateBefore(this, line + 1, precise);
    },

    cursorCoords: function(start, mode) {
      var pos, range = this.doc.sel.primary();
      if (start == null) pos = range.head;
      else if (typeof start == "object") pos = clipPos(this.doc, start);
      else pos = start ? range.from() : range.to();
      return cursorCoords(this, pos, mode || "page");
    },

    charCoords: function(pos, mode) {
      return charCoords(this, clipPos(this.doc, pos), mode || "page");
    },

    coordsChar: function(coords, mode) {
      coords = fromCoordSystem(this, coords, mode || "page");
      return coordsChar(this, coords.left, coords.top);
    },

    lineAtHeight: function(height, mode) {
      height = fromCoordSystem(this, {top: height, left: 0}, mode || "page").top;
      return lineAtHeight(this.doc, height + this.display.viewOffset);
    },
    heightAtLine: function(line, mode) {
      var end = false, lineObj;
      if (typeof line == "number") {
        var last = this.doc.first + this.doc.size - 1;
        if (line < this.doc.first) line = this.doc.first;
        else if (line > last) { line = last; end = true; }
        lineObj = getLine(this.doc, line);
      } else {
        lineObj = line;
      }
      return intoCoordSystem(this, lineObj, {top: 0, left: 0}, mode || "page").top +
        (end ? this.doc.height - heightAtLine(lineObj) : 0);
    },

    defaultTextHeight: function() { return textHeight(this.display); },
    defaultCharWidth: function() { return charWidth(this.display); },

    setGutterMarker: methodOp(function(line, gutterID, value) {
      return changeLine(this.doc, line, "gutter", function(line) {
        var markers = line.gutterMarkers || (line.gutterMarkers = {});
        markers[gutterID] = value;
        if (!value && isEmpty(markers)) line.gutterMarkers = null;
        return true;
      });
    }),

    clearGutter: methodOp(function(gutterID) {
      var cm = this, doc = cm.doc, i = doc.first;
      doc.iter(function(line) {
        if (line.gutterMarkers && line.gutterMarkers[gutterID]) {
          line.gutterMarkers[gutterID] = null;
          regLineChange(cm, i, "gutter");
          if (isEmpty(line.gutterMarkers)) line.gutterMarkers = null;
        }
        ++i;
      });
    }),

    lineInfo: function(line) {
      if (typeof line == "number") {
        if (!isLine(this.doc, line)) return null;
        var n = line;
        line = getLine(this.doc, line);
        if (!line) return null;
      } else {
        var n = lineNo(line);
        if (n == null) return null;
      }
      return {line: n, handle: line, text: line.text, gutterMarkers: line.gutterMarkers,
              textClass: line.textClass, bgClass: line.bgClass, wrapClass: line.wrapClass,
              widgets: line.widgets};
    },

    getViewport: function() { return {from: this.display.viewFrom, to: this.display.viewTo};},

    addWidget: function(pos, node, scroll, vert, horiz) {
      var display = this.display;
      pos = cursorCoords(this, clipPos(this.doc, pos));
      var top = pos.bottom, left = pos.left;
      node.style.position = "absolute";
      node.setAttribute("cm-ignore-events", "true");
      this.display.input.setUneditable(node);
      display.sizer.appendChild(node);
      if (vert == "over") {
        top = pos.top;
      } else if (vert == "above" || vert == "near") {
        var vspace = Math.max(display.wrapper.clientHeight, this.doc.height),
        hspace = Math.max(display.sizer.clientWidth, display.lineSpace.clientWidth);
        // Default to positioning above (if specified and possible); otherwise default to positioning below
        if ((vert == 'above' || pos.bottom + node.offsetHeight > vspace) && pos.top > node.offsetHeight)
          top = pos.top - node.offsetHeight;
        else if (pos.bottom + node.offsetHeight <= vspace)
          top = pos.bottom;
        if (left + node.offsetWidth > hspace)
          left = hspace - node.offsetWidth;
      }
      node.style.top = top + "px";
      node.style.left = node.style.right = "";
      if (horiz == "right") {
        left = display.sizer.clientWidth - node.offsetWidth;
        node.style.right = "0px";
      } else {
        if (horiz == "left") left = 0;
        else if (horiz == "middle") left = (display.sizer.clientWidth - node.offsetWidth) / 2;
        node.style.left = left + "px";
      }
      if (scroll)
        scrollIntoView(this, left, top, left + node.offsetWidth, top + node.offsetHeight);
    },

    triggerOnKeyDown: methodOp(onKeyDown),
    triggerOnKeyPress: methodOp(onKeyPress),
    triggerOnKeyUp: onKeyUp,

    execCommand: function(cmd) {
      if (commands.hasOwnProperty(cmd))
        return commands[cmd].call(null, this);
    },

    triggerElectric: methodOp(function(text) { triggerElectric(this, text); }),

    findPosH: function(from, amount, unit, visually) {
      var dir = 1;
      if (amount < 0) { dir = -1; amount = -amount; }
      for (var i = 0, cur = clipPos(this.doc, from); i < amount; ++i) {
        cur = findPosH(this.doc, cur, dir, unit, visually);
        if (cur.hitSide) break;
      }
      return cur;
    },

    moveH: methodOp(function(dir, unit) {
      var cm = this;
      cm.extendSelectionsBy(function(range) {
        if (cm.display.shift || cm.doc.extend || range.empty())
          return findPosH(cm.doc, range.head, dir, unit, cm.options.rtlMoveVisually);
        else
          return dir < 0 ? range.from() : range.to();
      }, sel_move);
    }),

    deleteH: methodOp(function(dir, unit) {
      var sel = this.doc.sel, doc = this.doc;
      if (sel.somethingSelected())
        doc.replaceSelection("", null, "+delete");
      else
        deleteNearSelection(this, function(range) {
          var other = findPosH(doc, range.head, dir, unit, false);
          return dir < 0 ? {from: other, to: range.head} : {from: range.head, to: other};
        });
    }),

    findPosV: function(from, amount, unit, goalColumn) {
      var dir = 1, x = goalColumn;
      if (amount < 0) { dir = -1; amount = -amount; }
      for (var i = 0, cur = clipPos(this.doc, from); i < amount; ++i) {
        var coords = cursorCoords(this, cur, "div");
        if (x == null) x = coords.left;
        else coords.left = x;
        cur = findPosV(this, coords, dir, unit);
        if (cur.hitSide) break;
      }
      return cur;
    },

    moveV: methodOp(function(dir, unit) {
      var cm = this, doc = this.doc, goals = [];
      var collapse = !cm.display.shift && !doc.extend && doc.sel.somethingSelected();
      doc.extendSelectionsBy(function(range) {
        if (collapse)
          return dir < 0 ? range.from() : range.to();
        var headPos = cursorCoords(cm, range.head, "div");
        if (range.goalColumn != null) headPos.left = range.goalColumn;
        goals.push(headPos.left);
        var pos = findPosV(cm, headPos, dir, unit);
        if (unit == "page" && range == doc.sel.primary())
          addToScrollPos(cm, null, charCoords(cm, pos, "div").top - headPos.top);
        return pos;
      }, sel_move);
      if (goals.length) for (var i = 0; i < doc.sel.ranges.length; i++)
        doc.sel.ranges[i].goalColumn = goals[i];
    }),

    // Find the word at the given position (as returned by coordsChar).
    findWordAt: function(pos) {
      var doc = this.doc, line = getLine(doc, pos.line).text;
      var start = pos.ch, end = pos.ch;
      if (line) {
        var helper = this.getHelper(pos, "wordChars");
        if ((pos.xRel < 0 || end == line.length) && start) --start; else ++end;
        var startChar = line.charAt(start);
        var check = isWordChar(startChar, helper)
          ? function(ch) { return isWordChar(ch, helper); }
          : /\s/.test(startChar) ? function(ch) {return /\s/.test(ch);}
          : function(ch) {return !/\s/.test(ch) && !isWordChar(ch);};
        while (start > 0 && check(line.charAt(start - 1))) --start;
        while (end < line.length && check(line.charAt(end))) ++end;
      }
      return new Range(Pos(pos.line, start), Pos(pos.line, end));
    },

    toggleOverwrite: function(value) {
      if (value != null && value == this.state.overwrite) return;
      if (this.state.overwrite = !this.state.overwrite)
        addClass(this.display.cursorDiv, "CodeMirror-overwrite");
      else
        rmClass(this.display.cursorDiv, "CodeMirror-overwrite");

      signal(this, "overwriteToggle", this, this.state.overwrite);
    },
    hasFocus: function() { return this.display.input.getField() == activeElt(); },
    isReadOnly: function() { return !!(this.options.readOnly || this.doc.cantEdit); },

    scrollTo: methodOp(function(x, y) {
      if (x != null || y != null) resolveScrollToPos(this);
      if (x != null) this.curOp.scrollLeft = x;
      if (y != null) this.curOp.scrollTop = y;
    }),
    getScrollInfo: function() {
      var scroller = this.display.scroller;
      return {left: scroller.scrollLeft, top: scroller.scrollTop,
              height: scroller.scrollHeight - scrollGap(this) - this.display.barHeight,
              width: scroller.scrollWidth - scrollGap(this) - this.display.barWidth,
              clientHeight: displayHeight(this), clientWidth: displayWidth(this)};
    },

    scrollIntoView: methodOp(function(range, margin) {
      if (range == null) {
        range = {from: this.doc.sel.primary().head, to: null};
        if (margin == null) margin = this.options.cursorScrollMargin;
      } else if (typeof range == "number") {
        range = {from: Pos(range, 0), to: null};
      } else if (range.from == null) {
        range = {from: range, to: null};
      }
      if (!range.to) range.to = range.from;
      range.margin = margin || 0;

      if (range.from.line != null) {
        resolveScrollToPos(this);
        this.curOp.scrollToPos = range;
      } else {
        var sPos = calculateScrollPos(this, Math.min(range.from.left, range.to.left),
                                      Math.min(range.from.top, range.to.top) - range.margin,
                                      Math.max(range.from.right, range.to.right),
                                      Math.max(range.from.bottom, range.to.bottom) + range.margin);
        this.scrollTo(sPos.scrollLeft, sPos.scrollTop);
      }
    }),

    setSize: methodOp(function(width, height) {
      var cm = this;
      function interpret(val) {
        return typeof val == "number" || /^\d+$/.test(String(val)) ? val + "px" : val;
      }
      if (width != null) cm.display.wrapper.style.width = interpret(width);
      if (height != null) cm.display.wrapper.style.height = interpret(height);
      if (cm.options.lineWrapping) clearLineMeasurementCache(this);
      var lineNo = cm.display.viewFrom;
      cm.doc.iter(lineNo, cm.display.viewTo, function(line) {
        if (line.widgets) for (var i = 0; i < line.widgets.length; i++)
          if (line.widgets[i].noHScroll) { regLineChange(cm, lineNo, "widget"); break; }
        ++lineNo;
      });
      cm.curOp.forceUpdate = true;
      signal(cm, "refresh", this);
    }),

    operation: function(f){return runInOp(this, f);},

    refresh: methodOp(function() {
      var oldHeight = this.display.cachedTextHeight;
      regChange(this);
      this.curOp.forceUpdate = true;
      clearCaches(this);
      this.scrollTo(this.doc.scrollLeft, this.doc.scrollTop);
      updateGutterSpace(this);
      if (oldHeight == null || Math.abs(oldHeight - textHeight(this.display)) > .5)
        estimateLineHeights(this);
      signal(this, "refresh", this);
    }),

    swapDoc: methodOp(function(doc) {
      var old = this.doc;
      old.cm = null;
      attachDoc(this, doc);
      clearCaches(this);
      this.display.input.reset();
      this.scrollTo(doc.scrollLeft, doc.scrollTop);
      this.curOp.forceScroll = true;
      signalLater(this, "swapDoc", this, old);
      return old;
    }),

    getInputField: function(){return this.display.input.getField();},
    getWrapperElement: function(){return this.display.wrapper;},
    getScrollerElement: function(){return this.display.scroller;},
    getGutterElement: function(){return this.display.gutters;}
  };
  eventMixin(CodeMirror);

  // OPTION DEFAULTS

  // The default configuration options.
  var defaults = CodeMirror.defaults = {};
  // Functions to run when options are changed.
  var optionHandlers = CodeMirror.optionHandlers = {};

  function option(name, deflt, handle, notOnInit) {
    CodeMirror.defaults[name] = deflt;
    if (handle) optionHandlers[name] =
      notOnInit ? function(cm, val, old) {if (old != Init) handle(cm, val, old);} : handle;
  }

  // Passed to option handlers when there is no old value.
  var Init = CodeMirror.Init = {toString: function(){return "CodeMirror.Init";}};

  // These two are, on init, called from the constructor because they
  // have to be initialized before the editor can start at all.
  option("value", "", function(cm, val) {
    cm.setValue(val);
  }, true);
  option("mode", null, function(cm, val) {
    cm.doc.modeOption = val;
    loadMode(cm);
  }, true);

  option("indentUnit", 2, loadMode, true);
  option("indentWithTabs", false);
  option("smartIndent", true);
  option("tabSize", 4, function(cm) {
    resetModeState(cm);
    clearCaches(cm);
    regChange(cm);
  }, true);
  option("lineSeparator", null, function(cm, val) {
    cm.doc.lineSep = val;
    if (!val) return;
    var newBreaks = [], lineNo = cm.doc.first;
    cm.doc.iter(function(line) {
      for (var pos = 0;;) {
        var found = line.text.indexOf(val, pos);
        if (found == -1) break;
        pos = found + val.length;
        newBreaks.push(Pos(lineNo, found));
      }
      lineNo++;
    });
    for (var i = newBreaks.length - 1; i >= 0; i--)
      replaceRange(cm.doc, val, newBreaks[i], Pos(newBreaks[i].line, newBreaks[i].ch + val.length))
  });
  option("specialChars", /[\t\u0000-\u0019\u00ad\u200b-\u200f\u2028\u2029\ufeff]/g, function(cm, val, old) {
    cm.state.specialChars = new RegExp(val.source + (val.test("\t") ? "" : "|\t"), "g");
    if (old != CodeMirror.Init) cm.refresh();
  });
  option("specialCharPlaceholder", defaultSpecialCharPlaceholder, function(cm) {cm.refresh();}, true);
  option("electricChars", true);
  option("inputStyle", mobile ? "contenteditable" : "textarea", function() {
    throw new Error("inputStyle can not (yet) be changed in a running editor"); // FIXME
  }, true);
  option("rtlMoveVisually", !windows);
  option("wholeLineUpdateBefore", true);

  option("theme", "default", function(cm) {
    themeChanged(cm);
    guttersChanged(cm);
  }, true);
  option("keyMap", "default", function(cm, val, old) {
    var next = getKeyMap(val);
    var prev = old != CodeMirror.Init && getKeyMap(old);
    if (prev && prev.detach) prev.detach(cm, next);
    if (next.attach) next.attach(cm, prev || null);
  });
  option("extraKeys", null);

  option("lineWrapping", false, wrappingChanged, true);
  option("gutters", [], function(cm) {
    setGuttersForLineNumbers(cm.options);
    guttersChanged(cm);
  }, true);
  option("fixedGutter", true, function(cm, val) {
    cm.display.gutters.style.left = val ? compensateForHScroll(cm.display) + "px" : "0";
    cm.refresh();
  }, true);
  option("coverGutterNextToScrollbar", false, function(cm) {updateScrollbars(cm);}, true);
  option("scrollbarStyle", "native", function(cm) {
    initScrollbars(cm);
    updateScrollbars(cm);
    cm.display.scrollbars.setScrollTop(cm.doc.scrollTop);
    cm.display.scrollbars.setScrollLeft(cm.doc.scrollLeft);
  }, true);
  option("lineNumbers", false, function(cm) {
    setGuttersForLineNumbers(cm.options);
    guttersChanged(cm);
  }, true);
  option("firstLineNumber", 1, guttersChanged, true);
  option("lineNumberFormatter", function(integer) {return integer;}, guttersChanged, true);
  option("showCursorWhenSelecting", false, updateSelection, true);

  option("resetSelectionOnContextMenu", true);
  option("lineWiseCopyCut", true);

  option("readOnly", false, function(cm, val) {
    if (val == "nocursor") {
      onBlur(cm);
      cm.display.input.blur();
      cm.display.disabled = true;
    } else {
      cm.display.disabled = false;
    }
    cm.display.input.readOnlyChanged(val)
  });
  option("disableInput", false, function(cm, val) {if (!val) cm.display.input.reset();}, true);
  option("dragDrop", true, dragDropChanged);
  option("allowDropFileTypes", null);

  option("cursorBlinkRate", 530);
  option("cursorScrollMargin", 0);
  option("cursorHeight", 1, updateSelection, true);
  option("singleCursorHeightPerLine", true, updateSelection, true);
  option("workTime", 100);
  option("workDelay", 100);
  option("flattenSpans", true, resetModeState, true);
  option("addModeClass", false, resetModeState, true);
  option("pollInterval", 100);
  option("undoDepth", 200, function(cm, val){cm.doc.history.undoDepth = val;});
  option("historyEventDelay", 1250);
  option("viewportMargin", 10, function(cm){cm.refresh();}, true);
  option("maxHighlightLength", 10000, resetModeState, true);
  option("moveInputWithCursor", true, function(cm, val) {
    if (!val) cm.display.input.resetPosition();
  });

  option("tabindex", null, function(cm, val) {
    cm.display.input.getField().tabIndex = val || "";
  });
  option("autofocus", null);

  // MODE DEFINITION AND QUERYING

  // Known modes, by name and by MIME
  var modes = CodeMirror.modes = {}, mimeModes = CodeMirror.mimeModes = {};

  // Extra arguments are stored as the mode's dependencies, which is
  // used by (legacy) mechanisms like loadmode.js to automatically
  // load a mode. (Preferred mechanism is the require/define calls.)
  CodeMirror.defineMode = function(name, mode) {
    if (!CodeMirror.defaults.mode && name != "null") CodeMirror.defaults.mode = name;
    if (arguments.length > 2)
      mode.dependencies = Array.prototype.slice.call(arguments, 2);
    modes[name] = mode;
  };

  CodeMirror.defineMIME = function(mime, spec) {
    mimeModes[mime] = spec;
  };

  // Given a MIME type, a {name, ...options} config object, or a name
  // string, return a mode config object.
  CodeMirror.resolveMode = function(spec) {
    if (typeof spec == "string" && mimeModes.hasOwnProperty(spec)) {
      spec = mimeModes[spec];
    } else if (spec && typeof spec.name == "string" && mimeModes.hasOwnProperty(spec.name)) {
      var found = mimeModes[spec.name];
      if (typeof found == "string") found = {name: found};
      spec = createObj(found, spec);
      spec.name = found.name;
    } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+xml$/.test(spec)) {
      return CodeMirror.resolveMode("application/xml");
    }
    if (typeof spec == "string") return {name: spec};
    else return spec || {name: "null"};
  };

  // Given a mode spec (anything that resolveMode accepts), find and
  // initialize an actual mode object.
  CodeMirror.getMode = function(options, spec) {
    var spec = CodeMirror.resolveMode(spec);
    var mfactory = modes[spec.name];
    if (!mfactory) return CodeMirror.getMode(options, "text/plain");
    var modeObj = mfactory(options, spec);
    if (modeExtensions.hasOwnProperty(spec.name)) {
      var exts = modeExtensions[spec.name];
      for (var prop in exts) {
        if (!exts.hasOwnProperty(prop)) continue;
        if (modeObj.hasOwnProperty(prop)) modeObj["_" + prop] = modeObj[prop];
        modeObj[prop] = exts[prop];
      }
    }
    modeObj.name = spec.name;
    if (spec.helperType) modeObj.helperType = spec.helperType;
    if (spec.modeProps) for (var prop in spec.modeProps)
      modeObj[prop] = spec.modeProps[prop];

    return modeObj;
  };

  // Minimal default mode.
  CodeMirror.defineMode("null", function() {
    return {token: function(stream) {stream.skipToEnd();}};
  });
  CodeMirror.defineMIME("text/plain", "null");

  // This can be used to attach properties to mode objects from
  // outside the actual mode definition.
  var modeExtensions = CodeMirror.modeExtensions = {};
  CodeMirror.extendMode = function(mode, properties) {
    var exts = modeExtensions.hasOwnProperty(mode) ? modeExtensions[mode] : (modeExtensions[mode] = {});
    copyObj(properties, exts);
  };

  // EXTENSIONS

  CodeMirror.defineExtension = function(name, func) {
    CodeMirror.prototype[name] = func;
  };
  CodeMirror.defineDocExtension = function(name, func) {
    Doc.prototype[name] = func;
  };
  CodeMirror.defineOption = option;

  var initHooks = [];
  CodeMirror.defineInitHook = function(f) {initHooks.push(f);};

  var helpers = CodeMirror.helpers = {};
  CodeMirror.registerHelper = function(type, name, value) {
    if (!helpers.hasOwnProperty(type)) helpers[type] = CodeMirror[type] = {_global: []};
    helpers[type][name] = value;
  };
  CodeMirror.registerGlobalHelper = function(type, name, predicate, value) {
    CodeMirror.registerHelper(type, name, value);
    helpers[type]._global.push({pred: predicate, val: value});
  };

  // MODE STATE HANDLING

  // Utility functions for working with state. Exported because nested
  // modes need to do this for their inner modes.

  var copyState = CodeMirror.copyState = function(mode, state) {
    if (state === true) return state;
    if (mode.copyState) return mode.copyState(state);
    var nstate = {};
    for (var n in state) {
      var val = state[n];
      if (val instanceof Array) val = val.concat([]);
      nstate[n] = val;
    }
    return nstate;
  };

  var startState = CodeMirror.startState = function(mode, a1, a2) {
    return mode.startState ? mode.startState(a1, a2) : true;
  };

  // Given a mode and a state (for that mode), find the inner mode and
  // state at the position that the state refers to.
  CodeMirror.innerMode = function(mode, state) {
    while (mode.innerMode) {
      var info = mode.innerMode(state);
      if (!info || info.mode == mode) break;
      state = info.state;
      mode = info.mode;
    }
    return info || {mode: mode, state: state};
  };

  // STANDARD COMMANDS

  // Commands are parameter-less actions that can be performed on an
  // editor, mostly used for keybindings.
  var commands = CodeMirror.commands = {
    selectAll: function(cm) {cm.setSelection(Pos(cm.firstLine(), 0), Pos(cm.lastLine()), sel_dontScroll);},
    singleSelection: function(cm) {
      cm.setSelection(cm.getCursor("anchor"), cm.getCursor("head"), sel_dontScroll);
    },
    killLine: function(cm) {
      deleteNearSelection(cm, function(range) {
        if (range.empty()) {
          var len = getLine(cm.doc, range.head.line).text.length;
          if (range.head.ch == len && range.head.line < cm.lastLine())
            return {from: range.head, to: Pos(range.head.line + 1, 0)};
          else
            return {from: range.head, to: Pos(range.head.line, len)};
        } else {
          return {from: range.from(), to: range.to()};
        }
      });
    },
    deleteLine: function(cm) {
      deleteNearSelection(cm, function(range) {
        return {from: Pos(range.from().line, 0),
                to: clipPos(cm.doc, Pos(range.to().line + 1, 0))};
      });
    },
    delLineLeft: function(cm) {
      deleteNearSelection(cm, function(range) {
        return {from: Pos(range.from().line, 0), to: range.from()};
      });
    },
    delWrappedLineLeft: function(cm) {
      deleteNearSelection(cm, function(range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var leftPos = cm.coordsChar({left: 0, top: top}, "div");
        return {from: leftPos, to: range.from()};
      });
    },
    delWrappedLineRight: function(cm) {
      deleteNearSelection(cm, function(range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var rightPos = cm.coordsChar({left: cm.display.lineDiv.offsetWidth + 100, top: top}, "div");
        return {from: range.from(), to: rightPos };
      });
    },
    undo: function(cm) {cm.undo();},
    redo: function(cm) {cm.redo();},
    undoSelection: function(cm) {cm.undoSelection();},
    redoSelection: function(cm) {cm.redoSelection();},
    goDocStart: function(cm) {cm.extendSelection(Pos(cm.firstLine(), 0));},
    goDocEnd: function(cm) {cm.extendSelection(Pos(cm.lastLine()));},
    goLineStart: function(cm) {
      cm.extendSelectionsBy(function(range) { return lineStart(cm, range.head.line); },
                            {origin: "+move", bias: 1});
    },
    goLineStartSmart: function(cm) {
      cm.extendSelectionsBy(function(range) {
        return lineStartSmart(cm, range.head);
      }, {origin: "+move", bias: 1});
    },
    goLineEnd: function(cm) {
      cm.extendSelectionsBy(function(range) { return lineEnd(cm, range.head.line); },
                            {origin: "+move", bias: -1});
    },
    goLineRight: function(cm) {
      cm.extendSelectionsBy(function(range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        return cm.coordsChar({left: cm.display.lineDiv.offsetWidth + 100, top: top}, "div");
      }, sel_move);
    },
    goLineLeft: function(cm) {
      cm.extendSelectionsBy(function(range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        return cm.coordsChar({left: 0, top: top}, "div");
      }, sel_move);
    },
    goLineLeftSmart: function(cm) {
      cm.extendSelectionsBy(function(range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var pos = cm.coordsChar({left: 0, top: top}, "div");
        if (pos.ch < cm.getLine(pos.line).search(/\S/)) return lineStartSmart(cm, range.head);
        return pos;
      }, sel_move);
    },
    goLineUp: function(cm) {cm.moveV(-1, "line");},
    goLineDown: function(cm) {cm.moveV(1, "line");},
    goPageUp: function(cm) {cm.moveV(-1, "page");},
    goPageDown: function(cm) {cm.moveV(1, "page");},
    goCharLeft: function(cm) {cm.moveH(-1, "char");},
    goCharRight: function(cm) {cm.moveH(1, "char");},
    goColumnLeft: function(cm) {cm.moveH(-1, "column");},
    goColumnRight: function(cm) {cm.moveH(1, "column");},
    goWordLeft: function(cm) {cm.moveH(-1, "word");},
    goGroupRight: function(cm) {cm.moveH(1, "group");},
    goGroupLeft: function(cm) {cm.moveH(-1, "group");},
    goWordRight: function(cm) {cm.moveH(1, "word");},
    delCharBefore: function(cm) {cm.deleteH(-1, "char");},
    delCharAfter: function(cm) {cm.deleteH(1, "char");},
    delWordBefore: function(cm) {cm.deleteH(-1, "word");},
    delWordAfter: function(cm) {cm.deleteH(1, "word");},
    delGroupBefore: function(cm) {cm.deleteH(-1, "group");},
    delGroupAfter: function(cm) {cm.deleteH(1, "group");},
    indentAuto: function(cm) {cm.indentSelection("smart");},
    indentMore: function(cm) {cm.indentSelection("add");},
    indentLess: function(cm) {cm.indentSelection("subtract");},
    insertTab: function(cm) {cm.replaceSelection("\t");},
    insertSoftTab: function(cm) {
      var spaces = [], ranges = cm.listSelections(), tabSize = cm.options.tabSize;
      for (var i = 0; i < ranges.length; i++) {
        var pos = ranges[i].from();
        var col = countColumn(cm.getLine(pos.line), pos.ch, tabSize);
        spaces.push(new Array(tabSize - col % tabSize + 1).join(" "));
      }
      cm.replaceSelections(spaces);
    },
    defaultTab: function(cm) {
      if (cm.somethingSelected()) cm.indentSelection("add");
      else cm.execCommand("insertTab");
    },
    transposeChars: function(cm) {
      runInOp(cm, function() {
        var ranges = cm.listSelections(), newSel = [];
        for (var i = 0; i < ranges.length; i++) {
          var cur = ranges[i].head, line = getLine(cm.doc, cur.line).text;
          if (line) {
            if (cur.ch == line.length) cur = new Pos(cur.line, cur.ch - 1);
            if (cur.ch > 0) {
              cur = new Pos(cur.line, cur.ch + 1);
              cm.replaceRange(line.charAt(cur.ch - 1) + line.charAt(cur.ch - 2),
                              Pos(cur.line, cur.ch - 2), cur, "+transpose");
            } else if (cur.line > cm.doc.first) {
              var prev = getLine(cm.doc, cur.line - 1).text;
              if (prev)
                cm.replaceRange(line.charAt(0) + cm.doc.lineSeparator() +
                                prev.charAt(prev.length - 1),
                                Pos(cur.line - 1, prev.length - 1), Pos(cur.line, 1), "+transpose");
            }
          }
          newSel.push(new Range(cur, cur));
        }
        cm.setSelections(newSel);
      });
    },
    newlineAndIndent: function(cm) {
      runInOp(cm, function() {
        var len = cm.listSelections().length;
        for (var i = 0; i < len; i++) {
          var range = cm.listSelections()[i];
          cm.replaceRange(cm.doc.lineSeparator(), range.anchor, range.head, "+input");
          cm.indentLine(range.from().line + 1, null, true);
        }
        ensureCursorVisible(cm);
      });
    },
    toggleOverwrite: function(cm) {cm.toggleOverwrite();}
  };


  // STANDARD KEYMAPS

  var keyMap = CodeMirror.keyMap = {};

  keyMap.basic = {
    "Left": "goCharLeft", "Right": "goCharRight", "Up": "goLineUp", "Down": "goLineDown",
    "End": "goLineEnd", "Home": "goLineStartSmart", "PageUp": "goPageUp", "PageDown": "goPageDown",
    "Delete": "delCharAfter", "Backspace": "delCharBefore", "Shift-Backspace": "delCharBefore",
    "Tab": "defaultTab", "Shift-Tab": "indentAuto",
    "Enter": "newlineAndIndent", "Insert": "toggleOverwrite",
    "Esc": "singleSelection"
  };
  // Note that the save and find-related commands aren't defined by
  // default. User code or addons can define them. Unknown commands
  // are simply ignored.
  keyMap.pcDefault = {
    "Ctrl-A": "selectAll", "Ctrl-D": "deleteLine", "Ctrl-Z": "undo", "Shift-Ctrl-Z": "redo", "Ctrl-Y": "redo",
    "Ctrl-Home": "goDocStart", "Ctrl-End": "goDocEnd", "Ctrl-Up": "goLineUp", "Ctrl-Down": "goLineDown",
    "Ctrl-Left": "goGroupLeft", "Ctrl-Right": "goGroupRight", "Alt-Left": "goLineStart", "Alt-Right": "goLineEnd",
    "Ctrl-Backspace": "delGroupBefore", "Ctrl-Delete": "delGroupAfter", "Ctrl-S": "save", "Ctrl-F": "find",
    "Ctrl-G": "findNext", "Shift-Ctrl-G": "findPrev", "Shift-Ctrl-F": "replace", "Shift-Ctrl-R": "replaceAll",
    "Ctrl-[": "indentLess", "Ctrl-]": "indentMore",
    "Ctrl-U": "undoSelection", "Shift-Ctrl-U": "redoSelection", "Alt-U": "redoSelection",
    fallthrough: "basic"
  };
  // Very basic readline/emacs-style bindings, which are standard on Mac.
  keyMap.emacsy = {
    "Ctrl-F": "goCharRight", "Ctrl-B": "goCharLeft", "Ctrl-P": "goLineUp", "Ctrl-N": "goLineDown",
    "Alt-F": "goWordRight", "Alt-B": "goWordLeft", "Ctrl-A": "goLineStart", "Ctrl-E": "goLineEnd",
    "Ctrl-V": "goPageDown", "Shift-Ctrl-V": "goPageUp", "Ctrl-D": "delCharAfter", "Ctrl-H": "delCharBefore",
    "Alt-D": "delWordAfter", "Alt-Backspace": "delWordBefore", "Ctrl-K": "killLine", "Ctrl-T": "transposeChars"
  };
  keyMap.macDefault = {
    "Cmd-A": "selectAll", "Cmd-D": "deleteLine", "Cmd-Z": "undo", "Shift-Cmd-Z": "redo", "Cmd-Y": "redo",
    "Cmd-Home": "goDocStart", "Cmd-Up": "goDocStart", "Cmd-End": "goDocEnd", "Cmd-Down": "goDocEnd", "Alt-Left": "goGroupLeft",
    "Alt-Right": "goGroupRight", "Cmd-Left": "goLineLeft", "Cmd-Right": "goLineRight", "Alt-Backspace": "delGroupBefore",
    "Ctrl-Alt-Backspace": "delGroupAfter", "Alt-Delete": "delGroupAfter", "Cmd-S": "save", "Cmd-F": "find",
    "Cmd-G": "findNext", "Shift-Cmd-G": "findPrev", "Cmd-Alt-F": "replace", "Shift-Cmd-Alt-F": "replaceAll",
    "Cmd-[": "indentLess", "Cmd-]": "indentMore", "Cmd-Backspace": "delWrappedLineLeft", "Cmd-Delete": "delWrappedLineRight",
    "Cmd-U": "undoSelection", "Shift-Cmd-U": "redoSelection", "Ctrl-Up": "goDocStart", "Ctrl-Down": "goDocEnd",
    fallthrough: ["basic", "emacsy"]
  };
  keyMap["default"] = mac ? keyMap.macDefault : keyMap.pcDefault;

  // KEYMAP DISPATCH

  function normalizeKeyName(name) {
    var parts = name.split(/-(?!$)/), name = parts[parts.length - 1];
    var alt, ctrl, shift, cmd;
    for (var i = 0; i < parts.length - 1; i++) {
      var mod = parts[i];
      if (/^(cmd|meta|m)$/i.test(mod)) cmd = true;
      else if (/^a(lt)?$/i.test(mod)) alt = true;
      else if (/^(c|ctrl|control)$/i.test(mod)) ctrl = true;
      else if (/^s(hift)$/i.test(mod)) shift = true;
      else throw new Error("Unrecognized modifier name: " + mod);
    }
    if (alt) name = "Alt-" + name;
    if (ctrl) name = "Ctrl-" + name;
    if (cmd) name = "Cmd-" + name;
    if (shift) name = "Shift-" + name;
    return name;
  }

  // This is a kludge to keep keymaps mostly working as raw objects
  // (backwards compatibility) while at the same time support features
  // like normalization and multi-stroke key bindings. It compiles a
  // new normalized keymap, and then updates the old object to reflect
  // this.
  CodeMirror.normalizeKeyMap = function(keymap) {
    var copy = {};
    for (var keyname in keymap) if (keymap.hasOwnProperty(keyname)) {
      var value = keymap[keyname];
      if (/^(name|fallthrough|(de|at)tach)$/.test(keyname)) continue;
      if (value == "...") { delete keymap[keyname]; continue; }

      var keys = map(keyname.split(" "), normalizeKeyName);
      for (var i = 0; i < keys.length; i++) {
        var val, name;
        if (i == keys.length - 1) {
          name = keys.join(" ");
          val = value;
        } else {
          name = keys.slice(0, i + 1).join(" ");
          val = "...";
        }
        var prev = copy[name];
        if (!prev) copy[name] = val;
        else if (prev != val) throw new Error("Inconsistent bindings for " + name);
      }
      delete keymap[keyname];
    }
    for (var prop in copy) keymap[prop] = copy[prop];
    return keymap;
  };

  var lookupKey = CodeMirror.lookupKey = function(key, map, handle, context) {
    map = getKeyMap(map);
    var found = map.call ? map.call(key, context) : map[key];
    if (found === false) return "nothing";
    if (found === "...") return "multi";
    if (found != null && handle(found)) return "handled";

    if (map.fallthrough) {
      if (Object.prototype.toString.call(map.fallthrough) != "[object Array]")
        return lookupKey(key, map.fallthrough, handle, context);
      for (var i = 0; i < map.fallthrough.length; i++) {
        var result = lookupKey(key, map.fallthrough[i], handle, context);
        if (result) return result;
      }
    }
  };

  // Modifier key presses don't count as 'real' key presses for the
  // purpose of keymap fallthrough.
  var isModifierKey = CodeMirror.isModifierKey = function(value) {
    var name = typeof value == "string" ? value : keyNames[value.keyCode];
    return name == "Ctrl" || name == "Alt" || name == "Shift" || name == "Mod";
  };

  // Look up the name of a key as indicated by an event object.
  var keyName = CodeMirror.keyName = function(event, noShift) {
    if (presto && event.keyCode == 34 && event["char"]) return false;
    var base = keyNames[event.keyCode], name = base;
    if (name == null || event.altGraphKey) return false;
    if (event.altKey && base != "Alt") name = "Alt-" + name;
    if ((flipCtrlCmd ? event.metaKey : event.ctrlKey) && base != "Ctrl") name = "Ctrl-" + name;
    if ((flipCtrlCmd ? event.ctrlKey : event.metaKey) && base != "Cmd") name = "Cmd-" + name;
    if (!noShift && event.shiftKey && base != "Shift") name = "Shift-" + name;
    return name;
  };

  function getKeyMap(val) {
    return typeof val == "string" ? keyMap[val] : val;
  }

  // FROMTEXTAREA

  CodeMirror.fromTextArea = function(textarea, options) {
    options = options ? copyObj(options) : {};
    options.value = textarea.value;
    if (!options.tabindex && textarea.tabIndex)
      options.tabindex = textarea.tabIndex;
    if (!options.placeholder && textarea.placeholder)
      options.placeholder = textarea.placeholder;
    // Set autofocus to true if this textarea is focused, or if it has
    // autofocus and no other element is focused.
    if (options.autofocus == null) {
      var hasFocus = activeElt();
      options.autofocus = hasFocus == textarea ||
        textarea.getAttribute("autofocus") != null && hasFocus == document.body;
    }

    function save() {textarea.value = cm.getValue();}
    if (textarea.form) {
      on(textarea.form, "submit", save);
      // Deplorable hack to make the submit method do the right thing.
      if (!options.leaveSubmitMethodAlone) {
        var form = textarea.form, realSubmit = form.submit;
        try {
          var wrappedSubmit = form.submit = function() {
            save();
            form.submit = realSubmit;
            form.submit();
            form.submit = wrappedSubmit;
          };
        } catch(e) {}
      }
    }

    options.finishInit = function(cm) {
      cm.save = save;
      cm.getTextArea = function() { return textarea; };
      cm.toTextArea = function() {
        cm.toTextArea = isNaN; // Prevent this from being ran twice
        save();
        textarea.parentNode.removeChild(cm.getWrapperElement());
        textarea.style.display = "";
        if (textarea.form) {
          off(textarea.form, "submit", save);
          if (typeof textarea.form.submit == "function")
            textarea.form.submit = realSubmit;
        }
      };
    };

    textarea.style.display = "none";
    var cm = CodeMirror(function(node) {
      textarea.parentNode.insertBefore(node, textarea.nextSibling);
    }, options);
    return cm;
  };

  // STRING STREAM

  // Fed to the mode parsers, provides helper functions to make
  // parsers more succinct.

  var StringStream = CodeMirror.StringStream = function(string, tabSize) {
    this.pos = this.start = 0;
    this.string = string;
    this.tabSize = tabSize || 8;
    this.lastColumnPos = this.lastColumnValue = 0;
    this.lineStart = 0;
  };

  StringStream.prototype = {
    eol: function() {return this.pos >= this.string.length;},
    sol: function() {return this.pos == this.lineStart;},
    peek: function() {return this.string.charAt(this.pos) || undefined;},
    next: function() {
      if (this.pos < this.string.length)
        return this.string.charAt(this.pos++);
    },
    eat: function(match) {
      var ch = this.string.charAt(this.pos);
      if (typeof match == "string") var ok = ch == match;
      else var ok = ch && (match.test ? match.test(ch) : match(ch));
      if (ok) {++this.pos; return ch;}
    },
    eatWhile: function(match) {
      var start = this.pos;
      while (this.eat(match)){}
      return this.pos > start;
    },
    eatSpace: function() {
      var start = this.pos;
      while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) ++this.pos;
      return this.pos > start;
    },
    skipToEnd: function() {this.pos = this.string.length;},
    skipTo: function(ch) {
      var found = this.string.indexOf(ch, this.pos);
      if (found > -1) {this.pos = found; return true;}
    },
    backUp: function(n) {this.pos -= n;},
    column: function() {
      if (this.lastColumnPos < this.start) {
        this.lastColumnValue = countColumn(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
        this.lastColumnPos = this.start;
      }
      return this.lastColumnValue - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
    },
    indentation: function() {
      return countColumn(this.string, null, this.tabSize) -
        (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
    },
    match: function(pattern, consume, caseInsensitive) {
      if (typeof pattern == "string") {
        var cased = function(str) {return caseInsensitive ? str.toLowerCase() : str;};
        var substr = this.string.substr(this.pos, pattern.length);
        if (cased(substr) == cased(pattern)) {
          if (consume !== false) this.pos += pattern.length;
          return true;
        }
      } else {
        var match = this.string.slice(this.pos).match(pattern);
        if (match && match.index > 0) return null;
        if (match && consume !== false) this.pos += match[0].length;
        return match;
      }
    },
    current: function(){return this.string.slice(this.start, this.pos);},
    hideFirstChars: function(n, inner) {
      this.lineStart += n;
      try { return inner(); }
      finally { this.lineStart -= n; }
    }
  };

  // TEXTMARKERS

  // Created with markText and setBookmark methods. A TextMarker is a
  // handle that can be used to clear or find a marked position in the
  // document. Line objects hold arrays (markedSpans) containing
  // {from, to, marker} object pointing to such marker objects, and
  // indicating that such a marker is present on that line. Multiple
  // lines may point to the same marker when it spans across lines.
  // The spans will have null for their from/to properties when the
  // marker continues beyond the start/end of the line. Markers have
  // links back to the lines they currently touch.

  var nextMarkerId = 0;

  var TextMarker = CodeMirror.TextMarker = function(doc, type) {
    this.lines = [];
    this.type = type;
    this.doc = doc;
    this.id = ++nextMarkerId;
  };
  eventMixin(TextMarker);

  // Clear the marker.
  TextMarker.prototype.clear = function() {
    if (this.explicitlyCleared) return;
    var cm = this.doc.cm, withOp = cm && !cm.curOp;
    if (withOp) startOperation(cm);
    if (hasHandler(this, "clear")) {
      var found = this.find();
      if (found) signalLater(this, "clear", found.from, found.to);
    }
    var min = null, max = null;
    for (var i = 0; i < this.lines.length; ++i) {
      var line = this.lines[i];
      var span = getMarkedSpanFor(line.markedSpans, this);
      if (cm && !this.collapsed) regLineChange(cm, lineNo(line), "text");
      else if (cm) {
        if (span.to != null) max = lineNo(line);
        if (span.from != null) min = lineNo(line);
      }
      line.markedSpans = removeMarkedSpan(line.markedSpans, span);
      if (span.from == null && this.collapsed && !lineIsHidden(this.doc, line) && cm)
        updateLineHeight(line, textHeight(cm.display));
    }
    if (cm && this.collapsed && !cm.options.lineWrapping) for (var i = 0; i < this.lines.length; ++i) {
      var visual = visualLine(this.lines[i]), len = lineLength(visual);
      if (len > cm.display.maxLineLength) {
        cm.display.maxLine = visual;
        cm.display.maxLineLength = len;
        cm.display.maxLineChanged = true;
      }
    }

    if (min != null && cm && this.collapsed) regChange(cm, min, max + 1);
    this.lines.length = 0;
    this.explicitlyCleared = true;
    if (this.atomic && this.doc.cantEdit) {
      this.doc.cantEdit = false;
      if (cm) reCheckSelection(cm.doc);
    }
    if (cm) signalLater(cm, "markerCleared", cm, this);
    if (withOp) endOperation(cm);
    if (this.parent) this.parent.clear();
  };

  // Find the position of the marker in the document. Returns a {from,
  // to} object by default. Side can be passed to get a specific side
  // -- 0 (both), -1 (left), or 1 (right). When lineObj is true, the
  // Pos objects returned contain a line object, rather than a line
  // number (used to prevent looking up the same line twice).
  TextMarker.prototype.find = function(side, lineObj) {
    if (side == null && this.type == "bookmark") side = 1;
    var from, to;
    for (var i = 0; i < this.lines.length; ++i) {
      var line = this.lines[i];
      var span = getMarkedSpanFor(line.markedSpans, this);
      if (span.from != null) {
        from = Pos(lineObj ? line : lineNo(line), span.from);
        if (side == -1) return from;
      }
      if (span.to != null) {
        to = Pos(lineObj ? line : lineNo(line), span.to);
        if (side == 1) return to;
      }
    }
    return from && {from: from, to: to};
  };

  // Signals that the marker's widget changed, and surrounding layout
  // should be recomputed.
  TextMarker.prototype.changed = function() {
    var pos = this.find(-1, true), widget = this, cm = this.doc.cm;
    if (!pos || !cm) return;
    runInOp(cm, function() {
      var line = pos.line, lineN = lineNo(pos.line);
      var view = findViewForLine(cm, lineN);
      if (view) {
        clearLineMeasurementCacheFor(view);
        cm.curOp.selectionChanged = cm.curOp.forceUpdate = true;
      }
      cm.curOp.updateMaxLine = true;
      if (!lineIsHidden(widget.doc, line) && widget.height != null) {
        var oldHeight = widget.height;
        widget.height = null;
        var dHeight = widgetHeight(widget) - oldHeight;
        if (dHeight)
          updateLineHeight(line, line.height + dHeight);
      }
    });
  };

  TextMarker.prototype.attachLine = function(line) {
    if (!this.lines.length && this.doc.cm) {
      var op = this.doc.cm.curOp;
      if (!op.maybeHiddenMarkers || indexOf(op.maybeHiddenMarkers, this) == -1)
        (op.maybeUnhiddenMarkers || (op.maybeUnhiddenMarkers = [])).push(this);
    }
    this.lines.push(line);
  };
  TextMarker.prototype.detachLine = function(line) {
    this.lines.splice(indexOf(this.lines, line), 1);
    if (!this.lines.length && this.doc.cm) {
      var op = this.doc.cm.curOp;
      (op.maybeHiddenMarkers || (op.maybeHiddenMarkers = [])).push(this);
    }
  };

  // Collapsed markers have unique ids, in order to be able to order
  // them, which is needed for uniquely determining an outer marker
  // when they overlap (they may nest, but not partially overlap).
  var nextMarkerId = 0;

  // Create a marker, wire it up to the right lines, and
  function markText(doc, from, to, options, type) {
    // Shared markers (across linked documents) are handled separately
    // (markTextShared will call out to this again, once per
    // document).
    if (options && options.shared) return markTextShared(doc, from, to, options, type);
    // Ensure we are in an operation.
    if (doc.cm && !doc.cm.curOp) return operation(doc.cm, markText)(doc, from, to, options, type);

    var marker = new TextMarker(doc, type), diff = cmp(from, to);
    if (options) copyObj(options, marker, false);
    // Don't connect empty markers unless clearWhenEmpty is false
    if (diff > 0 || diff == 0 && marker.clearWhenEmpty !== false)
      return marker;
    if (marker.replacedWith) {
      // Showing up as a widget implies collapsed (widget replaces text)
      marker.collapsed = true;
      marker.widgetNode = elt("span", [marker.replacedWith], "CodeMirror-widget");
      if (!options.handleMouseEvents) marker.widgetNode.setAttribute("cm-ignore-events", "true");
      if (options.insertLeft) marker.widgetNode.insertLeft = true;
    }
    if (marker.collapsed) {
      if (conflictingCollapsedRange(doc, from.line, from, to, marker) ||
          from.line != to.line && conflictingCollapsedRange(doc, to.line, from, to, marker))
        throw new Error("Inserting collapsed marker partially overlapping an existing one");
      sawCollapsedSpans = true;
    }

    if (marker.addToHistory)
      addChangeToHistory(doc, {from: from, to: to, origin: "markText"}, doc.sel, NaN);

    var curLine = from.line, cm = doc.cm, updateMaxLine;
    doc.iter(curLine, to.line + 1, function(line) {
      if (cm && marker.collapsed && !cm.options.lineWrapping && visualLine(line) == cm.display.maxLine)
        updateMaxLine = true;
      if (marker.collapsed && curLine != from.line) updateLineHeight(line, 0);
      addMarkedSpan(line, new MarkedSpan(marker,
                                         curLine == from.line ? from.ch : null,
                                         curLine == to.line ? to.ch : null));
      ++curLine;
    });
    // lineIsHidden depends on the presence of the spans, so needs a second pass
    if (marker.collapsed) doc.iter(from.line, to.line + 1, function(line) {
      if (lineIsHidden(doc, line)) updateLineHeight(line, 0);
    });

    if (marker.clearOnEnter) on(marker, "beforeCursorEnter", function() { marker.clear(); });

    if (marker.readOnly) {
      sawReadOnlySpans = true;
      if (doc.history.done.length || doc.history.undone.length)
        doc.clearHistory();
    }
    if (marker.collapsed) {
      marker.id = ++nextMarkerId;
      marker.atomic = true;
    }
    if (cm) {
      // Sync editor state
      if (updateMaxLine) cm.curOp.updateMaxLine = true;
      if (marker.collapsed)
        regChange(cm, from.line, to.line + 1);
      else if (marker.className || marker.title || marker.startStyle || marker.endStyle || marker.css)
        for (var i = from.line; i <= to.line; i++) regLineChange(cm, i, "text");
      if (marker.atomic) reCheckSelection(cm.doc);
      signalLater(cm, "markerAdded", cm, marker);
    }
    return marker;
  }

  // SHARED TEXTMARKERS

  // A shared marker spans multiple linked documents. It is
  // implemented as a meta-marker-object controlling multiple normal
  // markers.
  var SharedTextMarker = CodeMirror.SharedTextMarker = function(markers, primary) {
    this.markers = markers;
    this.primary = primary;
    for (var i = 0; i < markers.length; ++i)
      markers[i].parent = this;
  };
  eventMixin(SharedTextMarker);

  SharedTextMarker.prototype.clear = function() {
    if (this.explicitlyCleared) return;
    this.explicitlyCleared = true;
    for (var i = 0; i < this.markers.length; ++i)
      this.markers[i].clear();
    signalLater(this, "clear");
  };
  SharedTextMarker.prototype.find = function(side, lineObj) {
    return this.primary.find(side, lineObj);
  };

  function markTextShared(doc, from, to, options, type) {
    options = copyObj(options);
    options.shared = false;
    var markers = [markText(doc, from, to, options, type)], primary = markers[0];
    var widget = options.widgetNode;
    linkedDocs(doc, function(doc) {
      if (widget) options.widgetNode = widget.cloneNode(true);
      markers.push(markText(doc, clipPos(doc, from), clipPos(doc, to), options, type));
      for (var i = 0; i < doc.linked.length; ++i)
        if (doc.linked[i].isParent) return;
      primary = lst(markers);
    });
    return new SharedTextMarker(markers, primary);
  }

  function findSharedMarkers(doc) {
    return doc.findMarks(Pos(doc.first, 0), doc.clipPos(Pos(doc.lastLine())),
                         function(m) { return m.parent; });
  }

  function copySharedMarkers(doc, markers) {
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i], pos = marker.find();
      var mFrom = doc.clipPos(pos.from), mTo = doc.clipPos(pos.to);
      if (cmp(mFrom, mTo)) {
        var subMark = markText(doc, mFrom, mTo, marker.primary, marker.primary.type);
        marker.markers.push(subMark);
        subMark.parent = marker;
      }
    }
  }

  function detachSharedMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i], linked = [marker.primary.doc];;
      linkedDocs(marker.primary.doc, function(d) { linked.push(d); });
      for (var j = 0; j < marker.markers.length; j++) {
        var subMarker = marker.markers[j];
        if (indexOf(linked, subMarker.doc) == -1) {
          subMarker.parent = null;
          marker.markers.splice(j--, 1);
        }
      }
    }
  }

  // TEXTMARKER SPANS

  function MarkedSpan(marker, from, to) {
    this.marker = marker;
    this.from = from; this.to = to;
  }

  // Search an array of spans for a span matching the given marker.
  function getMarkedSpanFor(spans, marker) {
    if (spans) for (var i = 0; i < spans.length; ++i) {
      var span = spans[i];
      if (span.marker == marker) return span;
    }
  }
  // Remove a span from an array, returning undefined if no spans are
  // left (we don't store arrays for lines without spans).
  function removeMarkedSpan(spans, span) {
    for (var r, i = 0; i < spans.length; ++i)
      if (spans[i] != span) (r || (r = [])).push(spans[i]);
    return r;
  }
  // Add a span to a line.
  function addMarkedSpan(line, span) {
    line.markedSpans = line.markedSpans ? line.markedSpans.concat([span]) : [span];
    span.marker.attachLine(line);
  }

  // Used for the algorithm that adjusts markers for a change in the
  // document. These functions cut an array of spans at a given
  // character position, returning an array of remaining chunks (or
  // undefined if nothing remains).
  function markedSpansBefore(old, startCh, isInsert) {
    if (old) for (var i = 0, nw; i < old.length; ++i) {
      var span = old[i], marker = span.marker;
      var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= startCh : span.from < startCh);
      if (startsBefore || span.from == startCh && marker.type == "bookmark" && (!isInsert || !span.marker.insertLeft)) {
        var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= startCh : span.to > startCh);
        (nw || (nw = [])).push(new MarkedSpan(marker, span.from, endsAfter ? null : span.to));
      }
    }
    return nw;
  }
  function markedSpansAfter(old, endCh, isInsert) {
    if (old) for (var i = 0, nw; i < old.length; ++i) {
      var span = old[i], marker = span.marker;
      var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= endCh : span.to > endCh);
      if (endsAfter || span.from == endCh && marker.type == "bookmark" && (!isInsert || span.marker.insertLeft)) {
        var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= endCh : span.from < endCh);
        (nw || (nw = [])).push(new MarkedSpan(marker, startsBefore ? null : span.from - endCh,
                                              span.to == null ? null : span.to - endCh));
      }
    }
    return nw;
  }

  // Given a change object, compute the new set of marker spans that
  // cover the line in which the change took place. Removes spans
  // entirely within the change, reconnects spans belonging to the
  // same marker that appear on both sides of the change, and cuts off
  // spans partially within the change. Returns an array of span
  // arrays with one element for each line in (after) the change.
  function stretchSpansOverChange(doc, change) {
    if (change.full) return null;
    var oldFirst = isLine(doc, change.from.line) && getLine(doc, change.from.line).markedSpans;
    var oldLast = isLine(doc, change.to.line) && getLine(doc, change.to.line).markedSpans;
    if (!oldFirst && !oldLast) return null;

    var startCh = change.from.ch, endCh = change.to.ch, isInsert = cmp(change.from, change.to) == 0;
    // Get the spans that 'stick out' on both sides
    var first = markedSpansBefore(oldFirst, startCh, isInsert);
    var last = markedSpansAfter(oldLast, endCh, isInsert);

    // Next, merge those two ends
    var sameLine = change.text.length == 1, offset = lst(change.text).length + (sameLine ? startCh : 0);
    if (first) {
      // Fix up .to properties of first
      for (var i = 0; i < first.length; ++i) {
        var span = first[i];
        if (span.to == null) {
          var found = getMarkedSpanFor(last, span.marker);
          if (!found) span.to = startCh;
          else if (sameLine) span.to = found.to == null ? null : found.to + offset;
        }
      }
    }
    if (last) {
      // Fix up .from in last (or move them into first in case of sameLine)
      for (var i = 0; i < last.length; ++i) {
        var span = last[i];
        if (span.to != null) span.to += offset;
        if (span.from == null) {
          var found = getMarkedSpanFor(first, span.marker);
          if (!found) {
            span.from = offset;
            if (sameLine) (first || (first = [])).push(span);
          }
        } else {
          span.from += offset;
          if (sameLine) (first || (first = [])).push(span);
        }
      }
    }
    // Make sure we didn't create any zero-length spans
    if (first) first = clearEmptySpans(first);
    if (last && last != first) last = clearEmptySpans(last);

    var newMarkers = [first];
    if (!sameLine) {
      // Fill gap with whole-line-spans
      var gap = change.text.length - 2, gapMarkers;
      if (gap > 0 && first)
        for (var i = 0; i < first.length; ++i)
          if (first[i].to == null)
            (gapMarkers || (gapMarkers = [])).push(new MarkedSpan(first[i].marker, null, null));
      for (var i = 0; i < gap; ++i)
        newMarkers.push(gapMarkers);
      newMarkers.push(last);
    }
    return newMarkers;
  }

  // Remove spans that are empty and don't have a clearWhenEmpty
  // option of false.
  function clearEmptySpans(spans) {
    for (var i = 0; i < spans.length; ++i) {
      var span = spans[i];
      if (span.from != null && span.from == span.to && span.marker.clearWhenEmpty !== false)
        spans.splice(i--, 1);
    }
    if (!spans.length) return null;
    return spans;
  }

  // Used for un/re-doing changes from the history. Combines the
  // result of computing the existing spans with the set of spans that
  // existed in the history (so that deleting around a span and then
  // undoing brings back the span).
  function mergeOldSpans(doc, change) {
    var old = getOldSpans(doc, change);
    var stretched = stretchSpansOverChange(doc, change);
    if (!old) return stretched;
    if (!stretched) return old;

    for (var i = 0; i < old.length; ++i) {
      var oldCur = old[i], stretchCur = stretched[i];
      if (oldCur && stretchCur) {
        spans: for (var j = 0; j < stretchCur.length; ++j) {
          var span = stretchCur[j];
          for (var k = 0; k < oldCur.length; ++k)
            if (oldCur[k].marker == span.marker) continue spans;
          oldCur.push(span);
        }
      } else if (stretchCur) {
        old[i] = stretchCur;
      }
    }
    return old;
  }

  // Used to 'clip' out readOnly ranges when making a change.
  function removeReadOnlyRanges(doc, from, to) {
    var markers = null;
    doc.iter(from.line, to.line + 1, function(line) {
      if (line.markedSpans) for (var i = 0; i < line.markedSpans.length; ++i) {
        var mark = line.markedSpans[i].marker;
        if (mark.readOnly && (!markers || indexOf(markers, mark) == -1))
          (markers || (markers = [])).push(mark);
      }
    });
    if (!markers) return null;
    var parts = [{from: from, to: to}];
    for (var i = 0; i < markers.length; ++i) {
      var mk = markers[i], m = mk.find(0);
      for (var j = 0; j < parts.length; ++j) {
        var p = parts[j];
        if (cmp(p.to, m.from) < 0 || cmp(p.from, m.to) > 0) continue;
        var newParts = [j, 1], dfrom = cmp(p.from, m.from), dto = cmp(p.to, m.to);
        if (dfrom < 0 || !mk.inclusiveLeft && !dfrom)
          newParts.push({from: p.from, to: m.from});
        if (dto > 0 || !mk.inclusiveRight && !dto)
          newParts.push({from: m.to, to: p.to});
        parts.splice.apply(parts, newParts);
        j += newParts.length - 1;
      }
    }
    return parts;
  }

  // Connect or disconnect spans from a line.
  function detachMarkedSpans(line) {
    var spans = line.markedSpans;
    if (!spans) return;
    for (var i = 0; i < spans.length; ++i)
      spans[i].marker.detachLine(line);
    line.markedSpans = null;
  }
  function attachMarkedSpans(line, spans) {
    if (!spans) return;
    for (var i = 0; i < spans.length; ++i)
      spans[i].marker.attachLine(line);
    line.markedSpans = spans;
  }

  // Helpers used when computing which overlapping collapsed span
  // counts as the larger one.
  function extraLeft(marker) { return marker.inclusiveLeft ? -1 : 0; }
  function extraRight(marker) { return marker.inclusiveRight ? 1 : 0; }

  // Returns a number indicating which of two overlapping collapsed
  // spans is larger (and thus includes the other). Falls back to
  // comparing ids when the spans cover exactly the same range.
  function compareCollapsedMarkers(a, b) {
    var lenDiff = a.lines.length - b.lines.length;
    if (lenDiff != 0) return lenDiff;
    var aPos = a.find(), bPos = b.find();
    var fromCmp = cmp(aPos.from, bPos.from) || extraLeft(a) - extraLeft(b);
    if (fromCmp) return -fromCmp;
    var toCmp = cmp(aPos.to, bPos.to) || extraRight(a) - extraRight(b);
    if (toCmp) return toCmp;
    return b.id - a.id;
  }

  // Find out whether a line ends or starts in a collapsed span. If
  // so, return the marker for that span.
  function collapsedSpanAtSide(line, start) {
    var sps = sawCollapsedSpans && line.markedSpans, found;
    if (sps) for (var sp, i = 0; i < sps.length; ++i) {
      sp = sps[i];
      if (sp.marker.collapsed && (start ? sp.from : sp.to) == null &&
          (!found || compareCollapsedMarkers(found, sp.marker) < 0))
        found = sp.marker;
    }
    return found;
  }
  function collapsedSpanAtStart(line) { return collapsedSpanAtSide(line, true); }
  function collapsedSpanAtEnd(line) { return collapsedSpanAtSide(line, false); }

  // Test whether there exists a collapsed span that partially
  // overlaps (covers the start or end, but not both) of a new span.
  // Such overlap is not allowed.
  function conflictingCollapsedRange(doc, lineNo, from, to, marker) {
    var line = getLine(doc, lineNo);
    var sps = sawCollapsedSpans && line.markedSpans;
    if (sps) for (var i = 0; i < sps.length; ++i) {
      var sp = sps[i];
      if (!sp.marker.collapsed) continue;
      var found = sp.marker.find(0);
      var fromCmp = cmp(found.from, from) || extraLeft(sp.marker) - extraLeft(marker);
      var toCmp = cmp(found.to, to) || extraRight(sp.marker) - extraRight(marker);
      if (fromCmp >= 0 && toCmp <= 0 || fromCmp <= 0 && toCmp >= 0) continue;
      if (fromCmp <= 0 && (cmp(found.to, from) > 0 || (sp.marker.inclusiveRight && marker.inclusiveLeft)) ||
          fromCmp >= 0 && (cmp(found.from, to) < 0 || (sp.marker.inclusiveLeft && marker.inclusiveRight)))
        return true;
    }
  }

  // A visual line is a line as drawn on the screen. Folding, for
  // example, can cause multiple logical lines to appear on the same
  // visual line. This finds the start of the visual line that the
  // given line is part of (usually that is the line itself).
  function visualLine(line) {
    var merged;
    while (merged = collapsedSpanAtStart(line))
      line = merged.find(-1, true).line;
    return line;
  }

  // Returns an array of logical lines that continue the visual line
  // started by the argument, or undefined if there are no such lines.
  function visualLineContinued(line) {
    var merged, lines;
    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line;
      (lines || (lines = [])).push(line);
    }
    return lines;
  }

  // Get the line number of the start of the visual line that the
  // given line number is part of.
  function visualLineNo(doc, lineN) {
    var line = getLine(doc, lineN), vis = visualLine(line);
    if (line == vis) return lineN;
    return lineNo(vis);
  }
  // Get the line number of the start of the next visual line after
  // the given line.
  function visualLineEndNo(doc, lineN) {
    if (lineN > doc.lastLine()) return lineN;
    var line = getLine(doc, lineN), merged;
    if (!lineIsHidden(doc, line)) return lineN;
    while (merged = collapsedSpanAtEnd(line))
      line = merged.find(1, true).line;
    return lineNo(line) + 1;
  }

  // Compute whether a line is hidden. Lines count as hidden when they
  // are part of a visual line that starts with another line, or when
  // they are entirely covered by collapsed, non-widget span.
  function lineIsHidden(doc, line) {
    var sps = sawCollapsedSpans && line.markedSpans;
    if (sps) for (var sp, i = 0; i < sps.length; ++i) {
      sp = sps[i];
      if (!sp.marker.collapsed) continue;
      if (sp.from == null) return true;
      if (sp.marker.widgetNode) continue;
      if (sp.from == 0 && sp.marker.inclusiveLeft && lineIsHiddenInner(doc, line, sp))
        return true;
    }
  }
  function lineIsHiddenInner(doc, line, span) {
    if (span.to == null) {
      var end = span.marker.find(1, true);
      return lineIsHiddenInner(doc, end.line, getMarkedSpanFor(end.line.markedSpans, span.marker));
    }
    if (span.marker.inclusiveRight && span.to == line.text.length)
      return true;
    for (var sp, i = 0; i < line.markedSpans.length; ++i) {
      sp = line.markedSpans[i];
      if (sp.marker.collapsed && !sp.marker.widgetNode && sp.from == span.to &&
          (sp.to == null || sp.to != span.from) &&
          (sp.marker.inclusiveLeft || span.marker.inclusiveRight) &&
          lineIsHiddenInner(doc, line, sp)) return true;
    }
  }

  // LINE WIDGETS

  // Line widgets are block elements displayed above or below a line.

  var LineWidget = CodeMirror.LineWidget = function(doc, node, options) {
    if (options) for (var opt in options) if (options.hasOwnProperty(opt))
      this[opt] = options[opt];
    this.doc = doc;
    this.node = node;
  };
  eventMixin(LineWidget);

  function adjustScrollWhenAboveVisible(cm, line, diff) {
    if (heightAtLine(line) < ((cm.curOp && cm.curOp.scrollTop) || cm.doc.scrollTop))
      addToScrollPos(cm, null, diff);
  }

  LineWidget.prototype.clear = function() {
    var cm = this.doc.cm, ws = this.line.widgets, line = this.line, no = lineNo(line);
    if (no == null || !ws) return;
    for (var i = 0; i < ws.length; ++i) if (ws[i] == this) ws.splice(i--, 1);
    if (!ws.length) line.widgets = null;
    var height = widgetHeight(this);
    updateLineHeight(line, Math.max(0, line.height - height));
    if (cm) runInOp(cm, function() {
      adjustScrollWhenAboveVisible(cm, line, -height);
      regLineChange(cm, no, "widget");
    });
  };
  LineWidget.prototype.changed = function() {
    var oldH = this.height, cm = this.doc.cm, line = this.line;
    this.height = null;
    var diff = widgetHeight(this) - oldH;
    if (!diff) return;
    updateLineHeight(line, line.height + diff);
    if (cm) runInOp(cm, function() {
      cm.curOp.forceUpdate = true;
      adjustScrollWhenAboveVisible(cm, line, diff);
    });
  };

  function widgetHeight(widget) {
    if (widget.height != null) return widget.height;
    var cm = widget.doc.cm;
    if (!cm) return 0;
    if (!contains(document.body, widget.node)) {
      var parentStyle = "position: relative;";
      if (widget.coverGutter)
        parentStyle += "margin-left: -" + cm.display.gutters.offsetWidth + "px;";
      if (widget.noHScroll)
        parentStyle += "width: " + cm.display.wrapper.clientWidth + "px;";
      removeChildrenAndAdd(cm.display.measure, elt("div", [widget.node], null, parentStyle));
    }
    return widget.height = widget.node.parentNode.offsetHeight;
  }

  function addLineWidget(doc, handle, node, options) {
    var widget = new LineWidget(doc, node, options);
    var cm = doc.cm;
    if (cm && widget.noHScroll) cm.display.alignWidgets = true;
    changeLine(doc, handle, "widget", function(line) {
      var widgets = line.widgets || (line.widgets = []);
      if (widget.insertAt == null) widgets.push(widget);
      else widgets.splice(Math.min(widgets.length - 1, Math.max(0, widget.insertAt)), 0, widget);
      widget.line = line;
      if (cm && !lineIsHidden(doc, line)) {
        var aboveVisible = heightAtLine(line) < doc.scrollTop;
        updateLineHeight(line, line.height + widgetHeight(widget));
        if (aboveVisible) addToScrollPos(cm, null, widget.height);
        cm.curOp.forceUpdate = true;
      }
      return true;
    });
    return widget;
  }

  // LINE DATA STRUCTURE

  // Line objects. These hold state related to a line, including
  // highlighting info (the styles array).
  var Line = CodeMirror.Line = function(text, markedSpans, estimateHeight) {
    this.text = text;
    attachMarkedSpans(this, markedSpans);
    this.height = estimateHeight ? estimateHeight(this) : 1;
  };
  eventMixin(Line);
  Line.prototype.lineNo = function() { return lineNo(this); };

  // Change the content (text, markers) of a line. Automatically
  // invalidates cached information and tries to re-estimate the
  // line's height.
  function updateLine(line, text, markedSpans, estimateHeight) {
    line.text = text;
    if (line.stateAfter) line.stateAfter = null;
    if (line.styles) line.styles = null;
    if (line.order != null) line.order = null;
    detachMarkedSpans(line);
    attachMarkedSpans(line, markedSpans);
    var estHeight = estimateHeight ? estimateHeight(line) : 1;
    if (estHeight != line.height) updateLineHeight(line, estHeight);
  }

  // Detach a line from the document tree and its markers.
  function cleanUpLine(line) {
    line.parent = null;
    detachMarkedSpans(line);
  }

  function extractLineClasses(type, output) {
    if (type) for (;;) {
      var lineClass = type.match(/(?:^|\s+)line-(background-)?(\S+)/);
      if (!lineClass) break;
      type = type.slice(0, lineClass.index) + type.slice(lineClass.index + lineClass[0].length);
      var prop = lineClass[1] ? "bgClass" : "textClass";
      if (output[prop] == null)
        output[prop] = lineClass[2];
      else if (!(new RegExp("(?:^|\s)" + lineClass[2] + "(?:$|\s)")).test(output[prop]))
        output[prop] += " " + lineClass[2];
    }
    return type;
  }

  function callBlankLine(mode, state) {
    if (mode.blankLine) return mode.blankLine(state);
    if (!mode.innerMode) return;
    var inner = CodeMirror.innerMode(mode, state);
    if (inner.mode.blankLine) return inner.mode.blankLine(inner.state);
  }

  function readToken(mode, stream, state, inner) {
    for (var i = 0; i < 10; i++) {
      if (inner) inner[0] = CodeMirror.innerMode(mode, state).mode;
      var style = mode.token(stream, state);
      if (stream.pos > stream.start) return style;
    }
    throw new Error("Mode " + mode.name + " failed to advance stream.");
  }

  // Utility for getTokenAt and getLineTokens
  function takeToken(cm, pos, precise, asArray) {
    function getObj(copy) {
      return {start: stream.start, end: stream.pos,
              string: stream.current(),
              type: style || null,
              state: copy ? copyState(doc.mode, state) : state};
    }

    var doc = cm.doc, mode = doc.mode, style;
    pos = clipPos(doc, pos);
    var line = getLine(doc, pos.line), state = getStateBefore(cm, pos.line, precise);
    var stream = new StringStream(line.text, cm.options.tabSize), tokens;
    if (asArray) tokens = [];
    while ((asArray || stream.pos < pos.ch) && !stream.eol()) {
      stream.start = stream.pos;
      style = readToken(mode, stream, state);
      if (asArray) tokens.push(getObj(true));
    }
    return asArray ? tokens : getObj();
  }

  // Run the given mode's parser over a line, calling f for each token.
  function runMode(cm, text, mode, state, f, lineClasses, forceToEnd) {
    var flattenSpans = mode.flattenSpans;
    if (flattenSpans == null) flattenSpans = cm.options.flattenSpans;
    var curStart = 0, curStyle = null;
    var stream = new StringStream(text, cm.options.tabSize), style;
    var inner = cm.options.addModeClass && [null];
    if (text == "") extractLineClasses(callBlankLine(mode, state), lineClasses);
    while (!stream.eol()) {
      if (stream.pos > cm.options.maxHighlightLength) {
        flattenSpans = false;
        if (forceToEnd) processLine(cm, text, state, stream.pos);
        stream.pos = text.length;
        style = null;
      } else {
        style = extractLineClasses(readToken(mode, stream, state, inner), lineClasses);
      }
      if (inner) {
        var mName = inner[0].name;
        if (mName) style = "m-" + (style ? mName + " " + style : mName);
      }
      if (!flattenSpans || curStyle != style) {
        while (curStart < stream.start) {
          curStart = Math.min(stream.start, curStart + 50000);
          f(curStart, curStyle);
        }
        curStyle = style;
      }
      stream.start = stream.pos;
    }
    while (curStart < stream.pos) {
      // Webkit seems to refuse to render text nodes longer than 57444 characters
      var pos = Math.min(stream.pos, curStart + 50000);
      f(pos, curStyle);
      curStart = pos;
    }
  }

  // Compute a style array (an array starting with a mode generation
  // -- for invalidation -- followed by pairs of end positions and
  // style strings), which is used to highlight the tokens on the
  // line.
  function highlightLine(cm, line, state, forceToEnd) {
    // A styles array always starts with a number identifying the
    // mode/overlays that it is based on (for easy invalidation).
    var st = [cm.state.modeGen], lineClasses = {};
    // Compute the base array of styles
    runMode(cm, line.text, cm.doc.mode, state, function(end, style) {
      st.push(end, style);
    }, lineClasses, forceToEnd);

    // Run overlays, adjust style array.
    for (var o = 0; o < cm.state.overlays.length; ++o) {
      var overlay = cm.state.overlays[o], i = 1, at = 0;
      runMode(cm, line.text, overlay.mode, true, function(end, style) {
        var start = i;
        // Ensure there's a token end at the current position, and that i points at it
        while (at < end) {
          var i_end = st[i];
          if (i_end > end)
            st.splice(i, 1, end, st[i+1], i_end);
          i += 2;
          at = Math.min(end, i_end);
        }
        if (!style) return;
        if (overlay.opaque) {
          st.splice(start, i - start, end, "cm-overlay " + style);
          i = start + 2;
        } else {
          for (; start < i; start += 2) {
            var cur = st[start+1];
            st[start+1] = (cur ? cur + " " : "") + "cm-overlay " + style;
          }
        }
      }, lineClasses);
    }

    return {styles: st, classes: lineClasses.bgClass || lineClasses.textClass ? lineClasses : null};
  }

  function getLineStyles(cm, line, updateFrontier) {
    if (!line.styles || line.styles[0] != cm.state.modeGen) {
      var state = getStateBefore(cm, lineNo(line));
      var result = highlightLine(cm, line, line.text.length > cm.options.maxHighlightLength ? copyState(cm.doc.mode, state) : state);
      line.stateAfter = state;
      line.styles = result.styles;
      if (result.classes) line.styleClasses = result.classes;
      else if (line.styleClasses) line.styleClasses = null;
      if (updateFrontier === cm.doc.frontier) cm.doc.frontier++;
    }
    return line.styles;
  }

  // Lightweight form of highlight -- proceed over this line and
  // update state, but don't save a style array. Used for lines that
  // aren't currently visible.
  function processLine(cm, text, state, startAt) {
    var mode = cm.doc.mode;
    var stream = new StringStream(text, cm.options.tabSize);
    stream.start = stream.pos = startAt || 0;
    if (text == "") callBlankLine(mode, state);
    while (!stream.eol()) {
      readToken(mode, stream, state);
      stream.start = stream.pos;
    }
  }

  // Convert a style as returned by a mode (either null, or a string
  // containing one or more styles) to a CSS style. This is cached,
  // and also looks for line-wide styles.
  var styleToClassCache = {}, styleToClassCacheWithMode = {};
  function interpretTokenStyle(style, options) {
    if (!style || /^\s*$/.test(style)) return null;
    var cache = options.addModeClass ? styleToClassCacheWithMode : styleToClassCache;
    return cache[style] ||
      (cache[style] = style.replace(/\S+/g, "cm-$&"));
  }

  // Render the DOM representation of the text of a line. Also builds
  // up a 'line map', which points at the DOM nodes that represent
  // specific stretches of text, and is used by the measuring code.
  // The returned object contains the DOM node, this map, and
  // information about line-wide styles that were set by the mode.
  function buildLineContent(cm, lineView) {
    // The padding-right forces the element to have a 'border', which
    // is needed on Webkit to be able to get line-level bounding
    // rectangles for it (in measureChar).
    var content = elt("span", null, null, webkit ? "padding-right: .1px" : null);
    var builder = {pre: elt("pre", [content], "CodeMirror-line"), content: content,
                   col: 0, pos: 0, cm: cm,
                   splitSpaces: (ie || webkit) && cm.getOption("lineWrapping")};
    lineView.measure = {};

    // Iterate over the logical lines that make up this visual line.
    for (var i = 0; i <= (lineView.rest ? lineView.rest.length : 0); i++) {
      var line = i ? lineView.rest[i - 1] : lineView.line, order;
      builder.pos = 0;
      builder.addToken = buildToken;
      // Optionally wire in some hacks into the token-rendering
      // algorithm, to deal with browser quirks.
      if (hasBadBidiRects(cm.display.measure) && (order = getOrder(line)))
        builder.addToken = buildTokenBadBidi(builder.addToken, order);
      builder.map = [];
      var allowFrontierUpdate = lineView != cm.display.externalMeasured && lineNo(line);
      insertLineContent(line, builder, getLineStyles(cm, line, allowFrontierUpdate));
      if (line.styleClasses) {
        if (line.styleClasses.bgClass)
          builder.bgClass = joinClasses(line.styleClasses.bgClass, builder.bgClass || "");
        if (line.styleClasses.textClass)
          builder.textClass = joinClasses(line.styleClasses.textClass, builder.textClass || "");
      }

      // Ensure at least a single node is present, for measuring.
      if (builder.map.length == 0)
        builder.map.push(0, 0, builder.content.appendChild(zeroWidthElement(cm.display.measure)));

      // Store the map and a cache object for the current logical line
      if (i == 0) {
        lineView.measure.map = builder.map;
        lineView.measure.cache = {};
      } else {
        (lineView.measure.maps || (lineView.measure.maps = [])).push(builder.map);
        (lineView.measure.caches || (lineView.measure.caches = [])).push({});
      }
    }

    // See issue #2901
    if (webkit && /\bcm-tab\b/.test(builder.content.lastChild.className))
      builder.content.className = "cm-tab-wrap-hack";

    signal(cm, "renderLine", cm, lineView.line, builder.pre);
    if (builder.pre.className)
      builder.textClass = joinClasses(builder.pre.className, builder.textClass || "");

    return builder;
  }

  function defaultSpecialCharPlaceholder(ch) {
    var token = elt("span", "\u2022", "cm-invalidchar");
    token.title = "\\u" + ch.charCodeAt(0).toString(16);
    token.setAttribute("aria-label", token.title);
    return token;
  }

  // Build up the DOM representation for a single token, and add it to
  // the line map. Takes care to render special characters separately.
  function buildToken(builder, text, style, startStyle, endStyle, title, css) {
    if (!text) return;
    var displayText = builder.splitSpaces ? text.replace(/ {3,}/g, splitSpaces) : text;
    var special = builder.cm.state.specialChars, mustWrap = false;
    if (!special.test(text)) {
      builder.col += text.length;
      var content = document.createTextNode(displayText);
      builder.map.push(builder.pos, builder.pos + text.length, content);
      if (ie && ie_version < 9) mustWrap = true;
      builder.pos += text.length;
    } else {
      var content = document.createDocumentFragment(), pos = 0;
      while (true) {
        special.lastIndex = pos;
        var m = special.exec(text);
        var skipped = m ? m.index - pos : text.length - pos;
        if (skipped) {
          var txt = document.createTextNode(displayText.slice(pos, pos + skipped));
          if (ie && ie_version < 9) content.appendChild(elt("span", [txt]));
          else content.appendChild(txt);
          builder.map.push(builder.pos, builder.pos + skipped, txt);
          builder.col += skipped;
          builder.pos += skipped;
        }
        if (!m) break;
        pos += skipped + 1;
        if (m[0] == "\t") {
          var tabSize = builder.cm.options.tabSize, tabWidth = tabSize - builder.col % tabSize;
          var txt = content.appendChild(elt("span", spaceStr(tabWidth), "cm-tab"));
          txt.setAttribute("role", "presentation");
          txt.setAttribute("cm-text", "\t");
          builder.col += tabWidth;
        } else if (m[0] == "\r" || m[0] == "\n") {
          var txt = content.appendChild(elt("span", m[0] == "\r" ? "\u240d" : "\u2424", "cm-invalidchar"));
          txt.setAttribute("cm-text", m[0]);
          builder.col += 1;
        } else {
          var txt = builder.cm.options.specialCharPlaceholder(m[0]);
          txt.setAttribute("cm-text", m[0]);
          if (ie && ie_version < 9) content.appendChild(elt("span", [txt]));
          else content.appendChild(txt);
          builder.col += 1;
        }
        builder.map.push(builder.pos, builder.pos + 1, txt);
        builder.pos++;
      }
    }
    if (style || startStyle || endStyle || mustWrap || css) {
      var fullStyle = style || "";
      if (startStyle) fullStyle += startStyle;
      if (endStyle) fullStyle += endStyle;
      var token = elt("span", [content], fullStyle, css);
      if (title) token.title = title;
      return builder.content.appendChild(token);
    }
    builder.content.appendChild(content);
  }

  function splitSpaces(old) {
    var out = " ";
    for (var i = 0; i < old.length - 2; ++i) out += i % 2 ? " " : "\u00a0";
    out += " ";
    return out;
  }

  // Work around nonsense dimensions being reported for stretches of
  // right-to-left text.
  function buildTokenBadBidi(inner, order) {
    return function(builder, text, style, startStyle, endStyle, title, css) {
      style = style ? style + " cm-force-border" : "cm-force-border";
      var start = builder.pos, end = start + text.length;
      for (;;) {
        // Find the part that overlaps with the start of this text
        for (var i = 0; i < order.length; i++) {
          var part = order[i];
          if (part.to > start && part.from <= start) break;
        }
        if (part.to >= end) return inner(builder, text, style, startStyle, endStyle, title, css);
        inner(builder, text.slice(0, part.to - start), style, startStyle, null, title, css);
        startStyle = null;
        text = text.slice(part.to - start);
        start = part.to;
      }
    };
  }

  function buildCollapsedSpan(builder, size, marker, ignoreWidget) {
    var widget = !ignoreWidget && marker.widgetNode;
    if (widget) builder.map.push(builder.pos, builder.pos + size, widget);
    if (!ignoreWidget && builder.cm.display.input.needsContentAttribute) {
      if (!widget)
        widget = builder.content.appendChild(document.createElement("span"));
      widget.setAttribute("cm-marker", marker.id);
    }
    if (widget) {
      builder.cm.display.input.setUneditable(widget);
      builder.content.appendChild(widget);
    }
    builder.pos += size;
  }

  // Outputs a number of spans to make up a line, taking highlighting
  // and marked text into account.
  function insertLineContent(line, builder, styles) {
    var spans = line.markedSpans, allText = line.text, at = 0;
    if (!spans) {
      for (var i = 1; i < styles.length; i+=2)
        builder.addToken(builder, allText.slice(at, at = styles[i]), interpretTokenStyle(styles[i+1], builder.cm.options));
      return;
    }

    var len = allText.length, pos = 0, i = 1, text = "", style, css;
    var nextChange = 0, spanStyle, spanEndStyle, spanStartStyle, title, collapsed;
    for (;;) {
      if (nextChange == pos) { // Update current marker set
        spanStyle = spanEndStyle = spanStartStyle = title = css = "";
        collapsed = null; nextChange = Infinity;
        var foundBookmarks = [], endStyles
        for (var j = 0; j < spans.length; ++j) {
          var sp = spans[j], m = sp.marker;
          if (m.type == "bookmark" && sp.from == pos && m.widgetNode) {
            foundBookmarks.push(m);
          } else if (sp.from <= pos && (sp.to == null || sp.to > pos || m.collapsed && sp.to == pos && sp.from == pos)) {
            if (sp.to != null && sp.to != pos && nextChange > sp.to) {
              nextChange = sp.to;
              spanEndStyle = "";
            }
            if (m.className) spanStyle += " " + m.className;
            if (m.css) css = (css ? css + ";" : "") + m.css;
            if (m.startStyle && sp.from == pos) spanStartStyle += " " + m.startStyle;
            if (m.endStyle && sp.to == nextChange) (endStyles || (endStyles = [])).push(m.endStyle, sp.to)
            if (m.title && !title) title = m.title;
            if (m.collapsed && (!collapsed || compareCollapsedMarkers(collapsed.marker, m) < 0))
              collapsed = sp;
          } else if (sp.from > pos && nextChange > sp.from) {
            nextChange = sp.from;
          }
        }
        if (endStyles) for (var j = 0; j < endStyles.length; j += 2)
          if (endStyles[j + 1] == nextChange) spanEndStyle += " " + endStyles[j]

        if (collapsed && (collapsed.from || 0) == pos) {
          buildCollapsedSpan(builder, (collapsed.to == null ? len + 1 : collapsed.to) - pos,
                             collapsed.marker, collapsed.from == null);
          if (collapsed.to == null) return;
          if (collapsed.to == pos) collapsed = false;
        }
        if (!collapsed && foundBookmarks.length) for (var j = 0; j < foundBookmarks.length; ++j)
          buildCollapsedSpan(builder, 0, foundBookmarks[j]);
      }
      if (pos >= len) break;

      var upto = Math.min(len, nextChange);
      while (true) {
        if (text) {
          var end = pos + text.length;
          if (!collapsed) {
            var tokenText = end > upto ? text.slice(0, upto - pos) : text;
            builder.addToken(builder, tokenText, style ? style + spanStyle : spanStyle,
                             spanStartStyle, pos + tokenText.length == nextChange ? spanEndStyle : "", title, css);
          }
          if (end >= upto) {text = text.slice(upto - pos); pos = upto; break;}
          pos = end;
          spanStartStyle = "";
        }
        text = allText.slice(at, at = styles[i++]);
        style = interpretTokenStyle(styles[i++], builder.cm.options);
      }
    }
  }

  // DOCUMENT DATA STRUCTURE

  // By default, updates that start and end at the beginning of a line
  // are treated specially, in order to make the association of line
  // widgets and marker elements with the text behave more intuitive.
  function isWholeLineUpdate(doc, change) {
    return change.from.ch == 0 && change.to.ch == 0 && lst(change.text) == "" &&
      (!doc.cm || doc.cm.options.wholeLineUpdateBefore);
  }

  // Perform a change on the document data structure.
  function updateDoc(doc, change, markedSpans, estimateHeight) {
    function spansFor(n) {return markedSpans ? markedSpans[n] : null;}
    function update(line, text, spans) {
      updateLine(line, text, spans, estimateHeight);
      signalLater(line, "change", line, change);
    }
    function linesFor(start, end) {
      for (var i = start, result = []; i < end; ++i)
        result.push(new Line(text[i], spansFor(i), estimateHeight));
      return result;
    }

    var from = change.from, to = change.to, text = change.text;
    var firstLine = getLine(doc, from.line), lastLine = getLine(doc, to.line);
    var lastText = lst(text), lastSpans = spansFor(text.length - 1), nlines = to.line - from.line;

    // Adjust the line structure
    if (change.full) {
      doc.insert(0, linesFor(0, text.length));
      doc.remove(text.length, doc.size - text.length);
    } else if (isWholeLineUpdate(doc, change)) {
      // This is a whole-line replace. Treated specially to make
      // sure line objects move the way they are supposed to.
      var added = linesFor(0, text.length - 1);
      update(lastLine, lastLine.text, lastSpans);
      if (nlines) doc.remove(from.line, nlines);
      if (added.length) doc.insert(from.line, added);
    } else if (firstLine == lastLine) {
      if (text.length == 1) {
        update(firstLine, firstLine.text.slice(0, from.ch) + lastText + firstLine.text.slice(to.ch), lastSpans);
      } else {
        var added = linesFor(1, text.length - 1);
        added.push(new Line(lastText + firstLine.text.slice(to.ch), lastSpans, estimateHeight));
        update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
        doc.insert(from.line + 1, added);
      }
    } else if (text.length == 1) {
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0] + lastLine.text.slice(to.ch), spansFor(0));
      doc.remove(from.line + 1, nlines);
    } else {
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
      update(lastLine, lastText + lastLine.text.slice(to.ch), lastSpans);
      var added = linesFor(1, text.length - 1);
      if (nlines > 1) doc.remove(from.line + 1, nlines - 1);
      doc.insert(from.line + 1, added);
    }

    signalLater(doc, "change", doc, change);
  }

  // The document is represented as a BTree consisting of leaves, with
  // chunk of lines in them, and branches, with up to ten leaves or
  // other branch nodes below them. The top node is always a branch
  // node, and is the document object itself (meaning it has
  // additional methods and properties).
  //
  // All nodes have parent links. The tree is used both to go from
  // line numbers to line objects, and to go from objects to numbers.
  // It also indexes by height, and is used to convert between height
  // and line object, and to find the total height of the document.
  //
  // See also http://marijnhaverbeke.nl/blog/codemirror-line-tree.html

  function LeafChunk(lines) {
    this.lines = lines;
    this.parent = null;
    for (var i = 0, height = 0; i < lines.length; ++i) {
      lines[i].parent = this;
      height += lines[i].height;
    }
    this.height = height;
  }

  LeafChunk.prototype = {
    chunkSize: function() { return this.lines.length; },
    // Remove the n lines at offset 'at'.
    removeInner: function(at, n) {
      for (var i = at, e = at + n; i < e; ++i) {
        var line = this.lines[i];
        this.height -= line.height;
        cleanUpLine(line);
        signalLater(line, "delete");
      }
      this.lines.splice(at, n);
    },
    // Helper used to collapse a small branch into a single leaf.
    collapse: function(lines) {
      lines.push.apply(lines, this.lines);
    },
    // Insert the given array of lines at offset 'at', count them as
    // having the given height.
    insertInner: function(at, lines, height) {
      this.height += height;
      this.lines = this.lines.slice(0, at).concat(lines).concat(this.lines.slice(at));
      for (var i = 0; i < lines.length; ++i) lines[i].parent = this;
    },
    // Used to iterate over a part of the tree.
    iterN: function(at, n, op) {
      for (var e = at + n; at < e; ++at)
        if (op(this.lines[at])) return true;
    }
  };

  function BranchChunk(children) {
    this.children = children;
    var size = 0, height = 0;
    for (var i = 0; i < children.length; ++i) {
      var ch = children[i];
      size += ch.chunkSize(); height += ch.height;
      ch.parent = this;
    }
    this.size = size;
    this.height = height;
    this.parent = null;
  }

  BranchChunk.prototype = {
    chunkSize: function() { return this.size; },
    removeInner: function(at, n) {
      this.size -= n;
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at < sz) {
          var rm = Math.min(n, sz - at), oldHeight = child.height;
          child.removeInner(at, rm);
          this.height -= oldHeight - child.height;
          if (sz == rm) { this.children.splice(i--, 1); child.parent = null; }
          if ((n -= rm) == 0) break;
          at = 0;
        } else at -= sz;
      }
      // If the result is smaller than 25 lines, ensure that it is a
      // single leaf node.
      if (this.size - n < 25 &&
          (this.children.length > 1 || !(this.children[0] instanceof LeafChunk))) {
        var lines = [];
        this.collapse(lines);
        this.children = [new LeafChunk(lines)];
        this.children[0].parent = this;
      }
    },
    collapse: function(lines) {
      for (var i = 0; i < this.children.length; ++i) this.children[i].collapse(lines);
    },
    insertInner: function(at, lines, height) {
      this.size += lines.length;
      this.height += height;
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at <= sz) {
          child.insertInner(at, lines, height);
          if (child.lines && child.lines.length > 50) {
            while (child.lines.length > 50) {
              var spilled = child.lines.splice(child.lines.length - 25, 25);
              var newleaf = new LeafChunk(spilled);
              child.height -= newleaf.height;
              this.children.splice(i + 1, 0, newleaf);
              newleaf.parent = this;
            }
            this.maybeSpill();
          }
          break;
        }
        at -= sz;
      }
    },
    // When a node has grown, check whether it should be split.
    maybeSpill: function() {
      if (this.children.length <= 10) return;
      var me = this;
      do {
        var spilled = me.children.splice(me.children.length - 5, 5);
        var sibling = new BranchChunk(spilled);
        if (!me.parent) { // Become the parent node
          var copy = new BranchChunk(me.children);
          copy.parent = me;
          me.children = [copy, sibling];
          me = copy;
        } else {
          me.size -= sibling.size;
          me.height -= sibling.height;
          var myIndex = indexOf(me.parent.children, me);
          me.parent.children.splice(myIndex + 1, 0, sibling);
        }
        sibling.parent = me.parent;
      } while (me.children.length > 10);
      me.parent.maybeSpill();
    },
    iterN: function(at, n, op) {
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at < sz) {
          var used = Math.min(n, sz - at);
          if (child.iterN(at, used, op)) return true;
          if ((n -= used) == 0) break;
          at = 0;
        } else at -= sz;
      }
    }
  };

  var nextDocId = 0;
  var Doc = CodeMirror.Doc = function(text, mode, firstLine, lineSep) {
    if (!(this instanceof Doc)) return new Doc(text, mode, firstLine, lineSep);
    if (firstLine == null) firstLine = 0;

    BranchChunk.call(this, [new LeafChunk([new Line("", null)])]);
    this.first = firstLine;
    this.scrollTop = this.scrollLeft = 0;
    this.cantEdit = false;
    this.cleanGeneration = 1;
    this.frontier = firstLine;
    var start = Pos(firstLine, 0);
    this.sel = simpleSelection(start);
    this.history = new History(null);
    this.id = ++nextDocId;
    this.modeOption = mode;
    this.lineSep = lineSep;
    this.extend = false;

    if (typeof text == "string") text = this.splitLines(text);
    updateDoc(this, {from: start, to: start, text: text});
    setSelection(this, simpleSelection(start), sel_dontScroll);
  };

  Doc.prototype = createObj(BranchChunk.prototype, {
    constructor: Doc,
    // Iterate over the document. Supports two forms -- with only one
    // argument, it calls that for each line in the document. With
    // three, it iterates over the range given by the first two (with
    // the second being non-inclusive).
    iter: function(from, to, op) {
      if (op) this.iterN(from - this.first, to - from, op);
      else this.iterN(this.first, this.first + this.size, from);
    },

    // Non-public interface for adding and removing lines.
    insert: function(at, lines) {
      var height = 0;
      for (var i = 0; i < lines.length; ++i) height += lines[i].height;
      this.insertInner(at - this.first, lines, height);
    },
    remove: function(at, n) { this.removeInner(at - this.first, n); },

    // From here, the methods are part of the public interface. Most
    // are also available from CodeMirror (editor) instances.

    getValue: function(lineSep) {
      var lines = getLines(this, this.first, this.first + this.size);
      if (lineSep === false) return lines;
      return lines.join(lineSep || this.lineSeparator());
    },
    setValue: docMethodOp(function(code) {
      var top = Pos(this.first, 0), last = this.first + this.size - 1;
      makeChange(this, {from: top, to: Pos(last, getLine(this, last).text.length),
                        text: this.splitLines(code), origin: "setValue", full: true}, true);
      setSelection(this, simpleSelection(top));
    }),
    replaceRange: function(code, from, to, origin) {
      from = clipPos(this, from);
      to = to ? clipPos(this, to) : from;
      replaceRange(this, code, from, to, origin);
    },
    getRange: function(from, to, lineSep) {
      var lines = getBetween(this, clipPos(this, from), clipPos(this, to));
      if (lineSep === false) return lines;
      return lines.join(lineSep || this.lineSeparator());
    },

    getLine: function(line) {var l = this.getLineHandle(line); return l && l.text;},

    getLineHandle: function(line) {if (isLine(this, line)) return getLine(this, line);},
    getLineNumber: function(line) {return lineNo(line);},

    getLineHandleVisualStart: function(line) {
      if (typeof line == "number") line = getLine(this, line);
      return visualLine(line);
    },

    lineCount: function() {return this.size;},
    firstLine: function() {return this.first;},
    lastLine: function() {return this.first + this.size - 1;},

    clipPos: function(pos) {return clipPos(this, pos);},

    getCursor: function(start) {
      var range = this.sel.primary(), pos;
      if (start == null || start == "head") pos = range.head;
      else if (start == "anchor") pos = range.anchor;
      else if (start == "end" || start == "to" || start === false) pos = range.to();
      else pos = range.from();
      return pos;
    },
    listSelections: function() { return this.sel.ranges; },
    somethingSelected: function() {return this.sel.somethingSelected();},

    setCursor: docMethodOp(function(line, ch, options) {
      setSimpleSelection(this, clipPos(this, typeof line == "number" ? Pos(line, ch || 0) : line), null, options);
    }),
    setSelection: docMethodOp(function(anchor, head, options) {
      setSimpleSelection(this, clipPos(this, anchor), clipPos(this, head || anchor), options);
    }),
    extendSelection: docMethodOp(function(head, other, options) {
      extendSelection(this, clipPos(this, head), other && clipPos(this, other), options);
    }),
    extendSelections: docMethodOp(function(heads, options) {
      extendSelections(this, clipPosArray(this, heads), options);
    }),
    extendSelectionsBy: docMethodOp(function(f, options) {
      var heads = map(this.sel.ranges, f);
      extendSelections(this, clipPosArray(this, heads), options);
    }),
    setSelections: docMethodOp(function(ranges, primary, options) {
      if (!ranges.length) return;
      for (var i = 0, out = []; i < ranges.length; i++)
        out[i] = new Range(clipPos(this, ranges[i].anchor),
                           clipPos(this, ranges[i].head));
      if (primary == null) primary = Math.min(ranges.length - 1, this.sel.primIndex);
      setSelection(this, normalizeSelection(out, primary), options);
    }),
    addSelection: docMethodOp(function(anchor, head, options) {
      var ranges = this.sel.ranges.slice(0);
      ranges.push(new Range(clipPos(this, anchor), clipPos(this, head || anchor)));
      setSelection(this, normalizeSelection(ranges, ranges.length - 1), options);
    }),

    getSelection: function(lineSep) {
      var ranges = this.sel.ranges, lines;
      for (var i = 0; i < ranges.length; i++) {
        var sel = getBetween(this, ranges[i].from(), ranges[i].to());
        lines = lines ? lines.concat(sel) : sel;
      }
      if (lineSep === false) return lines;
      else return lines.join(lineSep || this.lineSeparator());
    },
    getSelections: function(lineSep) {
      var parts = [], ranges = this.sel.ranges;
      for (var i = 0; i < ranges.length; i++) {
        var sel = getBetween(this, ranges[i].from(), ranges[i].to());
        if (lineSep !== false) sel = sel.join(lineSep || this.lineSeparator());
        parts[i] = sel;
      }
      return parts;
    },
    replaceSelection: function(code, collapse, origin) {
      var dup = [];
      for (var i = 0; i < this.sel.ranges.length; i++)
        dup[i] = code;
      this.replaceSelections(dup, collapse, origin || "+input");
    },
    replaceSelections: docMethodOp(function(code, collapse, origin) {
      var changes = [], sel = this.sel;
      for (var i = 0; i < sel.ranges.length; i++) {
        var range = sel.ranges[i];
        changes[i] = {from: range.from(), to: range.to(), text: this.splitLines(code[i]), origin: origin};
      }
      var newSel = collapse && collapse != "end" && computeReplacedSel(this, changes, collapse);
      for (var i = changes.length - 1; i >= 0; i--)
        makeChange(this, changes[i]);
      if (newSel) setSelectionReplaceHistory(this, newSel);
      else if (this.cm) ensureCursorVisible(this.cm);
    }),
    undo: docMethodOp(function() {makeChangeFromHistory(this, "undo");}),
    redo: docMethodOp(function() {makeChangeFromHistory(this, "redo");}),
    undoSelection: docMethodOp(function() {makeChangeFromHistory(this, "undo", true);}),
    redoSelection: docMethodOp(function() {makeChangeFromHistory(this, "redo", true);}),

    setExtending: function(val) {this.extend = val;},
    getExtending: function() {return this.extend;},

    historySize: function() {
      var hist = this.history, done = 0, undone = 0;
      for (var i = 0; i < hist.done.length; i++) if (!hist.done[i].ranges) ++done;
      for (var i = 0; i < hist.undone.length; i++) if (!hist.undone[i].ranges) ++undone;
      return {undo: done, redo: undone};
    },
    clearHistory: function() {this.history = new History(this.history.maxGeneration);},

    markClean: function() {
      this.cleanGeneration = this.changeGeneration(true);
    },
    changeGeneration: function(forceSplit) {
      if (forceSplit)
        this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null;
      return this.history.generation;
    },
    isClean: function (gen) {
      return this.history.generation == (gen || this.cleanGeneration);
    },

    getHistory: function() {
      return {done: copyHistoryArray(this.history.done),
              undone: copyHistoryArray(this.history.undone)};
    },
    setHistory: function(histData) {
      var hist = this.history = new History(this.history.maxGeneration);
      hist.done = copyHistoryArray(histData.done.slice(0), null, true);
      hist.undone = copyHistoryArray(histData.undone.slice(0), null, true);
    },

    addLineClass: docMethodOp(function(handle, where, cls) {
      return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function(line) {
        var prop = where == "text" ? "textClass"
                 : where == "background" ? "bgClass"
                 : where == "gutter" ? "gutterClass" : "wrapClass";
        if (!line[prop]) line[prop] = cls;
        else if (classTest(cls).test(line[prop])) return false;
        else line[prop] += " " + cls;
        return true;
      });
    }),
    removeLineClass: docMethodOp(function(handle, where, cls) {
      return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function(line) {
        var prop = where == "text" ? "textClass"
                 : where == "background" ? "bgClass"
                 : where == "gutter" ? "gutterClass" : "wrapClass";
        var cur = line[prop];
        if (!cur) return false;
        else if (cls == null) line[prop] = null;
        else {
          var found = cur.match(classTest(cls));
          if (!found) return false;
          var end = found.index + found[0].length;
          line[prop] = cur.slice(0, found.index) + (!found.index || end == cur.length ? "" : " ") + cur.slice(end) || null;
        }
        return true;
      });
    }),

    addLineWidget: docMethodOp(function(handle, node, options) {
      return addLineWidget(this, handle, node, options);
    }),
    removeLineWidget: function(widget) { widget.clear(); },

    markText: function(from, to, options) {
      return markText(this, clipPos(this, from), clipPos(this, to), options, options && options.type || "range");
    },
    setBookmark: function(pos, options) {
      var realOpts = {replacedWith: options && (options.nodeType == null ? options.widget : options),
                      insertLeft: options && options.insertLeft,
                      clearWhenEmpty: false, shared: options && options.shared,
                      handleMouseEvents: options && options.handleMouseEvents};
      pos = clipPos(this, pos);
      return markText(this, pos, pos, realOpts, "bookmark");
    },
    findMarksAt: function(pos) {
      pos = clipPos(this, pos);
      var markers = [], spans = getLine(this, pos.line).markedSpans;
      if (spans) for (var i = 0; i < spans.length; ++i) {
        var span = spans[i];
        if ((span.from == null || span.from <= pos.ch) &&
            (span.to == null || span.to >= pos.ch))
          markers.push(span.marker.parent || span.marker);
      }
      return markers;
    },
    findMarks: function(from, to, filter) {
      from = clipPos(this, from); to = clipPos(this, to);
      var found = [], lineNo = from.line;
      this.iter(from.line, to.line + 1, function(line) {
        var spans = line.markedSpans;
        if (spans) for (var i = 0; i < spans.length; i++) {
          var span = spans[i];
          if (!(lineNo == from.line && from.ch > span.to ||
                span.from == null && lineNo != from.line||
                lineNo == to.line && span.from > to.ch) &&
              (!filter || filter(span.marker)))
            found.push(span.marker.parent || span.marker);
        }
        ++lineNo;
      });
      return found;
    },
    getAllMarks: function() {
      var markers = [];
      this.iter(function(line) {
        var sps = line.markedSpans;
        if (sps) for (var i = 0; i < sps.length; ++i)
          if (sps[i].from != null) markers.push(sps[i].marker);
      });
      return markers;
    },

    posFromIndex: function(off) {
      var ch, lineNo = this.first;
      this.iter(function(line) {
        var sz = line.text.length + 1;
        if (sz > off) { ch = off; return true; }
        off -= sz;
        ++lineNo;
      });
      return clipPos(this, Pos(lineNo, ch));
    },
    indexFromPos: function (coords) {
      coords = clipPos(this, coords);
      var index = coords.ch;
      if (coords.line < this.first || coords.ch < 0) return 0;
      this.iter(this.first, coords.line, function (line) {
        index += line.text.length + 1;
      });
      return index;
    },

    copy: function(copyHistory) {
      var doc = new Doc(getLines(this, this.first, this.first + this.size),
                        this.modeOption, this.first, this.lineSep);
      doc.scrollTop = this.scrollTop; doc.scrollLeft = this.scrollLeft;
      doc.sel = this.sel;
      doc.extend = false;
      if (copyHistory) {
        doc.history.undoDepth = this.history.undoDepth;
        doc.setHistory(this.getHistory());
      }
      return doc;
    },

    linkedDoc: function(options) {
      if (!options) options = {};
      var from = this.first, to = this.first + this.size;
      if (options.from != null && options.from > from) from = options.from;
      if (options.to != null && options.to < to) to = options.to;
      var copy = new Doc(getLines(this, from, to), options.mode || this.modeOption, from, this.lineSep);
      if (options.sharedHist) copy.history = this.history;
      (this.linked || (this.linked = [])).push({doc: copy, sharedHist: options.sharedHist});
      copy.linked = [{doc: this, isParent: true, sharedHist: options.sharedHist}];
      copySharedMarkers(copy, findSharedMarkers(this));
      return copy;
    },
    unlinkDoc: function(other) {
      if (other instanceof CodeMirror) other = other.doc;
      if (this.linked) for (var i = 0; i < this.linked.length; ++i) {
        var link = this.linked[i];
        if (link.doc != other) continue;
        this.linked.splice(i, 1);
        other.unlinkDoc(this);
        detachSharedMarkers(findSharedMarkers(this));
        break;
      }
      // If the histories were shared, split them again
      if (other.history == this.history) {
        var splitIds = [other.id];
        linkedDocs(other, function(doc) {splitIds.push(doc.id);}, true);
        other.history = new History(null);
        other.history.done = copyHistoryArray(this.history.done, splitIds);
        other.history.undone = copyHistoryArray(this.history.undone, splitIds);
      }
    },
    iterLinkedDocs: function(f) {linkedDocs(this, f);},

    getMode: function() {return this.mode;},
    getEditor: function() {return this.cm;},

    splitLines: function(str) {
      if (this.lineSep) return str.split(this.lineSep);
      return splitLinesAuto(str);
    },
    lineSeparator: function() { return this.lineSep || "\n"; }
  });

  // Public alias.
  Doc.prototype.eachLine = Doc.prototype.iter;

  // Set up methods on CodeMirror's prototype to redirect to the editor's document.
  var dontDelegate = "iter insert remove copy getEditor constructor".split(" ");
  for (var prop in Doc.prototype) if (Doc.prototype.hasOwnProperty(prop) && indexOf(dontDelegate, prop) < 0)
    CodeMirror.prototype[prop] = (function(method) {
      return function() {return method.apply(this.doc, arguments);};
    })(Doc.prototype[prop]);

  eventMixin(Doc);

  // Call f for all linked documents.
  function linkedDocs(doc, f, sharedHistOnly) {
    function propagate(doc, skip, sharedHist) {
      if (doc.linked) for (var i = 0; i < doc.linked.length; ++i) {
        var rel = doc.linked[i];
        if (rel.doc == skip) continue;
        var shared = sharedHist && rel.sharedHist;
        if (sharedHistOnly && !shared) continue;
        f(rel.doc, shared);
        propagate(rel.doc, doc, shared);
      }
    }
    propagate(doc, null, true);
  }

  // Attach a document to an editor.
  function attachDoc(cm, doc) {
    if (doc.cm) throw new Error("This document is already in use.");
    cm.doc = doc;
    doc.cm = cm;
    estimateLineHeights(cm);
    loadMode(cm);
    if (!cm.options.lineWrapping) findMaxLine(cm);
    cm.options.mode = doc.modeOption;
    regChange(cm);
  }

  // LINE UTILITIES

  // Find the line object corresponding to the given line number.
  function getLine(doc, n) {
    n -= doc.first;
    if (n < 0 || n >= doc.size) throw new Error("There is no line " + (n + doc.first) + " in the document.");
    for (var chunk = doc; !chunk.lines;) {
      for (var i = 0;; ++i) {
        var child = chunk.children[i], sz = child.chunkSize();
        if (n < sz) { chunk = child; break; }
        n -= sz;
      }
    }
    return chunk.lines[n];
  }

  // Get the part of a document between two positions, as an array of
  // strings.
  function getBetween(doc, start, end) {
    var out = [], n = start.line;
    doc.iter(start.line, end.line + 1, function(line) {
      var text = line.text;
      if (n == end.line) text = text.slice(0, end.ch);
      if (n == start.line) text = text.slice(start.ch);
      out.push(text);
      ++n;
    });
    return out;
  }
  // Get the lines between from and to, as array of strings.
  function getLines(doc, from, to) {
    var out = [];
    doc.iter(from, to, function(line) { out.push(line.text); });
    return out;
  }

  // Update the height of a line, propagating the height change
  // upwards to parent nodes.
  function updateLineHeight(line, height) {
    var diff = height - line.height;
    if (diff) for (var n = line; n; n = n.parent) n.height += diff;
  }

  // Given a line object, find its line number by walking up through
  // its parent links.
  function lineNo(line) {
    if (line.parent == null) return null;
    var cur = line.parent, no = indexOf(cur.lines, line);
    for (var chunk = cur.parent; chunk; cur = chunk, chunk = chunk.parent) {
      for (var i = 0;; ++i) {
        if (chunk.children[i] == cur) break;
        no += chunk.children[i].chunkSize();
      }
    }
    return no + cur.first;
  }

  // Find the line at the given vertical position, using the height
  // information in the document tree.
  function lineAtHeight(chunk, h) {
    var n = chunk.first;
    outer: do {
      for (var i = 0; i < chunk.children.length; ++i) {
        var child = chunk.children[i], ch = child.height;
        if (h < ch) { chunk = child; continue outer; }
        h -= ch;
        n += child.chunkSize();
      }
      return n;
    } while (!chunk.lines);
    for (var i = 0; i < chunk.lines.length; ++i) {
      var line = chunk.lines[i], lh = line.height;
      if (h < lh) break;
      h -= lh;
    }
    return n + i;
  }


  // Find the height above the given line.
  function heightAtLine(lineObj) {
    lineObj = visualLine(lineObj);

    var h = 0, chunk = lineObj.parent;
    for (var i = 0; i < chunk.lines.length; ++i) {
      var line = chunk.lines[i];
      if (line == lineObj) break;
      else h += line.height;
    }
    for (var p = chunk.parent; p; chunk = p, p = chunk.parent) {
      for (var i = 0; i < p.children.length; ++i) {
        var cur = p.children[i];
        if (cur == chunk) break;
        else h += cur.height;
      }
    }
    return h;
  }

  // Get the bidi ordering for the given line (and cache it). Returns
  // false for lines that are fully left-to-right, and an array of
  // BidiSpan objects otherwise.
  function getOrder(line) {
    var order = line.order;
    if (order == null) order = line.order = bidiOrdering(line.text);
    return order;
  }

  // HISTORY

  function History(startGen) {
    // Arrays of change events and selections. Doing something adds an
    // event to done and clears undo. Undoing moves events from done
    // to undone, redoing moves them in the other direction.
    this.done = []; this.undone = [];
    this.undoDepth = Infinity;
    // Used to track when changes can be merged into a single undo
    // event
    this.lastModTime = this.lastSelTime = 0;
    this.lastOp = this.lastSelOp = null;
    this.lastOrigin = this.lastSelOrigin = null;
    // Used by the isClean() method
    this.generation = this.maxGeneration = startGen || 1;
  }

  // Create a history change event from an updateDoc-style change
  // object.
  function historyChangeFromChange(doc, change) {
    var histChange = {from: copyPos(change.from), to: changeEnd(change), text: getBetween(doc, change.from, change.to)};
    attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);
    linkedDocs(doc, function(doc) {attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);}, true);
    return histChange;
  }

  // Pop all selection events off the end of a history array. Stop at
  // a change event.
  function clearSelectionEvents(array) {
    while (array.length) {
      var last = lst(array);
      if (last.ranges) array.pop();
      else break;
    }
  }

  // Find the top change event in the history. Pop off selection
  // events that are in the way.
  function lastChangeEvent(hist, force) {
    if (force) {
      clearSelectionEvents(hist.done);
      return lst(hist.done);
    } else if (hist.done.length && !lst(hist.done).ranges) {
      return lst(hist.done);
    } else if (hist.done.length > 1 && !hist.done[hist.done.length - 2].ranges) {
      hist.done.pop();
      return lst(hist.done);
    }
  }

  // Register a change in the history. Merges changes that are within
  // a single operation, ore are close together with an origin that
  // allows merging (starting with "+") into a single event.
  function addChangeToHistory(doc, change, selAfter, opId) {
    var hist = doc.history;
    hist.undone.length = 0;
    var time = +new Date, cur;

    if ((hist.lastOp == opId ||
         hist.lastOrigin == change.origin && change.origin &&
         ((change.origin.charAt(0) == "+" && doc.cm && hist.lastModTime > time - doc.cm.options.historyEventDelay) ||
          change.origin.charAt(0) == "*")) &&
        (cur = lastChangeEvent(hist, hist.lastOp == opId))) {
      // Merge this change into the last event
      var last = lst(cur.changes);
      if (cmp(change.from, change.to) == 0 && cmp(change.from, last.to) == 0) {
        // Optimized case for simple insertion -- don't want to add
        // new changesets for every character typed
        last.to = changeEnd(change);
      } else {
        // Add new sub-event
        cur.changes.push(historyChangeFromChange(doc, change));
      }
    } else {
      // Can not be merged, start a new event.
      var before = lst(hist.done);
      if (!before || !before.ranges)
        pushSelectionToHistory(doc.sel, hist.done);
      cur = {changes: [historyChangeFromChange(doc, change)],
             generation: hist.generation};
      hist.done.push(cur);
      while (hist.done.length > hist.undoDepth) {
        hist.done.shift();
        if (!hist.done[0].ranges) hist.done.shift();
      }
    }
    hist.done.push(selAfter);
    hist.generation = ++hist.maxGeneration;
    hist.lastModTime = hist.lastSelTime = time;
    hist.lastOp = hist.lastSelOp = opId;
    hist.lastOrigin = hist.lastSelOrigin = change.origin;

    if (!last) signal(doc, "historyAdded");
  }

  function selectionEventCanBeMerged(doc, origin, prev, sel) {
    var ch = origin.charAt(0);
    return ch == "*" ||
      ch == "+" &&
      prev.ranges.length == sel.ranges.length &&
      prev.somethingSelected() == sel.somethingSelected() &&
      new Date - doc.history.lastSelTime <= (doc.cm ? doc.cm.options.historyEventDelay : 500);
  }

  // Called whenever the selection changes, sets the new selection as
  // the pending selection in the history, and pushes the old pending
  // selection into the 'done' array when it was significantly
  // different (in number of selected ranges, emptiness, or time).
  function addSelectionToHistory(doc, sel, opId, options) {
    var hist = doc.history, origin = options && options.origin;

    // A new event is started when the previous origin does not match
    // the current, or the origins don't allow matching. Origins
    // starting with * are always merged, those starting with + are
    // merged when similar and close together in time.
    if (opId == hist.lastSelOp ||
        (origin && hist.lastSelOrigin == origin &&
         (hist.lastModTime == hist.lastSelTime && hist.lastOrigin == origin ||
          selectionEventCanBeMerged(doc, origin, lst(hist.done), sel))))
      hist.done[hist.done.length - 1] = sel;
    else
      pushSelectionToHistory(sel, hist.done);

    hist.lastSelTime = +new Date;
    hist.lastSelOrigin = origin;
    hist.lastSelOp = opId;
    if (options && options.clearRedo !== false)
      clearSelectionEvents(hist.undone);
  }

  function pushSelectionToHistory(sel, dest) {
    var top = lst(dest);
    if (!(top && top.ranges && top.equals(sel)))
      dest.push(sel);
  }

  // Used to store marked span information in the history.
  function attachLocalSpans(doc, change, from, to) {
    var existing = change["spans_" + doc.id], n = 0;
    doc.iter(Math.max(doc.first, from), Math.min(doc.first + doc.size, to), function(line) {
      if (line.markedSpans)
        (existing || (existing = change["spans_" + doc.id] = {}))[n] = line.markedSpans;
      ++n;
    });
  }

  // When un/re-doing restores text containing marked spans, those
  // that have been explicitly cleared should not be restored.
  function removeClearedSpans(spans) {
    if (!spans) return null;
    for (var i = 0, out; i < spans.length; ++i) {
      if (spans[i].marker.explicitlyCleared) { if (!out) out = spans.slice(0, i); }
      else if (out) out.push(spans[i]);
    }
    return !out ? spans : out.length ? out : null;
  }

  // Retrieve and filter the old marked spans stored in a change event.
  function getOldSpans(doc, change) {
    var found = change["spans_" + doc.id];
    if (!found) return null;
    for (var i = 0, nw = []; i < change.text.length; ++i)
      nw.push(removeClearedSpans(found[i]));
    return nw;
  }

  // Used both to provide a JSON-safe object in .getHistory, and, when
  // detaching a document, to split the history in two
  function copyHistoryArray(events, newGroup, instantiateSel) {
    for (var i = 0, copy = []; i < events.length; ++i) {
      var event = events[i];
      if (event.ranges) {
        copy.push(instantiateSel ? Selection.prototype.deepCopy.call(event) : event);
        continue;
      }
      var changes = event.changes, newChanges = [];
      copy.push({changes: newChanges});
      for (var j = 0; j < changes.length; ++j) {
        var change = changes[j], m;
        newChanges.push({from: change.from, to: change.to, text: change.text});
        if (newGroup) for (var prop in change) if (m = prop.match(/^spans_(\d+)$/)) {
          if (indexOf(newGroup, Number(m[1])) > -1) {
            lst(newChanges)[prop] = change[prop];
            delete change[prop];
          }
        }
      }
    }
    return copy;
  }

  // Rebasing/resetting history to deal with externally-sourced changes

  function rebaseHistSelSingle(pos, from, to, diff) {
    if (to < pos.line) {
      pos.line += diff;
    } else if (from < pos.line) {
      pos.line = from;
      pos.ch = 0;
    }
  }

  // Tries to rebase an array of history events given a change in the
  // document. If the change touches the same lines as the event, the
  // event, and everything 'behind' it, is discarded. If the change is
  // before the event, the event's positions are updated. Uses a
  // copy-on-write scheme for the positions, to avoid having to
  // reallocate them all on every rebase, but also avoid problems with
  // shared position objects being unsafely updated.
  function rebaseHistArray(array, from, to, diff) {
    for (var i = 0; i < array.length; ++i) {
      var sub = array[i], ok = true;
      if (sub.ranges) {
        if (!sub.copied) { sub = array[i] = sub.deepCopy(); sub.copied = true; }
        for (var j = 0; j < sub.ranges.length; j++) {
          rebaseHistSelSingle(sub.ranges[j].anchor, from, to, diff);
          rebaseHistSelSingle(sub.ranges[j].head, from, to, diff);
        }
        continue;
      }
      for (var j = 0; j < sub.changes.length; ++j) {
        var cur = sub.changes[j];
        if (to < cur.from.line) {
          cur.from = Pos(cur.from.line + diff, cur.from.ch);
          cur.to = Pos(cur.to.line + diff, cur.to.ch);
        } else if (from <= cur.to.line) {
          ok = false;
          break;
        }
      }
      if (!ok) {
        array.splice(0, i + 1);
        i = 0;
      }
    }
  }

  function rebaseHist(hist, change) {
    var from = change.from.line, to = change.to.line, diff = change.text.length - (to - from) - 1;
    rebaseHistArray(hist.done, from, to, diff);
    rebaseHistArray(hist.undone, from, to, diff);
  }

  // EVENT UTILITIES

  // Due to the fact that we still support jurassic IE versions, some
  // compatibility wrappers are needed.

  var e_preventDefault = CodeMirror.e_preventDefault = function(e) {
    if (e.preventDefault) e.preventDefault();
    else e.returnValue = false;
  };
  var e_stopPropagation = CodeMirror.e_stopPropagation = function(e) {
    if (e.stopPropagation) e.stopPropagation();
    else e.cancelBubble = true;
  };
  function e_defaultPrevented(e) {
    return e.defaultPrevented != null ? e.defaultPrevented : e.returnValue == false;
  }
  var e_stop = CodeMirror.e_stop = function(e) {e_preventDefault(e); e_stopPropagation(e);};

  function e_target(e) {return e.target || e.srcElement;}
  function e_button(e) {
    var b = e.which;
    if (b == null) {
      if (e.button & 1) b = 1;
      else if (e.button & 2) b = 3;
      else if (e.button & 4) b = 2;
    }
    if (mac && e.ctrlKey && b == 1) b = 3;
    return b;
  }

  // EVENT HANDLING

  // Lightweight event framework. on/off also work on DOM nodes,
  // registering native DOM handlers.

  var on = CodeMirror.on = function(emitter, type, f) {
    if (emitter.addEventListener)
      emitter.addEventListener(type, f, false);
    else if (emitter.attachEvent)
      emitter.attachEvent("on" + type, f);
    else {
      var map = emitter._handlers || (emitter._handlers = {});
      var arr = map[type] || (map[type] = []);
      arr.push(f);
    }
  };

  var noHandlers = []
  function getHandlers(emitter, type, copy) {
    var arr = emitter._handlers && emitter._handlers[type]
    if (copy) return arr && arr.length > 0 ? arr.slice() : noHandlers
    else return arr || noHandlers
  }

  var off = CodeMirror.off = function(emitter, type, f) {
    if (emitter.removeEventListener)
      emitter.removeEventListener(type, f, false);
    else if (emitter.detachEvent)
      emitter.detachEvent("on" + type, f);
    else {
      var handlers = getHandlers(emitter, type, false)
      for (var i = 0; i < handlers.length; ++i)
        if (handlers[i] == f) { handlers.splice(i, 1); break; }
    }
  };

  var signal = CodeMirror.signal = function(emitter, type /*, values...*/) {
    var handlers = getHandlers(emitter, type, true)
    if (!handlers.length) return;
    var args = Array.prototype.slice.call(arguments, 2);
    for (var i = 0; i < handlers.length; ++i) handlers[i].apply(null, args);
  };

  var orphanDelayedCallbacks = null;

  // Often, we want to signal events at a point where we are in the
  // middle of some work, but don't want the handler to start calling
  // other methods on the editor, which might be in an inconsistent
  // state or simply not expect any other events to happen.
  // signalLater looks whether there are any handlers, and schedules
  // them to be executed when the last operation ends, or, if no
  // operation is active, when a timeout fires.
  function signalLater(emitter, type /*, values...*/) {
    var arr = getHandlers(emitter, type, false)
    if (!arr.length) return;
    var args = Array.prototype.slice.call(arguments, 2), list;
    if (operationGroup) {
      list = operationGroup.delayedCallbacks;
    } else if (orphanDelayedCallbacks) {
      list = orphanDelayedCallbacks;
    } else {
      list = orphanDelayedCallbacks = [];
      setTimeout(fireOrphanDelayed, 0);
    }
    function bnd(f) {return function(){f.apply(null, args);};};
    for (var i = 0; i < arr.length; ++i)
      list.push(bnd(arr[i]));
  }

  function fireOrphanDelayed() {
    var delayed = orphanDelayedCallbacks;
    orphanDelayedCallbacks = null;
    for (var i = 0; i < delayed.length; ++i) delayed[i]();
  }

  // The DOM events that CodeMirror handles can be overridden by
  // registering a (non-DOM) handler on the editor for the event name,
  // and preventDefault-ing the event in that handler.
  function signalDOMEvent(cm, e, override) {
    if (typeof e == "string")
      e = {type: e, preventDefault: function() { this.defaultPrevented = true; }};
    signal(cm, override || e.type, cm, e);
    return e_defaultPrevented(e) || e.codemirrorIgnore;
  }

  function signalCursorActivity(cm) {
    var arr = cm._handlers && cm._handlers.cursorActivity;
    if (!arr) return;
    var set = cm.curOp.cursorActivityHandlers || (cm.curOp.cursorActivityHandlers = []);
    for (var i = 0; i < arr.length; ++i) if (indexOf(set, arr[i]) == -1)
      set.push(arr[i]);
  }

  function hasHandler(emitter, type) {
    return getHandlers(emitter, type).length > 0
  }

  // Add on and off methods to a constructor's prototype, to make
  // registering events on such objects more convenient.
  function eventMixin(ctor) {
    ctor.prototype.on = function(type, f) {on(this, type, f);};
    ctor.prototype.off = function(type, f) {off(this, type, f);};
  }

  // MISC UTILITIES

  // Number of pixels added to scroller and sizer to hide scrollbar
  var scrollerGap = 30;

  // Returned or thrown by various protocols to signal 'I'm not
  // handling this'.
  var Pass = CodeMirror.Pass = {toString: function(){return "CodeMirror.Pass";}};

  // Reused option objects for setSelection & friends
  var sel_dontScroll = {scroll: false}, sel_mouse = {origin: "*mouse"}, sel_move = {origin: "+move"};

  function Delayed() {this.id = null;}
  Delayed.prototype.set = function(ms, f) {
    clearTimeout(this.id);
    this.id = setTimeout(f, ms);
  };

  // Counts the column offset in a string, taking tabs into account.
  // Used mostly to find indentation.
  var countColumn = CodeMirror.countColumn = function(string, end, tabSize, startIndex, startValue) {
    if (end == null) {
      end = string.search(/[^\s\u00a0]/);
      if (end == -1) end = string.length;
    }
    for (var i = startIndex || 0, n = startValue || 0;;) {
      var nextTab = string.indexOf("\t", i);
      if (nextTab < 0 || nextTab >= end)
        return n + (end - i);
      n += nextTab - i;
      n += tabSize - (n % tabSize);
      i = nextTab + 1;
    }
  };

  // The inverse of countColumn -- find the offset that corresponds to
  // a particular column.
  var findColumn = CodeMirror.findColumn = function(string, goal, tabSize) {
    for (var pos = 0, col = 0;;) {
      var nextTab = string.indexOf("\t", pos);
      if (nextTab == -1) nextTab = string.length;
      var skipped = nextTab - pos;
      if (nextTab == string.length || col + skipped >= goal)
        return pos + Math.min(skipped, goal - col);
      col += nextTab - pos;
      col += tabSize - (col % tabSize);
      pos = nextTab + 1;
      if (col >= goal) return pos;
    }
  }

  var spaceStrs = [""];
  function spaceStr(n) {
    while (spaceStrs.length <= n)
      spaceStrs.push(lst(spaceStrs) + " ");
    return spaceStrs[n];
  }

  function lst(arr) { return arr[arr.length-1]; }

  var selectInput = function(node) { node.select(); };
  if (ios) // Mobile Safari apparently has a bug where select() is broken.
    selectInput = function(node) { node.selectionStart = 0; node.selectionEnd = node.value.length; };
  else if (ie) // Suppress mysterious IE10 errors
    selectInput = function(node) { try { node.select(); } catch(_e) {} };

  function indexOf(array, elt) {
    for (var i = 0; i < array.length; ++i)
      if (array[i] == elt) return i;
    return -1;
  }
  function map(array, f) {
    var out = [];
    for (var i = 0; i < array.length; i++) out[i] = f(array[i], i);
    return out;
  }

  function nothing() {}

  function createObj(base, props) {
    var inst;
    if (Object.create) {
      inst = Object.create(base);
    } else {
      nothing.prototype = base;
      inst = new nothing();
    }
    if (props) copyObj(props, inst);
    return inst;
  };

  function copyObj(obj, target, overwrite) {
    if (!target) target = {};
    for (var prop in obj)
      if (obj.hasOwnProperty(prop) && (overwrite !== false || !target.hasOwnProperty(prop)))
        target[prop] = obj[prop];
    return target;
  }

  function bind(f) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function(){return f.apply(null, args);};
  }

  var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
  var isWordCharBasic = CodeMirror.isWordChar = function(ch) {
    return /\w/.test(ch) || ch > "\x80" &&
      (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch));
  };
  function isWordChar(ch, helper) {
    if (!helper) return isWordCharBasic(ch);
    if (helper.source.indexOf("\\w") > -1 && isWordCharBasic(ch)) return true;
    return helper.test(ch);
  }

  function isEmpty(obj) {
    for (var n in obj) if (obj.hasOwnProperty(n) && obj[n]) return false;
    return true;
  }

  // Extending unicode characters. A series of a non-extending char +
  // any number of extending chars is treated as a single unit as far
  // as editing and measuring is concerned. This is not fully correct,
  // since some scripts/fonts/browsers also treat other configurations
  // of code points as a group.
  var extendingChars = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/;
  function isExtendingChar(ch) { return ch.charCodeAt(0) >= 768 && extendingChars.test(ch); }

  // DOM UTILITIES

  function elt(tag, content, className, style) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (style) e.style.cssText = style;
    if (typeof content == "string") e.appendChild(document.createTextNode(content));
    else if (content) for (var i = 0; i < content.length; ++i) e.appendChild(content[i]);
    return e;
  }

  var range;
  if (document.createRange) range = function(node, start, end, endNode) {
    var r = document.createRange();
    r.setEnd(endNode || node, end);
    r.setStart(node, start);
    return r;
  };
  else range = function(node, start, end) {
    var r = document.body.createTextRange();
    try { r.moveToElementText(node.parentNode); }
    catch(e) { return r; }
    r.collapse(true);
    r.moveEnd("character", end);
    r.moveStart("character", start);
    return r;
  };

  function removeChildren(e) {
    for (var count = e.childNodes.length; count > 0; --count)
      e.removeChild(e.firstChild);
    return e;
  }

  function removeChildrenAndAdd(parent, e) {
    return removeChildren(parent).appendChild(e);
  }

  var contains = CodeMirror.contains = function(parent, child) {
    if (child.nodeType == 3) // Android browser always returns false when child is a textnode
      child = child.parentNode;
    if (parent.contains)
      return parent.contains(child);
    do {
      if (child.nodeType == 11) child = child.host;
      if (child == parent) return true;
    } while (child = child.parentNode);
  };

  function activeElt() {
    var activeElement = document.activeElement;
    while (activeElement && activeElement.root && activeElement.root.activeElement)
      activeElement = activeElement.root.activeElement;
    return activeElement;
  }
  // Older versions of IE throws unspecified error when touching
  // document.activeElement in some cases (during loading, in iframe)
  if (ie && ie_version < 11) activeElt = function() {
    try { return document.activeElement; }
    catch(e) { return document.body; }
  };

  function classTest(cls) { return new RegExp("(^|\\s)" + cls + "(?:$|\\s)\\s*"); }
  var rmClass = CodeMirror.rmClass = function(node, cls) {
    var current = node.className;
    var match = classTest(cls).exec(current);
    if (match) {
      var after = current.slice(match.index + match[0].length);
      node.className = current.slice(0, match.index) + (after ? match[1] + after : "");
    }
  };
  var addClass = CodeMirror.addClass = function(node, cls) {
    var current = node.className;
    if (!classTest(cls).test(current)) node.className += (current ? " " : "") + cls;
  };
  function joinClasses(a, b) {
    var as = a.split(" ");
    for (var i = 0; i < as.length; i++)
      if (as[i] && !classTest(as[i]).test(b)) b += " " + as[i];
    return b;
  }

  // WINDOW-WIDE EVENTS

  // These must be handled carefully, because naively registering a
  // handler for each editor will cause the editors to never be
  // garbage collected.

  function forEachCodeMirror(f) {
    if (!document.body.getElementsByClassName) return;
    var byClass = document.body.getElementsByClassName("CodeMirror");
    for (var i = 0; i < byClass.length; i++) {
      var cm = byClass[i].CodeMirror;
      if (cm) f(cm);
    }
  }

  var globalsRegistered = false;
  function ensureGlobalHandlers() {
    if (globalsRegistered) return;
    registerGlobalHandlers();
    globalsRegistered = true;
  }
  function registerGlobalHandlers() {
    // When the window resizes, we need to refresh active editors.
    var resizeTimer;
    on(window, "resize", function() {
      if (resizeTimer == null) resizeTimer = setTimeout(function() {
        resizeTimer = null;
        forEachCodeMirror(onResize);
      }, 100);
    });
    // When the window loses focus, we want to show the editor as blurred
    on(window, "blur", function() {
      forEachCodeMirror(onBlur);
    });
  }

  // FEATURE DETECTION

  // Detect drag-and-drop
  var dragAndDrop = function() {
    // There is *some* kind of drag-and-drop support in IE6-8, but I
    // couldn't get it to work yet.
    if (ie && ie_version < 9) return false;
    var div = elt('div');
    return "draggable" in div || "dragDrop" in div;
  }();

  var zwspSupported;
  function zeroWidthElement(measure) {
    if (zwspSupported == null) {
      var test = elt("span", "\u200b");
      removeChildrenAndAdd(measure, elt("span", [test, document.createTextNode("x")]));
      if (measure.firstChild.offsetHeight != 0)
        zwspSupported = test.offsetWidth <= 1 && test.offsetHeight > 2 && !(ie && ie_version < 8);
    }
    var node = zwspSupported ? elt("span", "\u200b") :
      elt("span", "\u00a0", null, "display: inline-block; width: 1px; margin-right: -1px");
    node.setAttribute("cm-text", "");
    return node;
  }

  // Feature-detect IE's crummy client rect reporting for bidi text
  var badBidiRects;
  function hasBadBidiRects(measure) {
    if (badBidiRects != null) return badBidiRects;
    var txt = removeChildrenAndAdd(measure, document.createTextNode("A\u062eA"));
    var r0 = range(txt, 0, 1).getBoundingClientRect();
    if (!r0 || r0.left == r0.right) return false; // Safari returns null in some cases (#2780)
    var r1 = range(txt, 1, 2).getBoundingClientRect();
    return badBidiRects = (r1.right - r0.right < 3);
  }

  // See if "".split is the broken IE version, if so, provide an
  // alternative way to split lines.
  var splitLinesAuto = CodeMirror.splitLines = "\n\nb".split(/\n/).length != 3 ? function(string) {
    var pos = 0, result = [], l = string.length;
    while (pos <= l) {
      var nl = string.indexOf("\n", pos);
      if (nl == -1) nl = string.length;
      var line = string.slice(pos, string.charAt(nl - 1) == "\r" ? nl - 1 : nl);
      var rt = line.indexOf("\r");
      if (rt != -1) {
        result.push(line.slice(0, rt));
        pos += rt + 1;
      } else {
        result.push(line);
        pos = nl + 1;
      }
    }
    return result;
  } : function(string){return string.split(/\r\n?|\n/);};

  var hasSelection = window.getSelection ? function(te) {
    try { return te.selectionStart != te.selectionEnd; }
    catch(e) { return false; }
  } : function(te) {
    try {var range = te.ownerDocument.selection.createRange();}
    catch(e) {}
    if (!range || range.parentElement() != te) return false;
    return range.compareEndPoints("StartToEnd", range) != 0;
  };

  var hasCopyEvent = (function() {
    var e = elt("div");
    if ("oncopy" in e) return true;
    e.setAttribute("oncopy", "return;");
    return typeof e.oncopy == "function";
  })();

  var badZoomedRects = null;
  function hasBadZoomedRects(measure) {
    if (badZoomedRects != null) return badZoomedRects;
    var node = removeChildrenAndAdd(measure, elt("span", "x"));
    var normal = node.getBoundingClientRect();
    var fromRange = range(node, 0, 1).getBoundingClientRect();
    return badZoomedRects = Math.abs(normal.left - fromRange.left) > 1;
  }

  // KEY NAMES

  var keyNames = CodeMirror.keyNames = {
    3: "Enter", 8: "Backspace", 9: "Tab", 13: "Enter", 16: "Shift", 17: "Ctrl", 18: "Alt",
    19: "Pause", 20: "CapsLock", 27: "Esc", 32: "Space", 33: "PageUp", 34: "PageDown", 35: "End",
    36: "Home", 37: "Left", 38: "Up", 39: "Right", 40: "Down", 44: "PrintScrn", 45: "Insert",
    46: "Delete", 59: ";", 61: "=", 91: "Mod", 92: "Mod", 93: "Mod",
    106: "*", 107: "=", 109: "-", 110: ".", 111: "/", 127: "Delete",
    173: "-", 186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\",
    221: "]", 222: "'", 63232: "Up", 63233: "Down", 63234: "Left", 63235: "Right", 63272: "Delete",
    63273: "Home", 63275: "End", 63276: "PageUp", 63277: "PageDown", 63302: "Insert"
  };
  (function() {
    // Number keys
    for (var i = 0; i < 10; i++) keyNames[i + 48] = keyNames[i + 96] = String(i);
    // Alphabetic keys
    for (var i = 65; i <= 90; i++) keyNames[i] = String.fromCharCode(i);
    // Function keys
    for (var i = 1; i <= 12; i++) keyNames[i + 111] = keyNames[i + 63235] = "F" + i;
  })();

  // BIDI HELPERS

  function iterateBidiSections(order, from, to, f) {
    if (!order) return f(from, to, "ltr");
    var found = false;
    for (var i = 0; i < order.length; ++i) {
      var part = order[i];
      if (part.from < to && part.to > from || from == to && part.to == from) {
        f(Math.max(part.from, from), Math.min(part.to, to), part.level == 1 ? "rtl" : "ltr");
        found = true;
      }
    }
    if (!found) f(from, to, "ltr");
  }

  function bidiLeft(part) { return part.level % 2 ? part.to : part.from; }
  function bidiRight(part) { return part.level % 2 ? part.from : part.to; }

  function lineLeft(line) { var order = getOrder(line); return order ? bidiLeft(order[0]) : 0; }
  function lineRight(line) {
    var order = getOrder(line);
    if (!order) return line.text.length;
    return bidiRight(lst(order));
  }

  function lineStart(cm, lineN) {
    var line = getLine(cm.doc, lineN);
    var visual = visualLine(line);
    if (visual != line) lineN = lineNo(visual);
    var order = getOrder(visual);
    var ch = !order ? 0 : order[0].level % 2 ? lineRight(visual) : lineLeft(visual);
    return Pos(lineN, ch);
  }
  function lineEnd(cm, lineN) {
    var merged, line = getLine(cm.doc, lineN);
    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line;
      lineN = null;
    }
    var order = getOrder(line);
    var ch = !order ? line.text.length : order[0].level % 2 ? lineLeft(line) : lineRight(line);
    return Pos(lineN == null ? lineNo(line) : lineN, ch);
  }
  function lineStartSmart(cm, pos) {
    var start = lineStart(cm, pos.line);
    var line = getLine(cm.doc, start.line);
    var order = getOrder(line);
    if (!order || order[0].level == 0) {
      var firstNonWS = Math.max(0, line.text.search(/\S/));
      var inWS = pos.line == start.line && pos.ch <= firstNonWS && pos.ch;
      return Pos(start.line, inWS ? 0 : firstNonWS);
    }
    return start;
  }

  function compareBidiLevel(order, a, b) {
    var linedir = order[0].level;
    if (a == linedir) return true;
    if (b == linedir) return false;
    return a < b;
  }
  var bidiOther;
  function getBidiPartAt(order, pos) {
    bidiOther = null;
    for (var i = 0, found; i < order.length; ++i) {
      var cur = order[i];
      if (cur.from < pos && cur.to > pos) return i;
      if ((cur.from == pos || cur.to == pos)) {
        if (found == null) {
          found = i;
        } else if (compareBidiLevel(order, cur.level, order[found].level)) {
          if (cur.from != cur.to) bidiOther = found;
          return i;
        } else {
          if (cur.from != cur.to) bidiOther = i;
          return found;
        }
      }
    }
    return found;
  }

  function moveInLine(line, pos, dir, byUnit) {
    if (!byUnit) return pos + dir;
    do pos += dir;
    while (pos > 0 && isExtendingChar(line.text.charAt(pos)));
    return pos;
  }

  // This is needed in order to move 'visually' through bi-directional
  // text -- i.e., pressing left should make the cursor go left, even
  // when in RTL text. The tricky part is the 'jumps', where RTL and
  // LTR text touch each other. This often requires the cursor offset
  // to move more than one unit, in order to visually move one unit.
  function moveVisually(line, start, dir, byUnit) {
    var bidi = getOrder(line);
    if (!bidi) return moveLogically(line, start, dir, byUnit);
    var pos = getBidiPartAt(bidi, start), part = bidi[pos];
    var target = moveInLine(line, start, part.level % 2 ? -dir : dir, byUnit);

    for (;;) {
      if (target > part.from && target < part.to) return target;
      if (target == part.from || target == part.to) {
        if (getBidiPartAt(bidi, target) == pos) return target;
        part = bidi[pos += dir];
        return (dir > 0) == part.level % 2 ? part.to : part.from;
      } else {
        part = bidi[pos += dir];
        if (!part) return null;
        if ((dir > 0) == part.level % 2)
          target = moveInLine(line, part.to, -1, byUnit);
        else
          target = moveInLine(line, part.from, 1, byUnit);
      }
    }
  }

  function moveLogically(line, start, dir, byUnit) {
    var target = start + dir;
    if (byUnit) while (target > 0 && isExtendingChar(line.text.charAt(target))) target += dir;
    return target < 0 || target > line.text.length ? null : target;
  }

  // Bidirectional ordering algorithm
  // See http://unicode.org/reports/tr9/tr9-13.html for the algorithm
  // that this (partially) implements.

  // One-char codes used for character types:
  // L (L):   Left-to-Right
  // R (R):   Right-to-Left
  // r (AL):  Right-to-Left Arabic
  // 1 (EN):  European Number
  // + (ES):  European Number Separator
  // % (ET):  European Number Terminator
  // n (AN):  Arabic Number
  // , (CS):  Common Number Separator
  // m (NSM): Non-Spacing Mark
  // b (BN):  Boundary Neutral
  // s (B):   Paragraph Separator
  // t (S):   Segment Separator
  // w (WS):  Whitespace
  // N (ON):  Other Neutrals

  // Returns null if characters are ordered as they appear
  // (left-to-right), or an array of sections ({from, to, level}
  // objects) in the order in which they occur visually.
  var bidiOrdering = (function() {
    // Character types for codepoints 0 to 0xff
    var lowTypes = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN";
    // Character types for codepoints 0x600 to 0x6ff
    var arabicTypes = "rrrrrrrrrrrr,rNNmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmrrrrrrrnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmNmmmm";
    function charType(code) {
      if (code <= 0xf7) return lowTypes.charAt(code);
      else if (0x590 <= code && code <= 0x5f4) return "R";
      else if (0x600 <= code && code <= 0x6ed) return arabicTypes.charAt(code - 0x600);
      else if (0x6ee <= code && code <= 0x8ac) return "r";
      else if (0x2000 <= code && code <= 0x200b) return "w";
      else if (code == 0x200c) return "b";
      else return "L";
    }

    var bidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
    var isNeutral = /[stwN]/, isStrong = /[LRr]/, countsAsLeft = /[Lb1n]/, countsAsNum = /[1n]/;
    // Browsers seem to always treat the boundaries of block elements as being L.
    var outerType = "L";

    function BidiSpan(level, from, to) {
      this.level = level;
      this.from = from; this.to = to;
    }

    return function(str) {
      if (!bidiRE.test(str)) return false;
      var len = str.length, types = [];
      for (var i = 0, type; i < len; ++i)
        types.push(type = charType(str.charCodeAt(i)));

      // W1. Examine each non-spacing mark (NSM) in the level run, and
      // change the type of the NSM to the type of the previous
      // character. If the NSM is at the start of the level run, it will
      // get the type of sor.
      for (var i = 0, prev = outerType; i < len; ++i) {
        var type = types[i];
        if (type == "m") types[i] = prev;
        else prev = type;
      }

      // W2. Search backwards from each instance of a European number
      // until the first strong type (R, L, AL, or sor) is found. If an
      // AL is found, change the type of the European number to Arabic
      // number.
      // W3. Change all ALs to R.
      for (var i = 0, cur = outerType; i < len; ++i) {
        var type = types[i];
        if (type == "1" && cur == "r") types[i] = "n";
        else if (isStrong.test(type)) { cur = type; if (type == "r") types[i] = "R"; }
      }

      // W4. A single European separator between two European numbers
      // changes to a European number. A single common separator between
      // two numbers of the same type changes to that type.
      for (var i = 1, prev = types[0]; i < len - 1; ++i) {
        var type = types[i];
        if (type == "+" && prev == "1" && types[i+1] == "1") types[i] = "1";
        else if (type == "," && prev == types[i+1] &&
                 (prev == "1" || prev == "n")) types[i] = prev;
        prev = type;
      }

      // W5. A sequence of European terminators adjacent to European
      // numbers changes to all European numbers.
      // W6. Otherwise, separators and terminators change to Other
      // Neutral.
      for (var i = 0; i < len; ++i) {
        var type = types[i];
        if (type == ",") types[i] = "N";
        else if (type == "%") {
          for (var end = i + 1; end < len && types[end] == "%"; ++end) {}
          var replace = (i && types[i-1] == "!") || (end < len && types[end] == "1") ? "1" : "N";
          for (var j = i; j < end; ++j) types[j] = replace;
          i = end - 1;
        }
      }

      // W7. Search backwards from each instance of a European number
      // until the first strong type (R, L, or sor) is found. If an L is
      // found, then change the type of the European number to L.
      for (var i = 0, cur = outerType; i < len; ++i) {
        var type = types[i];
        if (cur == "L" && type == "1") types[i] = "L";
        else if (isStrong.test(type)) cur = type;
      }

      // N1. A sequence of neutrals takes the direction of the
      // surrounding strong text if the text on both sides has the same
      // direction. European and Arabic numbers act as if they were R in
      // terms of their influence on neutrals. Start-of-level-run (sor)
      // and end-of-level-run (eor) are used at level run boundaries.
      // N2. Any remaining neutrals take the embedding direction.
      for (var i = 0; i < len; ++i) {
        if (isNeutral.test(types[i])) {
          for (var end = i + 1; end < len && isNeutral.test(types[end]); ++end) {}
          var before = (i ? types[i-1] : outerType) == "L";
          var after = (end < len ? types[end] : outerType) == "L";
          var replace = before || after ? "L" : "R";
          for (var j = i; j < end; ++j) types[j] = replace;
          i = end - 1;
        }
      }

      // Here we depart from the documented algorithm, in order to avoid
      // building up an actual levels array. Since there are only three
      // levels (0, 1, 2) in an implementation that doesn't take
      // explicit embedding into account, we can build up the order on
      // the fly, without following the level-based algorithm.
      var order = [], m;
      for (var i = 0; i < len;) {
        if (countsAsLeft.test(types[i])) {
          var start = i;
          for (++i; i < len && countsAsLeft.test(types[i]); ++i) {}
          order.push(new BidiSpan(0, start, i));
        } else {
          var pos = i, at = order.length;
          for (++i; i < len && types[i] != "L"; ++i) {}
          for (var j = pos; j < i;) {
            if (countsAsNum.test(types[j])) {
              if (pos < j) order.splice(at, 0, new BidiSpan(1, pos, j));
              var nstart = j;
              for (++j; j < i && countsAsNum.test(types[j]); ++j) {}
              order.splice(at, 0, new BidiSpan(2, nstart, j));
              pos = j;
            } else ++j;
          }
          if (pos < i) order.splice(at, 0, new BidiSpan(1, pos, i));
        }
      }
      if (order[0].level == 1 && (m = str.match(/^\s+/))) {
        order[0].from = m[0].length;
        order.unshift(new BidiSpan(0, 0, m[0].length));
      }
      if (lst(order).level == 1 && (m = str.match(/\s+$/))) {
        lst(order).to -= m[0].length;
        order.push(new BidiSpan(0, len - m[0].length, len));
      }
      if (order[0].level == 2)
        order.unshift(new BidiSpan(1, order[0].to, order[0].to));
      if (order[0].level != lst(order).level)
        order.push(new BidiSpan(order[0].level, len, len));

      return order;
    };
  })();

  // THE END

  CodeMirror.version = "5.10.0";

  return CodeMirror;
});

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define('codemirror/mode/xml/xml',["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("xml", function(config, parserConfig) {
  var indentUnit = config.indentUnit;
  var multilineTagIndentFactor = parserConfig.multilineTagIndentFactor || 1;
  var multilineTagIndentPastTag = parserConfig.multilineTagIndentPastTag;
  if (multilineTagIndentPastTag == null) multilineTagIndentPastTag = true;

  var Kludges = parserConfig.htmlMode ? {
    autoSelfClosers: {'area': true, 'base': true, 'br': true, 'col': true, 'command': true,
                      'embed': true, 'frame': true, 'hr': true, 'img': true, 'input': true,
                      'keygen': true, 'link': true, 'meta': true, 'param': true, 'source': true,
                      'track': true, 'wbr': true, 'menuitem': true},
    implicitlyClosed: {'dd': true, 'li': true, 'optgroup': true, 'option': true, 'p': true,
                       'rp': true, 'rt': true, 'tbody': true, 'td': true, 'tfoot': true,
                       'th': true, 'tr': true},
    contextGrabbers: {
      'dd': {'dd': true, 'dt': true},
      'dt': {'dd': true, 'dt': true},
      'li': {'li': true},
      'option': {'option': true, 'optgroup': true},
      'optgroup': {'optgroup': true},
      'p': {'address': true, 'article': true, 'aside': true, 'blockquote': true, 'dir': true,
            'div': true, 'dl': true, 'fieldset': true, 'footer': true, 'form': true,
            'h1': true, 'h2': true, 'h3': true, 'h4': true, 'h5': true, 'h6': true,
            'header': true, 'hgroup': true, 'hr': true, 'menu': true, 'nav': true, 'ol': true,
            'p': true, 'pre': true, 'section': true, 'table': true, 'ul': true},
      'rp': {'rp': true, 'rt': true},
      'rt': {'rp': true, 'rt': true},
      'tbody': {'tbody': true, 'tfoot': true},
      'td': {'td': true, 'th': true},
      'tfoot': {'tbody': true},
      'th': {'td': true, 'th': true},
      'thead': {'tbody': true, 'tfoot': true},
      'tr': {'tr': true}
    },
    doNotIndent: {"pre": true},
    allowUnquoted: true,
    allowMissing: true,
    caseFold: true
  } : {
    autoSelfClosers: {},
    implicitlyClosed: {},
    contextGrabbers: {},
    doNotIndent: {},
    allowUnquoted: false,
    allowMissing: false,
    caseFold: false
  };
  var alignCDATA = parserConfig.alignCDATA;

  // Return variables for tokenizers
  var type, setStyle;

  function inText(stream, state) {
    function chain(parser) {
      state.tokenize = parser;
      return parser(stream, state);
    }

    var ch = stream.next();
    if (ch == "<") {
      if (stream.eat("!")) {
        if (stream.eat("[")) {
          if (stream.match("CDATA[")) return chain(inBlock("atom", "]]>"));
          else return null;
        } else if (stream.match("--")) {
          return chain(inBlock("comment", "-->"));
        } else if (stream.match("DOCTYPE", true, true)) {
          stream.eatWhile(/[\w\._\-]/);
          return chain(doctype(1));
        } else {
          return null;
        }
      } else if (stream.eat("?")) {
        stream.eatWhile(/[\w\._\-]/);
        state.tokenize = inBlock("meta", "?>");
        return "meta";
      } else {
        type = stream.eat("/") ? "closeTag" : "openTag";
        state.tokenize = inTag;
        return "tag bracket";
      }
    } else if (ch == "&") {
      var ok;
      if (stream.eat("#")) {
        if (stream.eat("x")) {
          ok = stream.eatWhile(/[a-fA-F\d]/) && stream.eat(";");
        } else {
          ok = stream.eatWhile(/[\d]/) && stream.eat(";");
        }
      } else {
        ok = stream.eatWhile(/[\w\.\-:]/) && stream.eat(";");
      }
      return ok ? "atom" : "error";
    } else {
      stream.eatWhile(/[^&<]/);
      return null;
    }
  }
  inText.isInText = true;

  function inTag(stream, state) {
    var ch = stream.next();
    if (ch == ">" || (ch == "/" && stream.eat(">"))) {
      state.tokenize = inText;
      type = ch == ">" ? "endTag" : "selfcloseTag";
      return "tag bracket";
    } else if (ch == "=") {
      type = "equals";
      return null;
    } else if (ch == "<") {
      state.tokenize = inText;
      state.state = baseState;
      state.tagName = state.tagStart = null;
      var next = state.tokenize(stream, state);
      return next ? next + " tag error" : "tag error";
    } else if (/[\'\"]/.test(ch)) {
      state.tokenize = inAttribute(ch);
      state.stringStartCol = stream.column();
      return state.tokenize(stream, state);
    } else {
      stream.match(/^[^\s\u00a0=<>\"\']*[^\s\u00a0=<>\"\'\/]/);
      return "word";
    }
  }

  function inAttribute(quote) {
    var closure = function(stream, state) {
      while (!stream.eol()) {
        if (stream.next() == quote) {
          state.tokenize = inTag;
          break;
        }
      }
      return "string";
    };
    closure.isInAttribute = true;
    return closure;
  }

  function inBlock(style, terminator) {
    return function(stream, state) {
      while (!stream.eol()) {
        if (stream.match(terminator)) {
          state.tokenize = inText;
          break;
        }
        stream.next();
      }
      return style;
    };
  }
  function doctype(depth) {
    return function(stream, state) {
      var ch;
      while ((ch = stream.next()) != null) {
        if (ch == "<") {
          state.tokenize = doctype(depth + 1);
          return state.tokenize(stream, state);
        } else if (ch == ">") {
          if (depth == 1) {
            state.tokenize = inText;
            break;
          } else {
            state.tokenize = doctype(depth - 1);
            return state.tokenize(stream, state);
          }
        }
      }
      return "meta";
    };
  }

  function Context(state, tagName, startOfLine) {
    this.prev = state.context;
    this.tagName = tagName;
    this.indent = state.indented;
    this.startOfLine = startOfLine;
    if (Kludges.doNotIndent.hasOwnProperty(tagName) || (state.context && state.context.noIndent))
      this.noIndent = true;
  }
  function popContext(state) {
    if (state.context) state.context = state.context.prev;
  }
  function maybePopContext(state, nextTagName) {
    var parentTagName;
    while (true) {
      if (!state.context) {
        return;
      }
      parentTagName = state.context.tagName;
      if (!Kludges.contextGrabbers.hasOwnProperty(parentTagName) ||
          !Kludges.contextGrabbers[parentTagName].hasOwnProperty(nextTagName)) {
        return;
      }
      popContext(state);
    }
  }

  function baseState(type, stream, state) {
    if (type == "openTag") {
      state.tagStart = stream.column();
      return tagNameState;
    } else if (type == "closeTag") {
      return closeTagNameState;
    } else {
      return baseState;
    }
  }
  function tagNameState(type, stream, state) {
    if (type == "word") {
      state.tagName = stream.current();
      setStyle = "tag";
      return attrState;
    } else {
      setStyle = "error";
      return tagNameState;
    }
  }
  function closeTagNameState(type, stream, state) {
    if (type == "word") {
      var tagName = stream.current();
      if (state.context && state.context.tagName != tagName &&
          Kludges.implicitlyClosed.hasOwnProperty(state.context.tagName))
        popContext(state);
      if (state.context && state.context.tagName == tagName) {
        setStyle = "tag";
        return closeState;
      } else {
        setStyle = "tag error";
        return closeStateErr;
      }
    } else {
      setStyle = "error";
      return closeStateErr;
    }
  }

  function closeState(type, _stream, state) {
    if (type != "endTag") {
      setStyle = "error";
      return closeState;
    }
    popContext(state);
    return baseState;
  }
  function closeStateErr(type, stream, state) {
    setStyle = "error";
    return closeState(type, stream, state);
  }

  function attrState(type, _stream, state) {
    if (type == "word") {
      setStyle = "attribute";
      return attrEqState;
    } else if (type == "endTag" || type == "selfcloseTag") {
      var tagName = state.tagName, tagStart = state.tagStart;
      state.tagName = state.tagStart = null;
      if (type == "selfcloseTag" ||
          Kludges.autoSelfClosers.hasOwnProperty(tagName)) {
        maybePopContext(state, tagName);
      } else {
        maybePopContext(state, tagName);
        state.context = new Context(state, tagName, tagStart == state.indented);
      }
      return baseState;
    }
    setStyle = "error";
    return attrState;
  }
  function attrEqState(type, stream, state) {
    if (type == "equals") return attrValueState;
    if (!Kludges.allowMissing) setStyle = "error";
    return attrState(type, stream, state);
  }
  function attrValueState(type, stream, state) {
    if (type == "string") return attrContinuedState;
    if (type == "word" && Kludges.allowUnquoted) {setStyle = "string"; return attrState;}
    setStyle = "error";
    return attrState(type, stream, state);
  }
  function attrContinuedState(type, stream, state) {
    if (type == "string") return attrContinuedState;
    return attrState(type, stream, state);
  }

  return {
    startState: function() {
      return {tokenize: inText,
              state: baseState,
              indented: 0,
              tagName: null, tagStart: null,
              context: null};
    },

    token: function(stream, state) {
      if (!state.tagName && stream.sol())
        state.indented = stream.indentation();

      if (stream.eatSpace()) return null;
      type = null;
      var style = state.tokenize(stream, state);
      if ((style || type) && style != "comment") {
        setStyle = null;
        state.state = state.state(type || style, stream, state);
        if (setStyle)
          style = setStyle == "error" ? style + " error" : setStyle;
      }
      return style;
    },

    indent: function(state, textAfter, fullLine) {
      var context = state.context;
      // Indent multi-line strings (e.g. css).
      if (state.tokenize.isInAttribute) {
        if (state.tagStart == state.indented)
          return state.stringStartCol + 1;
        else
          return state.indented + indentUnit;
      }
      if (context && context.noIndent) return CodeMirror.Pass;
      if (state.tokenize != inTag && state.tokenize != inText)
        return fullLine ? fullLine.match(/^(\s*)/)[0].length : 0;
      // Indent the starts of attribute names.
      if (state.tagName) {
        if (multilineTagIndentPastTag)
          return state.tagStart + state.tagName.length + 2;
        else
          return state.tagStart + indentUnit * multilineTagIndentFactor;
      }
      if (alignCDATA && /<!\[CDATA\[/.test(textAfter)) return 0;
      var tagAfter = textAfter && /^<(\/)?([\w_:\.-]*)/.exec(textAfter);
      if (tagAfter && tagAfter[1]) { // Closing tag spotted
        while (context) {
          if (context.tagName == tagAfter[2]) {
            context = context.prev;
            break;
          } else if (Kludges.implicitlyClosed.hasOwnProperty(context.tagName)) {
            context = context.prev;
          } else {
            break;
          }
        }
      } else if (tagAfter) { // Opening tag spotted
        while (context) {
          var grabbers = Kludges.contextGrabbers[context.tagName];
          if (grabbers && grabbers.hasOwnProperty(tagAfter[2]))
            context = context.prev;
          else
            break;
        }
      }
      while (context && !context.startOfLine)
        context = context.prev;
      if (context) return context.indent + indentUnit;
      else return 0;
    },

    electricInput: /<\/[\s\w:]+>$/,
    blockCommentStart: "<!--",
    blockCommentEnd: "-->",

    configuration: parserConfig.htmlMode ? "html" : "xml",
    helperType: parserConfig.htmlMode ? "html" : "xml"
  };
});

CodeMirror.defineMIME("text/xml", "xml");
CodeMirror.defineMIME("application/xml", "xml");
if (!CodeMirror.mimeModes.hasOwnProperty("text/html"))
  CodeMirror.defineMIME("text/html", {name: "xml", htmlMode: true});

});

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// TODO actually recognize syntax of TypeScript constructs

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define('codemirror/mode/javascript/javascript',["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("javascript", function(config, parserConfig) {
  var indentUnit = config.indentUnit;
  var statementIndent = parserConfig.statementIndent;
  var jsonldMode = parserConfig.jsonld;
  var jsonMode = parserConfig.json || jsonldMode;
  var isTS = parserConfig.typescript;
  var wordRE = parserConfig.wordCharacters || /[\w$\xa1-\uffff]/;

  // Tokenizer

  var keywords = function(){
    function kw(type) {return {type: type, style: "keyword"};}
    var A = kw("keyword a"), B = kw("keyword b"), C = kw("keyword c");
    var operator = kw("operator"), atom = {type: "atom", style: "atom"};

    var jsKeywords = {
      "if": kw("if"), "while": A, "with": A, "else": B, "do": B, "try": B, "finally": B,
      "return": C, "break": C, "continue": C, "new": kw("new"), "delete": C, "throw": C, "debugger": C,
      "var": kw("var"), "const": kw("var"), "let": kw("var"),
      "function": kw("function"), "catch": kw("catch"),
      "for": kw("for"), "switch": kw("switch"), "case": kw("case"), "default": kw("default"),
      "in": operator, "typeof": operator, "instanceof": operator,
      "true": atom, "false": atom, "null": atom, "undefined": atom, "NaN": atom, "Infinity": atom,
      "this": kw("this"), "class": kw("class"), "super": kw("atom"),
      "yield": C, "export": kw("export"), "import": kw("import"), "extends": C
    };

    // Extend the 'normal' keywords with the TypeScript language extensions
    if (isTS) {
      var type = {type: "variable", style: "variable-3"};
      var tsKeywords = {
        // object-like things
        "interface": kw("class"),
        "implements": C,
        "namespace": C,
        "module": kw("module"),
        "enum": kw("module"),

        // scope modifiers
        "public": kw("modifier"),
        "private": kw("modifier"),
        "protected": kw("modifier"),
        "abstract": kw("modifier"),

        // operators
        "as": operator,

        // types
        "string": type, "number": type, "boolean": type, "any": type
      };

      for (var attr in tsKeywords) {
        jsKeywords[attr] = tsKeywords[attr];
      }
    }

    return jsKeywords;
  }();

  var isOperatorChar = /[+\-*&%=<>!?|~^]/;
  var isJsonldKeyword = /^@(context|id|value|language|type|container|list|set|reverse|index|base|vocab|graph)"/;

  function readRegexp(stream) {
    var escaped = false, next, inSet = false;
    while ((next = stream.next()) != null) {
      if (!escaped) {
        if (next == "/" && !inSet) return;
        if (next == "[") inSet = true;
        else if (inSet && next == "]") inSet = false;
      }
      escaped = !escaped && next == "\\";
    }
  }

  // Used as scratch variables to communicate multiple values without
  // consing up tons of objects.
  var type, content;
  function ret(tp, style, cont) {
    type = tp; content = cont;
    return style;
  }
  function tokenBase(stream, state) {
    var ch = stream.next();
    if (ch == '"' || ch == "'") {
      state.tokenize = tokenString(ch);
      return state.tokenize(stream, state);
    } else if (ch == "." && stream.match(/^\d+(?:[eE][+\-]?\d+)?/)) {
      return ret("number", "number");
    } else if (ch == "." && stream.match("..")) {
      return ret("spread", "meta");
    } else if (/[\[\]{}\(\),;\:\.]/.test(ch)) {
      return ret(ch);
    } else if (ch == "=" && stream.eat(">")) {
      return ret("=>", "operator");
    } else if (ch == "0" && stream.eat(/x/i)) {
      stream.eatWhile(/[\da-f]/i);
      return ret("number", "number");
    } else if (ch == "0" && stream.eat(/o/i)) {
      stream.eatWhile(/[0-7]/i);
      return ret("number", "number");
    } else if (ch == "0" && stream.eat(/b/i)) {
      stream.eatWhile(/[01]/i);
      return ret("number", "number");
    } else if (/\d/.test(ch)) {
      stream.match(/^\d*(?:\.\d*)?(?:[eE][+\-]?\d+)?/);
      return ret("number", "number");
    } else if (ch == "/") {
      if (stream.eat("*")) {
        state.tokenize = tokenComment;
        return tokenComment(stream, state);
      } else if (stream.eat("/")) {
        stream.skipToEnd();
        return ret("comment", "comment");
      } else if (/^(?:operator|sof|keyword c|case|new|[\[{}\(,;:])$/.test(state.lastType) ||
                 (state.lastType == "quasi" && /\{\s*$/.test(stream.string.slice(0, stream.pos - 1)))) {
        readRegexp(stream);
        stream.match(/^\b(([gimyu])(?![gimyu]*\2))+\b/);
        return ret("regexp", "string-2");
      } else {
        stream.eatWhile(isOperatorChar);
        return ret("operator", "operator", stream.current());
      }
    } else if (ch == "`") {
      state.tokenize = tokenQuasi;
      return tokenQuasi(stream, state);
    } else if (ch == "#") {
      stream.skipToEnd();
      return ret("error", "error");
    } else if (isOperatorChar.test(ch)) {
      stream.eatWhile(isOperatorChar);
      return ret("operator", "operator", stream.current());
    } else if (wordRE.test(ch)) {
      stream.eatWhile(wordRE);
      var word = stream.current(), known = keywords.propertyIsEnumerable(word) && keywords[word];
      return (known && state.lastType != ".") ? ret(known.type, known.style, word) :
                     ret("variable", "variable", word);
    }
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, next;
      if (jsonldMode && stream.peek() == "@" && stream.match(isJsonldKeyword)){
        state.tokenize = tokenBase;
        return ret("jsonld-keyword", "meta");
      }
      while ((next = stream.next()) != null) {
        if (next == quote && !escaped) break;
        escaped = !escaped && next == "\\";
      }
      if (!escaped) state.tokenize = tokenBase;
      return ret("string", "string");
    };
  }

  function tokenComment(stream, state) {
    var maybeEnd = false, ch;
    while (ch = stream.next()) {
      if (ch == "/" && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return ret("comment", "comment");
  }

  function tokenQuasi(stream, state) {
    var escaped = false, next;
    while ((next = stream.next()) != null) {
      if (!escaped && (next == "`" || next == "$" && stream.eat("{"))) {
        state.tokenize = tokenBase;
        break;
      }
      escaped = !escaped && next == "\\";
    }
    return ret("quasi", "string-2", stream.current());
  }

  var brackets = "([{}])";
  // This is a crude lookahead trick to try and notice that we're
  // parsing the argument patterns for a fat-arrow function before we
  // actually hit the arrow token. It only works if the arrow is on
  // the same line as the arguments and there's no strange noise
  // (comments) in between. Fallback is to only notice when we hit the
  // arrow, and not declare the arguments as locals for the arrow
  // body.
  function findFatArrow(stream, state) {
    if (state.fatArrowAt) state.fatArrowAt = null;
    var arrow = stream.string.indexOf("=>", stream.start);
    if (arrow < 0) return;

    var depth = 0, sawSomething = false;
    for (var pos = arrow - 1; pos >= 0; --pos) {
      var ch = stream.string.charAt(pos);
      var bracket = brackets.indexOf(ch);
      if (bracket >= 0 && bracket < 3) {
        if (!depth) { ++pos; break; }
        if (--depth == 0) break;
      } else if (bracket >= 3 && bracket < 6) {
        ++depth;
      } else if (wordRE.test(ch)) {
        sawSomething = true;
      } else if (/["'\/]/.test(ch)) {
        return;
      } else if (sawSomething && !depth) {
        ++pos;
        break;
      }
    }
    if (sawSomething && !depth) state.fatArrowAt = pos;
  }

  // Parser

  var atomicTypes = {"atom": true, "number": true, "variable": true, "string": true, "regexp": true, "this": true, "jsonld-keyword": true};

  function JSLexical(indented, column, type, align, prev, info) {
    this.indented = indented;
    this.column = column;
    this.type = type;
    this.prev = prev;
    this.info = info;
    if (align != null) this.align = align;
  }

  function inScope(state, varname) {
    for (var v = state.localVars; v; v = v.next)
      if (v.name == varname) return true;
    for (var cx = state.context; cx; cx = cx.prev) {
      for (var v = cx.vars; v; v = v.next)
        if (v.name == varname) return true;
    }
  }

  function parseJS(state, style, type, content, stream) {
    var cc = state.cc;
    // Communicate our context to the combinators.
    // (Less wasteful than consing up a hundred closures on every call.)
    cx.state = state; cx.stream = stream; cx.marked = null, cx.cc = cc; cx.style = style;

    if (!state.lexical.hasOwnProperty("align"))
      state.lexical.align = true;

    while(true) {
      var combinator = cc.length ? cc.pop() : jsonMode ? expression : statement;
      if (combinator(type, content)) {
        while(cc.length && cc[cc.length - 1].lex)
          cc.pop()();
        if (cx.marked) return cx.marked;
        if (type == "variable" && inScope(state, content)) return "variable-2";
        return style;
      }
    }
  }

  // Combinator utils

  var cx = {state: null, column: null, marked: null, cc: null};
  function pass() {
    for (var i = arguments.length - 1; i >= 0; i--) cx.cc.push(arguments[i]);
  }
  function cont() {
    pass.apply(null, arguments);
    return true;
  }
  function register(varname) {
    function inList(list) {
      for (var v = list; v; v = v.next)
        if (v.name == varname) return true;
      return false;
    }
    var state = cx.state;
    cx.marked = "def";
    if (state.context) {
      if (inList(state.localVars)) return;
      state.localVars = {name: varname, next: state.localVars};
    } else {
      if (inList(state.globalVars)) return;
      if (parserConfig.globalVars)
        state.globalVars = {name: varname, next: state.globalVars};
    }
  }

  // Combinators

  var defaultVars = {name: "this", next: {name: "arguments"}};
  function pushcontext() {
    cx.state.context = {prev: cx.state.context, vars: cx.state.localVars};
    cx.state.localVars = defaultVars;
  }
  function popcontext() {
    cx.state.localVars = cx.state.context.vars;
    cx.state.context = cx.state.context.prev;
  }
  function pushlex(type, info) {
    var result = function() {
      var state = cx.state, indent = state.indented;
      if (state.lexical.type == "stat") indent = state.lexical.indented;
      else for (var outer = state.lexical; outer && outer.type == ")" && outer.align; outer = outer.prev)
        indent = outer.indented;
      state.lexical = new JSLexical(indent, cx.stream.column(), type, null, state.lexical, info);
    };
    result.lex = true;
    return result;
  }
  function poplex() {
    var state = cx.state;
    if (state.lexical.prev) {
      if (state.lexical.type == ")")
        state.indented = state.lexical.indented;
      state.lexical = state.lexical.prev;
    }
  }
  poplex.lex = true;

  function expect(wanted) {
    function exp(type) {
      if (type == wanted) return cont();
      else if (wanted == ";") return pass();
      else return cont(exp);
    };
    return exp;
  }

  function statement(type, value) {
    if (type == "var") return cont(pushlex("vardef", value.length), vardef, expect(";"), poplex);
    if (type == "keyword a") return cont(pushlex("form"), expression, statement, poplex);
    if (type == "keyword b") return cont(pushlex("form"), statement, poplex);
    if (type == "{") return cont(pushlex("}"), block, poplex);
    if (type == ";") return cont();
    if (type == "if") {
      if (cx.state.lexical.info == "else" && cx.state.cc[cx.state.cc.length - 1] == poplex)
        cx.state.cc.pop()();
      return cont(pushlex("form"), expression, statement, poplex, maybeelse);
    }
    if (type == "function") return cont(functiondef);
    if (type == "for") return cont(pushlex("form"), forspec, statement, poplex);
    if (type == "variable") return cont(pushlex("stat"), maybelabel);
    if (type == "switch") return cont(pushlex("form"), expression, pushlex("}", "switch"), expect("{"),
                                      block, poplex, poplex);
    if (type == "case") return cont(expression, expect(":"));
    if (type == "default") return cont(expect(":"));
    if (type == "catch") return cont(pushlex("form"), pushcontext, expect("("), funarg, expect(")"),
                                     statement, poplex, popcontext);
    if (type == "class") return cont(pushlex("form"), className, poplex);
    if (type == "export") return cont(pushlex("stat"), afterExport, poplex);
    if (type == "import") return cont(pushlex("stat"), afterImport, poplex);
    if (type == "module") return cont(pushlex("form"), pattern, pushlex("}"), expect("{"), block, poplex, poplex)
    return pass(pushlex("stat"), expression, expect(";"), poplex);
  }
  function expression(type) {
    return expressionInner(type, false);
  }
  function expressionNoComma(type) {
    return expressionInner(type, true);
  }
  function expressionInner(type, noComma) {
    if (cx.state.fatArrowAt == cx.stream.start) {
      var body = noComma ? arrowBodyNoComma : arrowBody;
      if (type == "(") return cont(pushcontext, pushlex(")"), commasep(pattern, ")"), poplex, expect("=>"), body, popcontext);
      else if (type == "variable") return pass(pushcontext, pattern, expect("=>"), body, popcontext);
    }

    var maybeop = noComma ? maybeoperatorNoComma : maybeoperatorComma;
    if (atomicTypes.hasOwnProperty(type)) return cont(maybeop);
    if (type == "function") return cont(functiondef, maybeop);
    if (type == "keyword c") return cont(noComma ? maybeexpressionNoComma : maybeexpression);
    if (type == "(") return cont(pushlex(")"), maybeexpression, comprehension, expect(")"), poplex, maybeop);
    if (type == "operator" || type == "spread") return cont(noComma ? expressionNoComma : expression);
    if (type == "[") return cont(pushlex("]"), arrayLiteral, poplex, maybeop);
    if (type == "{") return contCommasep(objprop, "}", null, maybeop);
    if (type == "quasi") return pass(quasi, maybeop);
    if (type == "new") return cont(maybeTarget(noComma));
    return cont();
  }
  function maybeexpression(type) {
    if (type.match(/[;\}\)\],]/)) return pass();
    return pass(expression);
  }
  function maybeexpressionNoComma(type) {
    if (type.match(/[;\}\)\],]/)) return pass();
    return pass(expressionNoComma);
  }

  function maybeoperatorComma(type, value) {
    if (type == ",") return cont(expression);
    return maybeoperatorNoComma(type, value, false);
  }
  function maybeoperatorNoComma(type, value, noComma) {
    var me = noComma == false ? maybeoperatorComma : maybeoperatorNoComma;
    var expr = noComma == false ? expression : expressionNoComma;
    if (type == "=>") return cont(pushcontext, noComma ? arrowBodyNoComma : arrowBody, popcontext);
    if (type == "operator") {
      if (/\+\+|--/.test(value)) return cont(me);
      if (value == "?") return cont(expression, expect(":"), expr);
      return cont(expr);
    }
    if (type == "quasi") { return pass(quasi, me); }
    if (type == ";") return;
    if (type == "(") return contCommasep(expressionNoComma, ")", "call", me);
    if (type == ".") return cont(property, me);
    if (type == "[") return cont(pushlex("]"), maybeexpression, expect("]"), poplex, me);
  }
  function quasi(type, value) {
    if (type != "quasi") return pass();
    if (value.slice(value.length - 2) != "${") return cont(quasi);
    return cont(expression, continueQuasi);
  }
  function continueQuasi(type) {
    if (type == "}") {
      cx.marked = "string-2";
      cx.state.tokenize = tokenQuasi;
      return cont(quasi);
    }
  }
  function arrowBody(type) {
    findFatArrow(cx.stream, cx.state);
    return pass(type == "{" ? statement : expression);
  }
  function arrowBodyNoComma(type) {
    findFatArrow(cx.stream, cx.state);
    return pass(type == "{" ? statement : expressionNoComma);
  }
  function maybeTarget(noComma) {
    return function(type) {
      if (type == ".") return cont(noComma ? targetNoComma : target);
      else return pass(noComma ? expressionNoComma : expression);
    };
  }
  function target(_, value) {
    if (value == "target") { cx.marked = "keyword"; return cont(maybeoperatorComma); }
  }
  function targetNoComma(_, value) {
    if (value == "target") { cx.marked = "keyword"; return cont(maybeoperatorNoComma); }
  }
  function maybelabel(type) {
    if (type == ":") return cont(poplex, statement);
    return pass(maybeoperatorComma, expect(";"), poplex);
  }
  function property(type) {
    if (type == "variable") {cx.marked = "property"; return cont();}
  }
  function objprop(type, value) {
    if (type == "variable" || cx.style == "keyword") {
      cx.marked = "property";
      if (value == "get" || value == "set") return cont(getterSetter);
      return cont(afterprop);
    } else if (type == "number" || type == "string") {
      cx.marked = jsonldMode ? "property" : (cx.style + " property");
      return cont(afterprop);
    } else if (type == "jsonld-keyword") {
      return cont(afterprop);
    } else if (type == "modifier") {
      return cont(objprop)
    } else if (type == "[") {
      return cont(expression, expect("]"), afterprop);
    } else if (type == "spread") {
      return cont(expression);
    }
  }
  function getterSetter(type) {
    if (type != "variable") return pass(afterprop);
    cx.marked = "property";
    return cont(functiondef);
  }
  function afterprop(type) {
    if (type == ":") return cont(expressionNoComma);
    if (type == "(") return pass(functiondef);
  }
  function commasep(what, end) {
    function proceed(type) {
      if (type == ",") {
        var lex = cx.state.lexical;
        if (lex.info == "call") lex.pos = (lex.pos || 0) + 1;
        return cont(what, proceed);
      }
      if (type == end) return cont();
      return cont(expect(end));
    }
    return function(type) {
      if (type == end) return cont();
      return pass(what, proceed);
    };
  }
  function contCommasep(what, end, info) {
    for (var i = 3; i < arguments.length; i++)
      cx.cc.push(arguments[i]);
    return cont(pushlex(end, info), commasep(what, end), poplex);
  }
  function block(type) {
    if (type == "}") return cont();
    return pass(statement, block);
  }
  function maybetype(type) {
    if (isTS && type == ":") return cont(typedef);
  }
  function maybedefault(_, value) {
    if (value == "=") return cont(expressionNoComma);
  }
  function typedef(type) {
    if (type == "variable") {cx.marked = "variable-3"; return cont();}
  }
  function vardef() {
    return pass(pattern, maybetype, maybeAssign, vardefCont);
  }
  function pattern(type, value) {
    if (type == "modifier") return cont(pattern)
    if (type == "variable") { register(value); return cont(); }
    if (type == "spread") return cont(pattern);
    if (type == "[") return contCommasep(pattern, "]");
    if (type == "{") return contCommasep(proppattern, "}");
  }
  function proppattern(type, value) {
    if (type == "variable" && !cx.stream.match(/^\s*:/, false)) {
      register(value);
      return cont(maybeAssign);
    }
    if (type == "variable") cx.marked = "property";
    if (type == "spread") return cont(pattern);
    return cont(expect(":"), pattern, maybeAssign);
  }
  function maybeAssign(_type, value) {
    if (value == "=") return cont(expressionNoComma);
  }
  function vardefCont(type) {
    if (type == ",") return cont(vardef);
  }
  function maybeelse(type, value) {
    if (type == "keyword b" && value == "else") return cont(pushlex("form", "else"), statement, poplex);
  }
  function forspec(type) {
    if (type == "(") return cont(pushlex(")"), forspec1, expect(")"), poplex);
  }
  function forspec1(type) {
    if (type == "var") return cont(vardef, expect(";"), forspec2);
    if (type == ";") return cont(forspec2);
    if (type == "variable") return cont(formaybeinof);
    return pass(expression, expect(";"), forspec2);
  }
  function formaybeinof(_type, value) {
    if (value == "in" || value == "of") { cx.marked = "keyword"; return cont(expression); }
    return cont(maybeoperatorComma, forspec2);
  }
  function forspec2(type, value) {
    if (type == ";") return cont(forspec3);
    if (value == "in" || value == "of") { cx.marked = "keyword"; return cont(expression); }
    return pass(expression, expect(";"), forspec3);
  }
  function forspec3(type) {
    if (type != ")") cont(expression);
  }
  function functiondef(type, value) {
    if (value == "*") {cx.marked = "keyword"; return cont(functiondef);}
    if (type == "variable") {register(value); return cont(functiondef);}
    if (type == "(") return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, statement, popcontext);
  }
  function funarg(type) {
    if (type == "spread") return cont(funarg);
    return pass(pattern, maybetype, maybedefault);
  }
  function className(type, value) {
    if (type == "variable") {register(value); return cont(classNameAfter);}
  }
  function classNameAfter(type, value) {
    if (value == "extends") return cont(expression, classNameAfter);
    if (type == "{") return cont(pushlex("}"), classBody, poplex);
  }
  function classBody(type, value) {
    if (type == "variable" || cx.style == "keyword") {
      if (value == "static") {
        cx.marked = "keyword";
        return cont(classBody);
      }
      cx.marked = "property";
      if (value == "get" || value == "set") return cont(classGetterSetter, functiondef, classBody);
      return cont(functiondef, classBody);
    }
    if (value == "*") {
      cx.marked = "keyword";
      return cont(classBody);
    }
    if (type == ";") return cont(classBody);
    if (type == "}") return cont();
  }
  function classGetterSetter(type) {
    if (type != "variable") return pass();
    cx.marked = "property";
    return cont();
  }
  function afterExport(_type, value) {
    if (value == "*") { cx.marked = "keyword"; return cont(maybeFrom, expect(";")); }
    if (value == "default") { cx.marked = "keyword"; return cont(expression, expect(";")); }
    return pass(statement);
  }
  function afterImport(type) {
    if (type == "string") return cont();
    return pass(importSpec, maybeFrom);
  }
  function importSpec(type, value) {
    if (type == "{") return contCommasep(importSpec, "}");
    if (type == "variable") register(value);
    if (value == "*") cx.marked = "keyword";
    return cont(maybeAs);
  }
  function maybeAs(_type, value) {
    if (value == "as") { cx.marked = "keyword"; return cont(importSpec); }
  }
  function maybeFrom(_type, value) {
    if (value == "from") { cx.marked = "keyword"; return cont(expression); }
  }
  function arrayLiteral(type) {
    if (type == "]") return cont();
    return pass(expressionNoComma, maybeArrayComprehension);
  }
  function maybeArrayComprehension(type) {
    if (type == "for") return pass(comprehension, expect("]"));
    if (type == ",") return cont(commasep(maybeexpressionNoComma, "]"));
    return pass(commasep(expressionNoComma, "]"));
  }
  function comprehension(type) {
    if (type == "for") return cont(forspec, comprehension);
    if (type == "if") return cont(expression, comprehension);
  }

  function isContinuedStatement(state, textAfter) {
    return state.lastType == "operator" || state.lastType == "," ||
      isOperatorChar.test(textAfter.charAt(0)) ||
      /[,.]/.test(textAfter.charAt(0));
  }

  // Interface

  return {
    startState: function(basecolumn) {
      var state = {
        tokenize: tokenBase,
        lastType: "sof",
        cc: [],
        lexical: new JSLexical((basecolumn || 0) - indentUnit, 0, "block", false),
        localVars: parserConfig.localVars,
        context: parserConfig.localVars && {vars: parserConfig.localVars},
        indented: 0
      };
      if (parserConfig.globalVars && typeof parserConfig.globalVars == "object")
        state.globalVars = parserConfig.globalVars;
      return state;
    },

    token: function(stream, state) {
      if (stream.sol()) {
        if (!state.lexical.hasOwnProperty("align"))
          state.lexical.align = false;
        state.indented = stream.indentation();
        findFatArrow(stream, state);
      }
      if (state.tokenize != tokenComment && stream.eatSpace()) return null;
      var style = state.tokenize(stream, state);
      if (type == "comment") return style;
      state.lastType = type == "operator" && (content == "++" || content == "--") ? "incdec" : type;
      return parseJS(state, style, type, content, stream);
    },

    indent: function(state, textAfter) {
      if (state.tokenize == tokenComment) return CodeMirror.Pass;
      if (state.tokenize != tokenBase) return 0;
      var firstChar = textAfter && textAfter.charAt(0), lexical = state.lexical;
      // Kludge to prevent 'maybelse' from blocking lexical scope pops
      if (!/^\s*else\b/.test(textAfter)) for (var i = state.cc.length - 1; i >= 0; --i) {
        var c = state.cc[i];
        if (c == poplex) lexical = lexical.prev;
        else if (c != maybeelse) break;
      }
      if (lexical.type == "stat" && firstChar == "}") lexical = lexical.prev;
      if (statementIndent && lexical.type == ")" && lexical.prev.type == "stat")
        lexical = lexical.prev;
      var type = lexical.type, closing = firstChar == type;

      if (type == "vardef") return lexical.indented + (state.lastType == "operator" || state.lastType == "," ? lexical.info + 1 : 0);
      else if (type == "form" && firstChar == "{") return lexical.indented;
      else if (type == "form") return lexical.indented + indentUnit;
      else if (type == "stat")
        return lexical.indented + (isContinuedStatement(state, textAfter) ? statementIndent || indentUnit : 0);
      else if (lexical.info == "switch" && !closing && parserConfig.doubleIndentSwitch != false)
        return lexical.indented + (/^(?:case|default)\b/.test(textAfter) ? indentUnit : 2 * indentUnit);
      else if (lexical.align) return lexical.column + (closing ? 0 : 1);
      else return lexical.indented + (closing ? 0 : indentUnit);
    },

    electricInput: /^\s*(?:case .*?:|default:|\{|\})$/,
    blockCommentStart: jsonMode ? null : "/*",
    blockCommentEnd: jsonMode ? null : "*/",
    lineComment: jsonMode ? null : "//",
    fold: "brace",
    closeBrackets: "()[]{}''\"\"``",

    helperType: jsonMode ? "json" : "javascript",
    jsonldMode: jsonldMode,
    jsonMode: jsonMode
  };
});

CodeMirror.registerHelper("wordChars", "javascript", /[\w$]/);

CodeMirror.defineMIME("text/javascript", "javascript");
CodeMirror.defineMIME("text/ecmascript", "javascript");
CodeMirror.defineMIME("application/javascript", "javascript");
CodeMirror.defineMIME("application/x-javascript", "javascript");
CodeMirror.defineMIME("application/ecmascript", "javascript");
CodeMirror.defineMIME("application/json", {name: "javascript", json: true});
CodeMirror.defineMIME("application/x-json", {name: "javascript", json: true});
CodeMirror.defineMIME("application/ld+json", {name: "javascript", jsonld: true});
CodeMirror.defineMIME("text/typescript", { name: "javascript", typescript: true });
CodeMirror.defineMIME("application/typescript", { name: "javascript", typescript: true });

});

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define('codemirror/mode/css/css',["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("css", function(config, parserConfig) {
  var inline = parserConfig.inline
  if (!parserConfig.propertyKeywords) parserConfig = CodeMirror.resolveMode("text/css");

  var indentUnit = config.indentUnit,
      tokenHooks = parserConfig.tokenHooks,
      documentTypes = parserConfig.documentTypes || {},
      mediaTypes = parserConfig.mediaTypes || {},
      mediaFeatures = parserConfig.mediaFeatures || {},
      mediaValueKeywords = parserConfig.mediaValueKeywords || {},
      propertyKeywords = parserConfig.propertyKeywords || {},
      nonStandardPropertyKeywords = parserConfig.nonStandardPropertyKeywords || {},
      fontProperties = parserConfig.fontProperties || {},
      counterDescriptors = parserConfig.counterDescriptors || {},
      colorKeywords = parserConfig.colorKeywords || {},
      valueKeywords = parserConfig.valueKeywords || {},
      allowNested = parserConfig.allowNested,
      supportsAtComponent = parserConfig.supportsAtComponent === true;

  var type, override;
  function ret(style, tp) { type = tp; return style; }

  // Tokenizers

  function tokenBase(stream, state) {
    var ch = stream.next();
    if (tokenHooks[ch]) {
      var result = tokenHooks[ch](stream, state);
      if (result !== false) return result;
    }
    if (ch == "@") {
      stream.eatWhile(/[\w\\\-]/);
      return ret("def", stream.current());
    } else if (ch == "=" || (ch == "~" || ch == "|") && stream.eat("=")) {
      return ret(null, "compare");
    } else if (ch == "\"" || ch == "'") {
      state.tokenize = tokenString(ch);
      return state.tokenize(stream, state);
    } else if (ch == "#") {
      stream.eatWhile(/[\w\\\-]/);
      return ret("atom", "hash");
    } else if (ch == "!") {
      stream.match(/^\s*\w*/);
      return ret("keyword", "important");
    } else if (/\d/.test(ch) || ch == "." && stream.eat(/\d/)) {
      stream.eatWhile(/[\w.%]/);
      return ret("number", "unit");
    } else if (ch === "-") {
      if (/[\d.]/.test(stream.peek())) {
        stream.eatWhile(/[\w.%]/);
        return ret("number", "unit");
      } else if (stream.match(/^-[\w\\\-]+/)) {
        stream.eatWhile(/[\w\\\-]/);
        if (stream.match(/^\s*:/, false))
          return ret("variable-2", "variable-definition");
        return ret("variable-2", "variable");
      } else if (stream.match(/^\w+-/)) {
        return ret("meta", "meta");
      }
    } else if (/[,+>*\/]/.test(ch)) {
      return ret(null, "select-op");
    } else if (ch == "." && stream.match(/^-?[_a-z][_a-z0-9-]*/i)) {
      return ret("qualifier", "qualifier");
    } else if (/[:;{}\[\]\(\)]/.test(ch)) {
      return ret(null, ch);
    } else if ((ch == "u" && stream.match(/rl(-prefix)?\(/)) ||
               (ch == "d" && stream.match("omain(")) ||
               (ch == "r" && stream.match("egexp("))) {
      stream.backUp(1);
      state.tokenize = tokenParenthesized;
      return ret("property", "word");
    } else if (/[\w\\\-]/.test(ch)) {
      stream.eatWhile(/[\w\\\-]/);
      return ret("property", "word");
    } else {
      return ret(null, null);
    }
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, ch;
      while ((ch = stream.next()) != null) {
        if (ch == quote && !escaped) {
          if (quote == ")") stream.backUp(1);
          break;
        }
        escaped = !escaped && ch == "\\";
      }
      if (ch == quote || !escaped && quote != ")") state.tokenize = null;
      return ret("string", "string");
    };
  }

  function tokenParenthesized(stream, state) {
    stream.next(); // Must be '('
    if (!stream.match(/\s*[\"\')]/, false))
      state.tokenize = tokenString(")");
    else
      state.tokenize = null;
    return ret(null, "(");
  }

  // Context management

  function Context(type, indent, prev) {
    this.type = type;
    this.indent = indent;
    this.prev = prev;
  }

  function pushContext(state, stream, type, indent) {
    state.context = new Context(type, stream.indentation() + (indent === false ? 0 : indentUnit), state.context);
    return type;
  }

  function popContext(state) {
    if (state.context.prev)
      state.context = state.context.prev;
    return state.context.type;
  }

  function pass(type, stream, state) {
    return states[state.context.type](type, stream, state);
  }
  function popAndPass(type, stream, state, n) {
    for (var i = n || 1; i > 0; i--)
      state.context = state.context.prev;
    return pass(type, stream, state);
  }

  // Parser

  function wordAsValue(stream) {
    var word = stream.current().toLowerCase();
    if (valueKeywords.hasOwnProperty(word))
      override = "atom";
    else if (colorKeywords.hasOwnProperty(word))
      override = "keyword";
    else
      override = "variable";
  }

  var states = {};

  states.top = function(type, stream, state) {
    if (type == "{") {
      return pushContext(state, stream, "block");
    } else if (type == "}" && state.context.prev) {
      return popContext(state);
    } else if (supportsAtComponent && /@component/.test(type)) {
      return pushContext(state, stream, "atComponentBlock");
    } else if (/^@(-moz-)?document$/.test(type)) {
      return pushContext(state, stream, "documentTypes");
    } else if (/^@(media|supports|(-moz-)?document|import)$/.test(type)) {
      return pushContext(state, stream, "atBlock");
    } else if (/^@(font-face|counter-style)/.test(type)) {
      state.stateArg = type;
      return "restricted_atBlock_before";
    } else if (/^@(-(moz|ms|o|webkit)-)?keyframes$/.test(type)) {
      return "keyframes";
    } else if (type && type.charAt(0) == "@") {
      return pushContext(state, stream, "at");
    } else if (type == "hash") {
      override = "builtin";
    } else if (type == "word") {
      override = "tag";
    } else if (type == "variable-definition") {
      return "maybeprop";
    } else if (type == "interpolation") {
      return pushContext(state, stream, "interpolation");
    } else if (type == ":") {
      return "pseudo";
    } else if (allowNested && type == "(") {
      return pushContext(state, stream, "parens");
    }
    return state.context.type;
  };

  states.block = function(type, stream, state) {
    if (type == "word") {
      var word = stream.current().toLowerCase();
      if (propertyKeywords.hasOwnProperty(word)) {
        override = "property";
        return "maybeprop";
      } else if (nonStandardPropertyKeywords.hasOwnProperty(word)) {
        override = "string-2";
        return "maybeprop";
      } else if (allowNested) {
        override = stream.match(/^\s*:(?:\s|$)/, false) ? "property" : "tag";
        return "block";
      } else {
        override += " error";
        return "maybeprop";
      }
    } else if (type == "meta") {
      return "block";
    } else if (!allowNested && (type == "hash" || type == "qualifier")) {
      override = "error";
      return "block";
    } else {
      return states.top(type, stream, state);
    }
  };

  states.maybeprop = function(type, stream, state) {
    if (type == ":") return pushContext(state, stream, "prop");
    return pass(type, stream, state);
  };

  states.prop = function(type, stream, state) {
    if (type == ";") return popContext(state);
    if (type == "{" && allowNested) return pushContext(state, stream, "propBlock");
    if (type == "}" || type == "{") return popAndPass(type, stream, state);
    if (type == "(") return pushContext(state, stream, "parens");

    if (type == "hash" && !/^#([0-9a-fA-f]{3,4}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/.test(stream.current())) {
      override += " error";
    } else if (type == "word") {
      wordAsValue(stream);
    } else if (type == "interpolation") {
      return pushContext(state, stream, "interpolation");
    }
    return "prop";
  };

  states.propBlock = function(type, _stream, state) {
    if (type == "}") return popContext(state);
    if (type == "word") { override = "property"; return "maybeprop"; }
    return state.context.type;
  };

  states.parens = function(type, stream, state) {
    if (type == "{" || type == "}") return popAndPass(type, stream, state);
    if (type == ")") return popContext(state);
    if (type == "(") return pushContext(state, stream, "parens");
    if (type == "interpolation") return pushContext(state, stream, "interpolation");
    if (type == "word") wordAsValue(stream);
    return "parens";
  };

  states.pseudo = function(type, stream, state) {
    if (type == "word") {
      override = "variable-3";
      return state.context.type;
    }
    return pass(type, stream, state);
  };

  states.documentTypes = function(type, stream, state) {
    if (type == "word" && documentTypes.hasOwnProperty(stream.current())) {
      override = "tag";
      return state.context.type;
    } else {
      return states.atBlock(type, stream, state);
    }
  };

  states.atBlock = function(type, stream, state) {
    if (type == "(") return pushContext(state, stream, "atBlock_parens");
    if (type == "}" || type == ";") return popAndPass(type, stream, state);
    if (type == "{") return popContext(state) && pushContext(state, stream, allowNested ? "block" : "top");

    if (type == "interpolation") return pushContext(state, stream, "interpolation");

    if (type == "word") {
      var word = stream.current().toLowerCase();
      if (word == "only" || word == "not" || word == "and" || word == "or")
        override = "keyword";
      else if (mediaTypes.hasOwnProperty(word))
        override = "attribute";
      else if (mediaFeatures.hasOwnProperty(word))
        override = "property";
      else if (mediaValueKeywords.hasOwnProperty(word))
        override = "keyword";
      else if (propertyKeywords.hasOwnProperty(word))
        override = "property";
      else if (nonStandardPropertyKeywords.hasOwnProperty(word))
        override = "string-2";
      else if (valueKeywords.hasOwnProperty(word))
        override = "atom";
      else if (colorKeywords.hasOwnProperty(word))
        override = "keyword";
      else
        override = "error";
    }
    return state.context.type;
  };

  states.atComponentBlock = function(type, stream, state) {
    if (type == "}")
      return popAndPass(type, stream, state);
    if (type == "{")
      return popContext(state) && pushContext(state, stream, allowNested ? "block" : "top", false);
    if (type == "word")
      override = "error";
    return state.context.type;
  };

  states.atBlock_parens = function(type, stream, state) {
    if (type == ")") return popContext(state);
    if (type == "{" || type == "}") return popAndPass(type, stream, state, 2);
    return states.atBlock(type, stream, state);
  };

  states.restricted_atBlock_before = function(type, stream, state) {
    if (type == "{")
      return pushContext(state, stream, "restricted_atBlock");
    if (type == "word" && state.stateArg == "@counter-style") {
      override = "variable";
      return "restricted_atBlock_before";
    }
    return pass(type, stream, state);
  };

  states.restricted_atBlock = function(type, stream, state) {
    if (type == "}") {
      state.stateArg = null;
      return popContext(state);
    }
    if (type == "word") {
      if ((state.stateArg == "@font-face" && !fontProperties.hasOwnProperty(stream.current().toLowerCase())) ||
          (state.stateArg == "@counter-style" && !counterDescriptors.hasOwnProperty(stream.current().toLowerCase())))
        override = "error";
      else
        override = "property";
      return "maybeprop";
    }
    return "restricted_atBlock";
  };

  states.keyframes = function(type, stream, state) {
    if (type == "word") { override = "variable"; return "keyframes"; }
    if (type == "{") return pushContext(state, stream, "top");
    return pass(type, stream, state);
  };

  states.at = function(type, stream, state) {
    if (type == ";") return popContext(state);
    if (type == "{" || type == "}") return popAndPass(type, stream, state);
    if (type == "word") override = "tag";
    else if (type == "hash") override = "builtin";
    return "at";
  };

  states.interpolation = function(type, stream, state) {
    if (type == "}") return popContext(state);
    if (type == "{" || type == ";") return popAndPass(type, stream, state);
    if (type == "word") override = "variable";
    else if (type != "variable" && type != "(" && type != ")") override = "error";
    return "interpolation";
  };

  return {
    startState: function(base) {
      return {tokenize: null,
              state: inline ? "block" : "top",
              stateArg: null,
              context: new Context(inline ? "block" : "top", base || 0, null)};
    },

    token: function(stream, state) {
      if (!state.tokenize && stream.eatSpace()) return null;
      var style = (state.tokenize || tokenBase)(stream, state);
      if (style && typeof style == "object") {
        type = style[1];
        style = style[0];
      }
      override = style;
      state.state = states[state.state](type, stream, state);
      return override;
    },

    indent: function(state, textAfter) {
      var cx = state.context, ch = textAfter && textAfter.charAt(0);
      var indent = cx.indent;
      if (cx.type == "prop" && (ch == "}" || ch == ")")) cx = cx.prev;
      if (cx.prev) {
        if (ch == "}" && (cx.type == "block" || cx.type == "top" ||
                          cx.type == "interpolation" || cx.type == "restricted_atBlock")) {
          // Resume indentation from parent context.
          cx = cx.prev;
          indent = cx.indent;
        } else if (ch == ")" && (cx.type == "parens" || cx.type == "atBlock_parens") ||
            ch == "{" && (cx.type == "at" || cx.type == "atBlock")) {
          // Dedent relative to current context.
          indent = Math.max(0, cx.indent - indentUnit);
          cx = cx.prev;
        }
      }
      return indent;
    },

    electricChars: "}",
    blockCommentStart: "/*",
    blockCommentEnd: "*/",
    fold: "brace"
  };
});

  function keySet(array) {
    var keys = {};
    for (var i = 0; i < array.length; ++i) {
      keys[array[i]] = true;
    }
    return keys;
  }

  var documentTypes_ = [
    "domain", "regexp", "url", "url-prefix"
  ], documentTypes = keySet(documentTypes_);

  var mediaTypes_ = [
    "all", "aural", "braille", "handheld", "print", "projection", "screen",
    "tty", "tv", "embossed"
  ], mediaTypes = keySet(mediaTypes_);

  var mediaFeatures_ = [
    "width", "min-width", "max-width", "height", "min-height", "max-height",
    "device-width", "min-device-width", "max-device-width", "device-height",
    "min-device-height", "max-device-height", "aspect-ratio",
    "min-aspect-ratio", "max-aspect-ratio", "device-aspect-ratio",
    "min-device-aspect-ratio", "max-device-aspect-ratio", "color", "min-color",
    "max-color", "color-index", "min-color-index", "max-color-index",
    "monochrome", "min-monochrome", "max-monochrome", "resolution",
    "min-resolution", "max-resolution", "scan", "grid", "orientation",
    "device-pixel-ratio", "min-device-pixel-ratio", "max-device-pixel-ratio",
    "pointer", "any-pointer", "hover", "any-hover"
  ], mediaFeatures = keySet(mediaFeatures_);

  var mediaValueKeywords_ = [
    "landscape", "portrait", "none", "coarse", "fine", "on-demand", "hover",
    "interlace", "progressive"
  ], mediaValueKeywords = keySet(mediaValueKeywords_);

  var propertyKeywords_ = [
    "align-content", "align-items", "align-self", "alignment-adjust",
    "alignment-baseline", "anchor-point", "animation", "animation-delay",
    "animation-direction", "animation-duration", "animation-fill-mode",
    "animation-iteration-count", "animation-name", "animation-play-state",
    "animation-timing-function", "appearance", "azimuth", "backface-visibility",
    "background", "background-attachment", "background-clip", "background-color",
    "background-image", "background-origin", "background-position",
    "background-repeat", "background-size", "baseline-shift", "binding",
    "bleed", "bookmark-label", "bookmark-level", "bookmark-state",
    "bookmark-target", "border", "border-bottom", "border-bottom-color",
    "border-bottom-left-radius", "border-bottom-right-radius",
    "border-bottom-style", "border-bottom-width", "border-collapse",
    "border-color", "border-image", "border-image-outset",
    "border-image-repeat", "border-image-slice", "border-image-source",
    "border-image-width", "border-left", "border-left-color",
    "border-left-style", "border-left-width", "border-radius", "border-right",
    "border-right-color", "border-right-style", "border-right-width",
    "border-spacing", "border-style", "border-top", "border-top-color",
    "border-top-left-radius", "border-top-right-radius", "border-top-style",
    "border-top-width", "border-width", "bottom", "box-decoration-break",
    "box-shadow", "box-sizing", "break-after", "break-before", "break-inside",
    "caption-side", "clear", "clip", "color", "color-profile", "column-count",
    "column-fill", "column-gap", "column-rule", "column-rule-color",
    "column-rule-style", "column-rule-width", "column-span", "column-width",
    "columns", "content", "counter-increment", "counter-reset", "crop", "cue",
    "cue-after", "cue-before", "cursor", "direction", "display",
    "dominant-baseline", "drop-initial-after-adjust",
    "drop-initial-after-align", "drop-initial-before-adjust",
    "drop-initial-before-align", "drop-initial-size", "drop-initial-value",
    "elevation", "empty-cells", "fit", "fit-position", "flex", "flex-basis",
    "flex-direction", "flex-flow", "flex-grow", "flex-shrink", "flex-wrap",
    "float", "float-offset", "flow-from", "flow-into", "font", "font-feature-settings",
    "font-family", "font-kerning", "font-language-override", "font-size", "font-size-adjust",
    "font-stretch", "font-style", "font-synthesis", "font-variant",
    "font-variant-alternates", "font-variant-caps", "font-variant-east-asian",
    "font-variant-ligatures", "font-variant-numeric", "font-variant-position",
    "font-weight", "grid", "grid-area", "grid-auto-columns", "grid-auto-flow",
    "grid-auto-position", "grid-auto-rows", "grid-column", "grid-column-end",
    "grid-column-start", "grid-row", "grid-row-end", "grid-row-start",
    "grid-template", "grid-template-areas", "grid-template-columns",
    "grid-template-rows", "hanging-punctuation", "height", "hyphens",
    "icon", "image-orientation", "image-rendering", "image-resolution",
    "inline-box-align", "justify-content", "left", "letter-spacing",
    "line-break", "line-height", "line-stacking", "line-stacking-ruby",
    "line-stacking-shift", "line-stacking-strategy", "list-style",
    "list-style-image", "list-style-position", "list-style-type", "margin",
    "margin-bottom", "margin-left", "margin-right", "margin-top",
    "marker-offset", "marks", "marquee-direction", "marquee-loop",
    "marquee-play-count", "marquee-speed", "marquee-style", "max-height",
    "max-width", "min-height", "min-width", "move-to", "nav-down", "nav-index",
    "nav-left", "nav-right", "nav-up", "object-fit", "object-position",
    "opacity", "order", "orphans", "outline",
    "outline-color", "outline-offset", "outline-style", "outline-width",
    "overflow", "overflow-style", "overflow-wrap", "overflow-x", "overflow-y",
    "padding", "padding-bottom", "padding-left", "padding-right", "padding-top",
    "page", "page-break-after", "page-break-before", "page-break-inside",
    "page-policy", "pause", "pause-after", "pause-before", "perspective",
    "perspective-origin", "pitch", "pitch-range", "play-during", "position",
    "presentation-level", "punctuation-trim", "quotes", "region-break-after",
    "region-break-before", "region-break-inside", "region-fragment",
    "rendering-intent", "resize", "rest", "rest-after", "rest-before", "richness",
    "right", "rotation", "rotation-point", "ruby-align", "ruby-overhang",
    "ruby-position", "ruby-span", "shape-image-threshold", "shape-inside", "shape-margin",
    "shape-outside", "size", "speak", "speak-as", "speak-header",
    "speak-numeral", "speak-punctuation", "speech-rate", "stress", "string-set",
    "tab-size", "table-layout", "target", "target-name", "target-new",
    "target-position", "text-align", "text-align-last", "text-decoration",
    "text-decoration-color", "text-decoration-line", "text-decoration-skip",
    "text-decoration-style", "text-emphasis", "text-emphasis-color",
    "text-emphasis-position", "text-emphasis-style", "text-height",
    "text-indent", "text-justify", "text-outline", "text-overflow", "text-shadow",
    "text-size-adjust", "text-space-collapse", "text-transform", "text-underline-position",
    "text-wrap", "top", "transform", "transform-origin", "transform-style",
    "transition", "transition-delay", "transition-duration",
    "transition-property", "transition-timing-function", "unicode-bidi",
    "vertical-align", "visibility", "voice-balance", "voice-duration",
    "voice-family", "voice-pitch", "voice-range", "voice-rate", "voice-stress",
    "voice-volume", "volume", "white-space", "widows", "width", "word-break",
    "word-spacing", "word-wrap", "z-index",
    // SVG-specific
    "clip-path", "clip-rule", "mask", "enable-background", "filter", "flood-color",
    "flood-opacity", "lighting-color", "stop-color", "stop-opacity", "pointer-events",
    "color-interpolation", "color-interpolation-filters",
    "color-rendering", "fill", "fill-opacity", "fill-rule", "image-rendering",
    "marker", "marker-end", "marker-mid", "marker-start", "shape-rendering", "stroke",
    "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin",
    "stroke-miterlimit", "stroke-opacity", "stroke-width", "text-rendering",
    "baseline-shift", "dominant-baseline", "glyph-orientation-horizontal",
    "glyph-orientation-vertical", "text-anchor", "writing-mode"
  ], propertyKeywords = keySet(propertyKeywords_);

  var nonStandardPropertyKeywords_ = [
    "scrollbar-arrow-color", "scrollbar-base-color", "scrollbar-dark-shadow-color",
    "scrollbar-face-color", "scrollbar-highlight-color", "scrollbar-shadow-color",
    "scrollbar-3d-light-color", "scrollbar-track-color", "shape-inside",
    "searchfield-cancel-button", "searchfield-decoration", "searchfield-results-button",
    "searchfield-results-decoration", "zoom"
  ], nonStandardPropertyKeywords = keySet(nonStandardPropertyKeywords_);

  var fontProperties_ = [
    "font-family", "src", "unicode-range", "font-variant", "font-feature-settings",
    "font-stretch", "font-weight", "font-style"
  ], fontProperties = keySet(fontProperties_);

  var counterDescriptors_ = [
    "additive-symbols", "fallback", "negative", "pad", "prefix", "range",
    "speak-as", "suffix", "symbols", "system"
  ], counterDescriptors = keySet(counterDescriptors_);

  var colorKeywords_ = [
    "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige",
    "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown",
    "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue",
    "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod",
    "darkgray", "darkgreen", "darkkhaki", "darkmagenta", "darkolivegreen",
    "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen",
    "darkslateblue", "darkslategray", "darkturquoise", "darkviolet",
    "deeppink", "deepskyblue", "dimgray", "dodgerblue", "firebrick",
    "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite",
    "gold", "goldenrod", "gray", "grey", "green", "greenyellow", "honeydew",
    "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender",
    "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral",
    "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightpink",
    "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray",
    "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta",
    "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple",
    "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise",
    "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin",
    "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered",
    "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred",
    "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue",
    "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown",
    "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue",
    "slateblue", "slategray", "snow", "springgreen", "steelblue", "tan",
    "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white",
    "whitesmoke", "yellow", "yellowgreen"
  ], colorKeywords = keySet(colorKeywords_);

  var valueKeywords_ = [
    "above", "absolute", "activeborder", "additive", "activecaption", "afar",
    "after-white-space", "ahead", "alias", "all", "all-scroll", "alphabetic", "alternate",
    "always", "amharic", "amharic-abegede", "antialiased", "appworkspace",
    "arabic-indic", "armenian", "asterisks", "attr", "auto", "avoid", "avoid-column", "avoid-page",
    "avoid-region", "background", "backwards", "baseline", "below", "bidi-override", "binary",
    "bengali", "blink", "block", "block-axis", "bold", "bolder", "border", "border-box",
    "both", "bottom", "break", "break-all", "break-word", "bullets", "button", "button-bevel",
    "buttonface", "buttonhighlight", "buttonshadow", "buttontext", "calc", "cambodian",
    "capitalize", "caps-lock-indicator", "caption", "captiontext", "caret",
    "cell", "center", "checkbox", "circle", "cjk-decimal", "cjk-earthly-branch",
    "cjk-heavenly-stem", "cjk-ideographic", "clear", "clip", "close-quote",
    "col-resize", "collapse", "column", "column-reverse", "compact", "condensed", "contain", "content",
    "content-box", "context-menu", "continuous", "copy", "counter", "counters", "cover", "crop",
    "cross", "crosshair", "currentcolor", "cursive", "cyclic", "dashed", "decimal",
    "decimal-leading-zero", "default", "default-button", "destination-atop",
    "destination-in", "destination-out", "destination-over", "devanagari",
    "disc", "discard", "disclosure-closed", "disclosure-open", "document",
    "dot-dash", "dot-dot-dash",
    "dotted", "double", "down", "e-resize", "ease", "ease-in", "ease-in-out", "ease-out",
    "element", "ellipse", "ellipsis", "embed", "end", "ethiopic", "ethiopic-abegede",
    "ethiopic-abegede-am-et", "ethiopic-abegede-gez", "ethiopic-abegede-ti-er",
    "ethiopic-abegede-ti-et", "ethiopic-halehame-aa-er",
    "ethiopic-halehame-aa-et", "ethiopic-halehame-am-et",
    "ethiopic-halehame-gez", "ethiopic-halehame-om-et",
    "ethiopic-halehame-sid-et", "ethiopic-halehame-so-et",
    "ethiopic-halehame-ti-er", "ethiopic-halehame-ti-et", "ethiopic-halehame-tig",
    "ethiopic-numeric", "ew-resize", "expanded", "extends", "extra-condensed",
    "extra-expanded", "fantasy", "fast", "fill", "fixed", "flat", "flex", "flex-end", "flex-start", "footnotes",
    "forwards", "from", "geometricPrecision", "georgian", "graytext", "groove",
    "gujarati", "gurmukhi", "hand", "hangul", "hangul-consonant", "hebrew",
    "help", "hidden", "hide", "higher", "highlight", "highlighttext",
    "hiragana", "hiragana-iroha", "horizontal", "hsl", "hsla", "icon", "ignore",
    "inactiveborder", "inactivecaption", "inactivecaptiontext", "infinite",
    "infobackground", "infotext", "inherit", "initial", "inline", "inline-axis",
    "inline-block", "inline-flex", "inline-table", "inset", "inside", "intrinsic", "invert",
    "italic", "japanese-formal", "japanese-informal", "justify", "kannada",
    "katakana", "katakana-iroha", "keep-all", "khmer",
    "korean-hangul-formal", "korean-hanja-formal", "korean-hanja-informal",
    "landscape", "lao", "large", "larger", "left", "level", "lighter",
    "line-through", "linear", "linear-gradient", "lines", "list-item", "listbox", "listitem",
    "local", "logical", "loud", "lower", "lower-alpha", "lower-armenian",
    "lower-greek", "lower-hexadecimal", "lower-latin", "lower-norwegian",
    "lower-roman", "lowercase", "ltr", "malayalam", "match", "matrix", "matrix3d",
    "media-controls-background", "media-current-time-display",
    "media-fullscreen-button", "media-mute-button", "media-play-button",
    "media-return-to-realtime-button", "media-rewind-button",
    "media-seek-back-button", "media-seek-forward-button", "media-slider",
    "media-sliderthumb", "media-time-remaining-display", "media-volume-slider",
    "media-volume-slider-container", "media-volume-sliderthumb", "medium",
    "menu", "menulist", "menulist-button", "menulist-text",
    "menulist-textfield", "menutext", "message-box", "middle", "min-intrinsic",
    "mix", "mongolian", "monospace", "move", "multiple", "myanmar", "n-resize",
    "narrower", "ne-resize", "nesw-resize", "no-close-quote", "no-drop",
    "no-open-quote", "no-repeat", "none", "normal", "not-allowed", "nowrap",
    "ns-resize", "numbers", "numeric", "nw-resize", "nwse-resize", "oblique", "octal", "open-quote",
    "optimizeLegibility", "optimizeSpeed", "oriya", "oromo", "outset",
    "outside", "outside-shape", "overlay", "overline", "padding", "padding-box",
    "painted", "page", "paused", "persian", "perspective", "plus-darker", "plus-lighter",
    "pointer", "polygon", "portrait", "pre", "pre-line", "pre-wrap", "preserve-3d",
    "progress", "push-button", "radial-gradient", "radio", "read-only",
    "read-write", "read-write-plaintext-only", "rectangle", "region",
    "relative", "repeat", "repeating-linear-gradient",
    "repeating-radial-gradient", "repeat-x", "repeat-y", "reset", "reverse",
    "rgb", "rgba", "ridge", "right", "rotate", "rotate3d", "rotateX", "rotateY",
    "rotateZ", "round", "row", "row-resize", "row-reverse", "rtl", "run-in", "running",
    "s-resize", "sans-serif", "scale", "scale3d", "scaleX", "scaleY", "scaleZ",
    "scroll", "scrollbar", "se-resize", "searchfield",
    "searchfield-cancel-button", "searchfield-decoration",
    "searchfield-results-button", "searchfield-results-decoration",
    "semi-condensed", "semi-expanded", "separate", "serif", "show", "sidama",
    "simp-chinese-formal", "simp-chinese-informal", "single",
    "skew", "skewX", "skewY", "skip-white-space", "slide", "slider-horizontal",
    "slider-vertical", "sliderthumb-horizontal", "sliderthumb-vertical", "slow",
    "small", "small-caps", "small-caption", "smaller", "solid", "somali",
    "source-atop", "source-in", "source-out", "source-over", "space", "space-around", "space-between", "spell-out", "square",
    "square-button", "start", "static", "status-bar", "stretch", "stroke", "sub",
    "subpixel-antialiased", "super", "sw-resize", "symbolic", "symbols", "table",
    "table-caption", "table-cell", "table-column", "table-column-group",
    "table-footer-group", "table-header-group", "table-row", "table-row-group",
    "tamil",
    "telugu", "text", "text-bottom", "text-top", "textarea", "textfield", "thai",
    "thick", "thin", "threeddarkshadow", "threedface", "threedhighlight",
    "threedlightshadow", "threedshadow", "tibetan", "tigre", "tigrinya-er",
    "tigrinya-er-abegede", "tigrinya-et", "tigrinya-et-abegede", "to", "top",
    "trad-chinese-formal", "trad-chinese-informal",
    "translate", "translate3d", "translateX", "translateY", "translateZ",
    "transparent", "ultra-condensed", "ultra-expanded", "underline", "up",
    "upper-alpha", "upper-armenian", "upper-greek", "upper-hexadecimal",
    "upper-latin", "upper-norwegian", "upper-roman", "uppercase", "urdu", "url",
    "var", "vertical", "vertical-text", "visible", "visibleFill", "visiblePainted",
    "visibleStroke", "visual", "w-resize", "wait", "wave", "wider",
    "window", "windowframe", "windowtext", "words", "wrap", "wrap-reverse", "x-large", "x-small", "xor",
    "xx-large", "xx-small"
  ], valueKeywords = keySet(valueKeywords_);

  var allWords = documentTypes_.concat(mediaTypes_).concat(mediaFeatures_).concat(mediaValueKeywords_)
    .concat(propertyKeywords_).concat(nonStandardPropertyKeywords_).concat(colorKeywords_)
    .concat(valueKeywords_);
  CodeMirror.registerHelper("hintWords", "css", allWords);

  function tokenCComment(stream, state) {
    var maybeEnd = false, ch;
    while ((ch = stream.next()) != null) {
      if (maybeEnd && ch == "/") {
        state.tokenize = null;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return ["comment", "comment"];
  }

  CodeMirror.defineMIME("text/css", {
    documentTypes: documentTypes,
    mediaTypes: mediaTypes,
    mediaFeatures: mediaFeatures,
    mediaValueKeywords: mediaValueKeywords,
    propertyKeywords: propertyKeywords,
    nonStandardPropertyKeywords: nonStandardPropertyKeywords,
    fontProperties: fontProperties,
    counterDescriptors: counterDescriptors,
    colorKeywords: colorKeywords,
    valueKeywords: valueKeywords,
    tokenHooks: {
      "/": function(stream, state) {
        if (!stream.eat("*")) return false;
        state.tokenize = tokenCComment;
        return tokenCComment(stream, state);
      }
    },
    name: "css"
  });

  CodeMirror.defineMIME("text/x-scss", {
    mediaTypes: mediaTypes,
    mediaFeatures: mediaFeatures,
    mediaValueKeywords: mediaValueKeywords,
    propertyKeywords: propertyKeywords,
    nonStandardPropertyKeywords: nonStandardPropertyKeywords,
    colorKeywords: colorKeywords,
    valueKeywords: valueKeywords,
    fontProperties: fontProperties,
    allowNested: true,
    tokenHooks: {
      "/": function(stream, state) {
        if (stream.eat("/")) {
          stream.skipToEnd();
          return ["comment", "comment"];
        } else if (stream.eat("*")) {
          state.tokenize = tokenCComment;
          return tokenCComment(stream, state);
        } else {
          return ["operator", "operator"];
        }
      },
      ":": function(stream) {
        if (stream.match(/\s*\{/))
          return [null, "{"];
        return false;
      },
      "$": function(stream) {
        stream.match(/^[\w-]+/);
        if (stream.match(/^\s*:/, false))
          return ["variable-2", "variable-definition"];
        return ["variable-2", "variable"];
      },
      "#": function(stream) {
        if (!stream.eat("{")) return false;
        return [null, "interpolation"];
      }
    },
    name: "css",
    helperType: "scss"
  });

  CodeMirror.defineMIME("text/x-less", {
    mediaTypes: mediaTypes,
    mediaFeatures: mediaFeatures,
    mediaValueKeywords: mediaValueKeywords,
    propertyKeywords: propertyKeywords,
    nonStandardPropertyKeywords: nonStandardPropertyKeywords,
    colorKeywords: colorKeywords,
    valueKeywords: valueKeywords,
    fontProperties: fontProperties,
    allowNested: true,
    tokenHooks: {
      "/": function(stream, state) {
        if (stream.eat("/")) {
          stream.skipToEnd();
          return ["comment", "comment"];
        } else if (stream.eat("*")) {
          state.tokenize = tokenCComment;
          return tokenCComment(stream, state);
        } else {
          return ["operator", "operator"];
        }
      },
      "@": function(stream) {
        if (stream.eat("{")) return [null, "interpolation"];
        if (stream.match(/^(charset|document|font-face|import|(-(moz|ms|o|webkit)-)?keyframes|media|namespace|page|supports)\b/, false)) return false;
        stream.eatWhile(/[\w\\\-]/);
        if (stream.match(/^\s*:/, false))
          return ["variable-2", "variable-definition"];
        return ["variable-2", "variable"];
      },
      "&": function() {
        return ["atom", "atom"];
      }
    },
    name: "css",
    helperType: "less"
  });

  CodeMirror.defineMIME("text/x-gss", {
    documentTypes: documentTypes,
    mediaTypes: mediaTypes,
    mediaFeatures: mediaFeatures,
    propertyKeywords: propertyKeywords,
    nonStandardPropertyKeywords: nonStandardPropertyKeywords,
    fontProperties: fontProperties,
    counterDescriptors: counterDescriptors,
    colorKeywords: colorKeywords,
    valueKeywords: valueKeywords,
    supportsAtComponent: true,
    tokenHooks: {
      "/": function(stream, state) {
        if (!stream.eat("*")) return false;
        state.tokenize = tokenCComment;
        return tokenCComment(stream, state);
      }
    },
    name: "css",
    helperType: "gss"
  });

});

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("../xml/xml"), require("../javascript/javascript"), require("../css/css"));
  else if (typeof define == "function" && define.amd) // AMD
    define('codemirror/mode/htmlmixed/htmlmixed',["../../lib/codemirror", "../xml/xml", "../javascript/javascript", "../css/css"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  var defaultTags = {
    script: [
      ["lang", /(javascript|babel)/i, "javascript"],
      ["type", /^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^$/i, "javascript"],
      ["type", /./, "text/plain"],
      [null, null, "javascript"]
    ],
    style:  [
      ["lang", /^css$/i, "css"],
      ["type", /^(text\/)?(x-)?(stylesheet|css)$/i, "css"],
      ["type", /./, "text/plain"],
      [null, null, "css"]
    ]
  };

  function maybeBackup(stream, pat, style) {
    var cur = stream.current(), close = cur.search(pat);
    if (close > -1) {
      stream.backUp(cur.length - close);
    } else if (cur.match(/<\/?$/)) {
      stream.backUp(cur.length);
      if (!stream.match(pat, false)) stream.match(cur);
    }
    return style;
  }

  var attrRegexpCache = {};
  function getAttrRegexp(attr) {
    var regexp = attrRegexpCache[attr];
    if (regexp) return regexp;
    return attrRegexpCache[attr] = new RegExp("\\s+" + attr + "\\s*=\\s*('|\")?([^'\"]+)('|\")?\\s*");
  }

  function getAttrValue(stream, attr) {
    var pos = stream.pos, match;
    while (pos >= 0 && stream.string.charAt(pos) !== "<") pos--;
    if (pos < 0) return pos;
    if (match = stream.string.slice(pos, stream.pos).match(getAttrRegexp(attr)))
      return match[2];
    return "";
  }

  function getTagRegexp(tagName, anchored) {
    return new RegExp((anchored ? "^" : "") + "<\/\s*" + tagName + "\s*>", "i");
  }

  function addTags(from, to) {
    for (var tag in from) {
      var dest = to[tag] || (to[tag] = []);
      var source = from[tag];
      for (var i = source.length - 1; i >= 0; i--)
        dest.unshift(source[i])
    }
  }

  function findMatchingMode(tagInfo, stream) {
    for (var i = 0; i < tagInfo.length; i++) {
      var spec = tagInfo[i];
      if (!spec[0] || spec[1].test(getAttrValue(stream, spec[0]))) return spec[2];
    }
  }

  CodeMirror.defineMode("htmlmixed", function (config, parserConfig) {
    var htmlMode = CodeMirror.getMode(config, {
      name: "xml",
      htmlMode: true,
      multilineTagIndentFactor: parserConfig.multilineTagIndentFactor,
      multilineTagIndentPastTag: parserConfig.multilineTagIndentPastTag
    });

    var tags = {};
    var configTags = parserConfig && parserConfig.tags, configScript = parserConfig && parserConfig.scriptTypes;
    addTags(defaultTags, tags);
    if (configTags) addTags(configTags, tags);
    if (configScript) for (var i = configScript.length - 1; i >= 0; i--)
      tags.script.unshift(["type", configScript[i].matches, configScript[i].mode])

    function html(stream, state) {
      var tagName = state.htmlState.tagName && state.htmlState.tagName.toLowerCase();
      var tagInfo = tagName && tags.hasOwnProperty(tagName) && tags[tagName];

      var style = htmlMode.token(stream, state.htmlState), modeSpec;

      if (tagInfo && /\btag\b/.test(style) && stream.current() === ">" &&
          (modeSpec = findMatchingMode(tagInfo, stream))) {
        var mode = CodeMirror.getMode(config, modeSpec);
        var endTagA = getTagRegexp(tagName, true), endTag = getTagRegexp(tagName, false);
        state.token = function (stream, state) {
          if (stream.match(endTagA, false)) {
            state.token = html;
            state.localState = state.localMode = null;
            return null;
          }
          return maybeBackup(stream, endTag, state.localMode.token(stream, state.localState));
        };
        state.localMode = mode;
        state.localState = CodeMirror.startState(mode, htmlMode.indent(state.htmlState, ""));
      }
      return style;
    };

    return {
      startState: function () {
        var state = htmlMode.startState();
        return {token: html, localMode: null, localState: null, htmlState: state};
      },

      copyState: function (state) {
        var local;
        if (state.localState) {
          local = CodeMirror.copyState(state.localMode, state.localState);
        }
        return {token: state.token, localMode: state.localMode, localState: local,
                htmlState: CodeMirror.copyState(htmlMode, state.htmlState)};
      },

      token: function (stream, state) {
        return state.token(stream, state);
      },

      indent: function (state, textAfter) {
        if (!state.localMode || /^\s*<\//.test(textAfter))
          return htmlMode.indent(state.htmlState, textAfter);
        else if (state.localMode.indent)
          return state.localMode.indent(state.localState, textAfter);
        else
          return CodeMirror.Pass;
      },

      innerMode: function (state) {
        return {state: state.localState || state.htmlState, mode: state.localMode || htmlMode};
      }
    };
  }, "xml", "javascript", "css");

  CodeMirror.defineMIME("text/html", "htmlmixed");
});

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("codemirror/lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define('formatting',["codemirror/lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {

  CodeMirror.extendMode("css", {
    commentStart: "/*",
    commentEnd: "*/",
    newlineAfterToken: function(_type, content) {
      return /^[;{}]$/.test(content);
    }
  });

  CodeMirror.extendMode("javascript", {
    commentStart: "/*",
    commentEnd: "*/",
    // FIXME semicolons inside of for
    newlineAfterToken: function(_type, content, textAfter, state) {
      if (this.jsonMode) {
        return /^[\[,{]$/.test(content) || /^}/.test(textAfter);
      } else {
        if (content == ";" && state.lexical && state.lexical.type == ")") return false;
        return /^[;{}]$/.test(content) && !/^;/.test(textAfter);
      }
    }
  });

  var inlineElements = /^(a|abbr|acronym|area|base|bdo|big|br|button|caption|cite|code|col|colgroup|dd|del|dfn|em|frame|hr|iframe|img|input|ins|kbd|label|legend|link|map|object|optgroup|option|param|q|samp|script|select|small|span|strong|sub|sup|textarea|tt|var)$/;

  CodeMirror.extendMode("xml", {
    commentStart: "<!--",
    commentEnd: "-->",
    newlineAfterToken: function(type, content, textAfter, state) {
      var inline = false;
      if (this.configuration == "html")
        inline = state.context ? inlineElements.test(state.context.tagName) : false;
      return !inline && ((type == "tag" && />$/.test(content) && state.context) ||
                         /^</.test(textAfter));
    }
  });

  // Comment/uncomment the specified range
  CodeMirror.defineExtension("commentRange", function (isComment, from, to) {
    var cm = this, curMode = CodeMirror.innerMode(cm.getMode(), cm.getTokenAt(from).state).mode;
    cm.operation(function() {
      if (isComment) { // Comment range
        cm.replaceRange(curMode.commentEnd, to);
        cm.replaceRange(curMode.commentStart, from);
        if (from.line == to.line && from.ch == to.ch) // An empty comment inserted - put cursor inside
          cm.setCursor(from.line, from.ch + curMode.commentStart.length);
      } else { // Uncomment range
        var selText = cm.getRange(from, to);
        var startIndex = selText.indexOf(curMode.commentStart);
        var endIndex = selText.lastIndexOf(curMode.commentEnd);
        if (startIndex > -1 && endIndex > -1 && endIndex > startIndex) {
          // Take string till comment start
          selText = selText.substr(0, startIndex) +
          // From comment start till comment end
             selText.substring(startIndex + curMode.commentStart.length, endIndex) +
          // From comment end till string end
             selText.substr(endIndex + curMode.commentEnd.length);
        }
        cm.replaceRange(selText, from, to);
      }
    });
  });

  // Applies automatic mode-aware indentation to the specified range
  CodeMirror.defineExtension("autoIndentRange", function (from, to) {
    var cmInstance = this;
    this.operation(function () {
      for (var i = from.line; i <= to.line; i++) {
        cmInstance.indentLine(i, "smart");
      }
    });
  });

  // Applies automatic formatting to the specified range
  CodeMirror.defineExtension("autoFormatRange", function (from, to) {
    var cm = this;
    var outer = cm.getMode(), text = cm.getRange(from, to).split("\n");
    var state = CodeMirror.copyState(outer, cm.getTokenAt(from).state);
    var tabSize = cm.getOption("tabSize");

    var out = "", lines = 0, atSol = from.ch === 0;
    function newline() {
      out += "\n";
      atSol = true;
      ++lines;
    }

    for (var i = 0; i < text.length; ++i) {
      var stream = new CodeMirror.StringStream(text[i], tabSize);
      while (!stream.eol()) {
        var inner = CodeMirror.innerMode(outer, state);
        var style = outer.token(stream, state), cur = stream.current();
        stream.start = stream.pos;
        if (!atSol || /\S/.test(cur)) {
          out += cur;
          atSol = false;
        }
        if (!atSol && inner.mode.newlineAfterToken &&
            inner.mode.newlineAfterToken(style, cur, stream.string.slice(stream.pos) || text[i+1] || "", inner.state))
          newline();
      }
      if (!stream.pos && outer.blankLine) outer.blankLine(state);
      if (!atSol && i < text.length - 1) newline();
    }

    cm.operation(function () {
      cm.replaceRange(out, from, to);
      for (var cur = from.line + 1, end = from.line + lines; cur <= end; ++cur)
        cm.indentLine(cur, "smart");
      cm.setSelection(from, cm.getCursor(false));
    });
  });
});

define('CodeManager/model/CodeMirrorEditor',['backbone',
        'codemirror/lib/codemirror',
        'codemirror/mode/htmlmixed/htmlmixed',
        'codemirror/mode/css/css',
        'formatting'
        ],
	function(Backbone, CodeMirror, htmlMode, cssMode, formatting) {
		/**
		 * @class CodeViewer
		 * */
		return Backbone.Model.extend({

			defaults: {
				input		: '',
				label		: '',
				codeName 	: '',
				theme		: '',
				readOnly 	: true,
				lineNumbers	: true,
			},

			/** @inheritdoc */
			getId	: function()
			{
				return 'CodeMirror';
			},

			/** @inheritdoc */
			init: function(el)
			{
				this.editor	= CodeMirror.fromTextArea(el, {
					dragDrop		: false,
					lineNumbers		: this.get('lineNumbers'),
					readOnly		: this.get('readOnly'),
				    mode			: this.get('codeName'),
				    theme			: this.get('theme'),
				});

				return this;
			},

			/** @inheritdoc */
			setContent	: function(v)
			{
				if(!this.editor)
					return;
				this.editor.setValue(v);
				if(this.editor.autoFormatRange){
					CodeMirror.commands.selectAll(this.editor);
					this.editor.autoFormatRange(this.editor.getCursor(true), this.editor.getCursor(false) );
					CodeMirror.commands.goDocStart(this.editor);
				}
			},

        });
	});

define('text!CodeManager/template/editor.html',[],function () { return '<div class="<%= pfx %>editor" id="<%= pfx %><%= codeName %>">\n\t<div id="<%= pfx %>title"><%= label %></div>\n\t<div id="<%= pfx %>code"></div> \n</div>\n';});

define('CodeManager/view/EditorView',['backbone', 'text!./../template/editor.html'], 
	function (Backbone, vTemplate) {
		/** 
		 * @class EditorView
		 * */
		return Backbone.View.extend({
			
			template: _.template(vTemplate),
			
			initialize: function(o){
				this.config		= o.config || {};
				this.pfx		= this.config.stylePrefix;
			},
			
			render : function(){
				var	obj		= this.model.toJSON();
				obj.pfx		= this.pfx;
				this.$el.html( this.template(obj) );
				this.$el.attr('class', this.pfx + 'editor-c');
				this.$el.find('#'+this.pfx+'code').html(this.model.get('input'));
				return this;
			},
			
		});
});

define('CodeManager/main',['require','./config/config','./model/GeneratorInterface','./model/HtmlGenerator','./model/CssGenerator','./model/JsonGenerator','./model/EditorInterface','./model/CodeMirrorEditor','./view/EditorView'],function(require) {
	/**
	 * @class 	CodeManager
	 * @param 	{Object} Configurations
	 * 
	 * @return	{Object}
 	 * */
	function CodeManager(config)
	{
		var c			= config || {},
			defaults	= require('./config/config'),
			gInterface	= require('./model/GeneratorInterface'),
			gHtml		= require('./model/HtmlGenerator'),
			gCss		= require('./model/CssGenerator'),
			gJson		= require('./model/JsonGenerator'),
			eInterface	= require('./model/EditorInterface'),
			eCM			= require('./model/CodeMirrorEditor'),
			editorView	= require('./view/EditorView');

		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}
		
		this.gi					= new gInterface();
		this.generators			= {};
		this.defaultGenerators	= {};
		this.currentGenerator 	= null;
		
		this.ei					= new eInterface();
		this.editors			= {};
		this.defaultEditors		= {};
		this.currentEditor 		= null;
		
		var	geHtml				= new gHtml(),
			geCss				= new gCss(),
			geJson				= new gJson(),
			edCM				= new eCM();
		
		this.defaultGenerators[geHtml.getId()]	= geHtml;
		this.defaultGenerators[geCss.getId()]	= geCss;
		this.defaultGenerators[geJson.getId()]	= geJson;
		
		this.defaultEditors[edCM.getId()]		= edCM;
		
		this.EditorView			= editorView;
		this.config				= c;
	}
	
	CodeManager.prototype	= {
			
			/**
			 * Add new code generator
			 * @param	{GeneratorInterface} generator
			 * 
			 * @return 	this
			 * */
			addGenerator	: function(generator)
			{
				// Check interface implementation
				for (var method in this.gi)
					if(!generator[method]){
						console.warn("addGenerator: method '"+ method +"' was not found");
						return;
					}
				
				var id				= generator.getId();
				this.generators[id] = generator;
				
				if(!this.currentGenerator)
					this.currentGenerator	=	id;
				
				return this;
			},
			
			/**
			 * Returns generator
			 * @param	{String}|{Integer}	id	Generator ID
			 * 
			 * @return 	{GeneratorInterface}|null
			 * */
			getGenerator	: function(id)
			{
				if(id && this.generators[id])
					generator	= this.generators[id];
				
				return generator ? generator : null;
			},
			
			/**
			 * Returns generators
			 * 
			 * @return 	{Array}
			 * */
			getGenerators	: function()
			{
				return this.generators;
			},
			
			/**
			 * Get current generator
			 * 
			 * @return 	{GeneratorInterface}
			 * */
			getCurrentGenerator		: function()
			{
				if(!this.currentGenerator)
					this.loadDefaultGenerators();
				return this.getGenerator(this.currentGenerator);
			},
			
			/**
			 * Set current generator
			 * @param	{Integer}	id	Generator ID
			 * 
			 * @return 	this
			 * */
			setCurrentGenerator		: function(id)
			{
				this.currentGenerator	= id;
				return this;
			},
			
			/**
			 * Load default generators
			 * 
			 * @return 	this
			 * */
			loadDefaultGenerators	: function()
			{
				for (var id in this.defaultGenerators) {
					this.addGenerator(this.defaultGenerators[id]);
				}
				
				return this;
			},
			
			/**
			 * Add new editor
			 * @param	{EditorInterface}	editor
			 * 
			 * @return 	this
			 * */
			addEditor	: function(editor)
			{
				// Check interface implementation
				for (var method in this.ei)
					if(!editor[method]){
						console.warn("addEditor: method '"+ method +"' was not found");
						return;
					}
				
				var id				= editor.getId();
				this.editors[id] 	= editor;
				
				if(!this.currentEditor)
					this.currentEditor	=	id;
				
				return this;
			},
			
			/**
			 * Returns editor
			 * @param	{String}|{Integer}	id	Editor ID
			 * 
			 * @return 	{EditorInterface}|null
			 * */
			getEditor	: function(id)
			{
				if(id && this.editors[id])
					editor	= this.editors[id];
				
				return editor ? editor : null;
			},
			
			/**
			 * Returns editors
			 * 
			 * @return 	{Array}
			 * */
			getEditors	: function()
			{
				return this.editors;
			},
			
			/**
			 * Get current editor
			 * 
			 * @return 	{EditorInterface}
			 * */
			getCurrentEditor		: function()
			{
				if(!this.currentEditor)
					this.loadDefaultEditors();
				return this.getEditor(this.currentEditor);
			},
			
			/**
			 * Set current editor
			 * @param	{Integer}	id	Editor ID
			 * 
			 * @return 	this
			 * */
			setCurrentEditor		: function(id)
			{
				this.currentEditor	= id;
				return this;
			},
			
			/**
			 * Load default editors
			 * 
			 * @return 	this
			 * */
			loadDefaultEditors	: function()
			{
				for (var id in this.defaultEditors) {
					this.addEditor(this.defaultEditors[id]);
				}
				
				return this;
			},
			
			/**
			 * Get code by name
			 * @param	{Backbone.Model}	model	Model
			 * @param	{String}|{Integer}	v		Id of code generator
			 * 
			 * @return	{String}|null
			 * */
			getCode	: function(model, v)
			{
				var id			= v || this.currentGenerator,
					generator	= this.generators[id];
				return generator ? generator.build(model) : null;
			},
			
			/**
			 * Update editor content
			 * @param	{EditorInteface}	editor	Editor
			 * @param	{String}			code	Code value
			 * 
			 * @return	void
			 * */
			updateEditor	: function(editor, code)
			{
				editor.setContent(code);
			},
			
			
	};
	
	return CodeManager;
});
define('CodeManager', ['CodeManager/main'], function (main) { return main; });

define('Commands/config/config',[],function () {
	return {
		
		ESCAPE_KEY		: 27,
		
		stylePrefix		: 'com-',
		
		defaults		: [],
		
		// Editor model
		em				: null,
		
		// If true center new first-level components
		firstCentered	: true,
		
		// If true the new component will created with 'height', else 'min-height'
		newFixedH		: false,						
		
		// Minimum height (in px) of new component
		minComponentH	: 50,
		
		// Minimum width (in px) of component on creation 
		minComponentW	: 50,					
	};
});
define('Commands/view/CommandAbstract',['backbone'],
	function(Backbone) {
		/** 
		 * @class CommandAbstract
		 * */
		return Backbone.View.extend({
			
			/**
			 * Initialize method that can't be removed
			 * @param	{Object}	o Options
			 * */
			initialize: function(o) {
				this.editorModel 	= this.em = o.em || {};
				this.canvasId		= o.canvasId 	|| '';
				this.wrapperId		= o.wrapperId 	|| 'wrapper';
				this.pfx			= o.stylePrefix;
				this.hoverClass		= this.pfx + 'hover';
				this.badgeClass		= this.pfx + 'badge';
				this.plhClass		= this.pfx + 'placeholder';
				this.setElement(this.editorModel.get('$editor').find('#'+this.canvasId));
				this.$canvas		= this.$el;
				this.$wrapper		= this.$canvas.find('#'+this.wrapperId);
				this.init(o);
			},
			
			/**
			 * Callback triggered after initialize
			 * @param	{Object}	o 	Options
			 * */
			init: function(o){},
			
			/**
			 * Method that run command
			 * @param	{Object}	em 		Editor model
			 * @param	{Object}	sender	Button sender
			 * */
			run: function(em, sender) {
				console.warn("No run method found");
			},
			
			/**
			 * Method that stop command
			 * @param	{Object}	em Editor model
			 * @param	{Object}	sender	Button sender
			 * */
			stop: function(em, sender) {
				console.warn("No stop method found");
			}
			
		});
	});
define('Commands/view/SelectComponent',[],function() {
		/** 
		 * @class SelectComponent
		 * */
		return {
			
			enable: function(){
				this.startSelectComponent();
			},
			
			/** Start select component event
			 * @return void
			 * */
			startSelectComponent: function(){
				var that = this;
				this.$el.find('*').on('mouseover',function(e){ that.highlightComponent(e,this); })
						.on('mouseout'	 ,function(e){ that.removeHighlightComponent(e,this); })
						.on('click'		 ,function(e){ that.selectComponent(e,this); });
				this.selEl = this.$el.find('*');
			},
			
			/** Stop select component event
			 * @param Event
			 * @return void
			 * */
			stopSelectComponent: function(e){
				if(this.selEl)
					this.selEl.trigger('mouseout').off('mouseover mouseout click');
				this.selEl = null;
			},
			
			/** Highlight component when pointer is over it
			 * @param Event
			 * @param Object Component
			 * @return void
			 * */
			highlightComponent: function(e, el){
				e.stopPropagation();
			    $(el).addClass(this.hoverClass);
			    this.attachBadge(el);
			},
			/** Remove highlight from component
			 * @param Event
			 * @param Object Component
			 * @return void
			 * */
			removeHighlightComponent: function(e, el){
				e.stopPropagation();
			    $(el).removeClass(this.hoverClass);
			    if(this.badge)										//Hide badge if possible
			    	this.badge.css({ left: -10000, top:-10000 });	//TODO HIDE
			},
			/** Select highlighted component
			 * @param Event
			 * @param Object Component
			 * @return void
			 * */
			selectComponent: function(e, el){
				var s	= $(el).data('model').get('stylable');
				if(!(s instanceof Array) && !s)
					return;
				this.onSelect(e,el);								//Callback on select
			},
			
			/** Say what to do after the component was selected
			 * @param Event
			 * @param Object Selected element
			 * */
			onSelect: function(e, el){
				e.stopPropagation();
				if(this.$selected)																	//Check if already selected before
					this.$selected.removeClass('selected-component');
				this.$selected = $(el).addClass('selected-component');
				if(this.$selected.data('model')){
					// Generates too much recursions with JsonGenerator
					//this.$selected.data('model').set('previousModel',this.editorModel.get('selectedComponent'));
					this.editorModel.set('selectedComponent',this.$selected.data('model')); 			//Update selected component
					this.$selected.data('model').set('status','selected');
				}
			},
			
			/** Removes all highlighting effects on components
			 * @return void
			 * */
			clean: function(){
				this.$el.find('*').removeClass(this.hoverClass);
			},
			
			/** Attach badge to component
			 * @param Object Component
			 * @return void
			 * */
			attachBadge: function(el){
				var model = $(el).data("model");
				if(!model || !model.get('badgable'))
					return;
				if(!this.badge)
					this.createBadge();
				var badgeH = this.badge.outerHeight();
				this.updateBadgeLabel(model);
				var $el = $(el);
				if(!this.wrapper)
					this.wrapper = this.$wrapper;
				if(!this.wrapperTop)
					this.wrapperTop = this.wrapper.offset() ? this.wrapper.offset().top : 0;
				if(!this.wrapperLeft)
					this.wrapperLeft= this.wrapper.offset() ? this.wrapper.offset().left : 0;
				var relativeT = ($el.offset().top - this.wrapperTop) + this.wrapper.scrollTop();
				var relativeL = ($el.offset().left- this.wrapperLeft) + this.wrapper.scrollLeft();
				if( (relativeT-badgeH) > this.wrapperTop)											//If it's possible set badge to top
					relativeT -= badgeH;
				this.badge.css({ left: relativeL, top:relativeT });
			},
			
			/** Create badge for the component
			 * @return void
			 * */
			createBadge: function (){
				this.badge = $('<div>', {class: this.badgeClass + " no-dots"}).appendTo(this.$wrapper);
			},
			
			/** Remove badge
			 * @return void
			 * */
			removeBadge: function (){
				if(this.badge){	
					this.badge.remove();
					delete this.badge;
				}
			},
			
			/** Updates badge label
			 * @param Object Model
			 * @return void
			 * */
			updateBadgeLabel: function (model){
				if(model)
					this.badge.html( model.getName() );
			},
			
			/** Run method 
			 * */
			run: function(){
				this.enable();
				this.render();
				this.active = true;
			},
			
			/** Stop method 
			 * */
			stop: function(){
				if(this.editorModel.get('selectedComponent'))
					this.editorModel.get('selectedComponent').set('status','');
				this.$el.unbind();												//removes all attached events
				if(this.$selected)												//check if already selected before
					this.$selected.removeClass('selected-component');
				this.removeBadge();														
				this.clean();
				this.$el.find('*').unbind('mouseover').unbind('mouseout').unbind('click');
				this.editorModel.set('selectedComponent',null);
				this.active = false;
			}
		};
});
define('Commands/view/SelectPosition',[],function() {
		/** 
		 * @class SelectPosition
		 * */
		return {
			
			init: function(opt) {
				_.bindAll(this,'selectingPosition','itemLeft');
				this.config	= opt;
			},
			
			/** 
			 * Returns position placeholder
			 * 
			 * @return	{Object}	Placeholder
			 * */
			getPositionPlaceholder: function()
			{
				return this.$plh;
			},
			
			/** 
			 * Creates position placeholder
			 * 
			 * @return	{Object}	Placeholder
			 * */
			createPositionPlaceholder: function()
			{
				this.$plh =  $('<div>', { class: this.plhClass + " no-dots" })
					.css({'pointer-events':'none'}).data('helper',1);
				this.$plh.append( $('<div>', { class: this.plhClass + "-int no-dots" } ) );
				this.$plh.appendTo( this.$wrapper );
				return this.$plh;
			},
			
			enable: function()
			{
				this.startSelectPosition();
			},
			
			/** 
			 * Start select position event
			 * 
			 * @return 	void
			 * */
			startSelectPosition: function()
			{
				this.isPointed = false;
				this.$wrapper.on('mousemove', this.selectingPosition);
			},
			
			/** 
			 * Stop select position event
			 * @return 	void
			 * */
			stopSelectPosition: function()
			{
				this.$wrapper.off('mousemove',this.selectingPosition);
				this.posTargetCollection = null;
				this.posIndex 	= this.posMethod=='after' && this.cDim.length!==0 ? this.posIndex + 1 : this.posIndex; //Normalize
				if(this.cDim){
					this.posIsLastEl	= this.cDim.length!==0 && this.posMethod=='after' && this.posIndex==this.cDim.length;
					this.posTargetEl 	= (this.cDim.length===0 ? $(this.outsideElem) : 
						 (!this.posIsLastEl && this.cDim[this.posIndex] ? $(this.cDim[this.posIndex][5]).parent() : $(this.outsideElem) ));
					this.posTargetModel 		= this.posTargetEl.data("model");
					this.posTargetCollection 	= this.posTargetEl.data("model-comp");
				}
			},
			
			/** 
			 * During event
			 * @param	{Object}	e Event 
			 * */
			selectingPosition: function(e)
			{
				this.isPointed = true;
				
				if(!this.wp){
					this.$wp 	= this.$wrapper;
					this.wp		= this.$wp[0];
				}
				var wpO		= this.$wp.offset();
				this.wpT 	= wpO.top;
				this.wpL	= wpO.left;
				this.wpScT	= this.$wp.scrollTop();
				this.wpScL	= this.$wp.scrollLeft();
				
				if(!this.$plh)
					this.createPositionPlaceholder();
				
				this.rY			= (e.pageY - this.wpT) + this.wpScT;
				this.rX 		= (e.pageX - this.wpL) + this.wpScL;
				
				this.entered(e);
				this.updatePosition(this.rX, this.rY);
				var actualPos 	= this.posIndex + ':' + this.posMethod;									//save globally the new index
				
				if(!this.lastPos || (this.lastPos != actualPos)){						//If there is a significant changes with mouse									
					this.updatePositionPlaceholder(this.posIndex, this.posMethod);
					this.lastPos = actualPos;
				}
			},
			
			/** 
			 * Search where to put placeholder
			 * @param	{Integer} 	posX	X position of the mouse
			 * @param	{Integer} 	posY	Y position of the mouse
			 * 
			 * @retun void
			 * */
			updatePosition: function( posX, posY ){
				this.posMethod = "before";
				this.posIndex = 0;				
				var leftLimit = 0, xLimit = 0, dimRight = 0, yLimit = 0, xCenter = 0, yCenter = 0, dimDown = 0, dim = 0;
				for(var i = 0; i < this.cDim.length; i++){
					dim = this.cDim[i];
					dimDown = dim[0] + dim[2];
					yCenter = dim[0] + (dim[2] / 2);												//Horizontal center
					xCenter = dim[1] + (dim[3] / 2);												//Vertical center
					dimRight = dim[1] + dim[3];
					if( (xLimit && dim[1] > xLimit) || (yLimit && yCenter > yLimit) ||
						(leftLimit && dimRight < leftLimit))										//No need with this one if over the limit
							continue;
					if(!dim[4]){																	//If it's not inFlow (like float element)
						if( posY < dimDown)	
							yLimit = dimDown;
						if( posX < xCenter){														//If mouse lefter than center
							xLimit = xCenter;
							this.posMethod = "before";
						}else{
							leftLimit = xCenter;
							this.posMethod = "after";
						}
						this.posIndex = i;
					}else{
						this.posIndex = i;
						if( posY < yCenter ){														//If mouse upper than center
							this.posMethod = "before";												//Should place helper before
							break;																	//No need to continue under inFlow element
						}else
							this.posMethod = "after";
					}
				}
				if(this.posIndex == (this.cDim.length) && this.posMethod == 'after' ){
					this.posIndex--;
				}
			},
			
			/** 
			 * Updates the position of the placeholder
			 * @param 	{Integer}	index	Index of the nearest child
			 * @param 	{String}	method 	Before or after position
			 * 
			 * @return 	void
			 * */
			updatePositionPlaceholder: function(index, method){
				var t = 0, l = 0, w = 0, h = 0,
					marg		= 2,
					un			= 'px',
					margI		= 5,
					plh			= this.$plh[0];
				if( this.cDim[index] ){
					var elDim	= this.cDim[index];
					if(!elDim[4]){
						w 	= 'auto';
						t	= elDim[0] + marg;	
						h	= elDim[2] - (marg * 2) + un;
						l	= (method == 'before') ? (elDim[1] - marg) : (elDim[1] + elDim[3] - marg);
					}else{
						w	= elDim[3] + un;
						t	= (method == 'before') ? (elDim[0] - marg) : (elDim[0] + elDim[2] - marg);
						l	= elDim[1];
						h	= 'auto';
					}
					//t	-= this.wpScT;
					//l	-= this.wpScL;
				}else{
					if(this.$targetEl){
						var trg	= this.$targetEl[0],
							$eO = this.$targetEl.offset();
						t		= $eO.top - this.wpT + this.wpScT + margI;
						l		= $eO.left - this.wpL + this.wpScL	+ margI;
						w 		= (parseInt(trg.offsetWidth) - margI * 2) + un;
						h		= 'auto';
					}
				}
				
				plh.style.top		= t + un;
				plh.style.left		= l	+ un;
				if(w)
					plh.style.width	= w;
				if(h)
					plh.style.height	= h;
			},
			
			/** 
			 * Track inside which element pointer entered
			 * @param	{Object}	e	Event 
			 * 
			 * @return 	void
			 * */
			entered: function(e){
				if( (!this.outsideElem || this.outsideElem != e.target) ){							//If I'm in the new element
					this.outsideElem 	= e.target;													//Set the element in which it's actually inside
					this.$targetEl		= $(e.target);
					$(this.outsideElem).on('mouseleave',this.itemLeft);
					this.cDim = this.getChildrenDim();
					this.dimT	=	this.getTargetDim(e);
					if( this.nearToBorders(e) && (e.target.parentNode!=this.wp.parentNode) )		//Avoid flickering
						this.cDim = this.getChildrenDim(e.target.parentNode);
				}else if( this.nearToBorders(e) && (e.target.parentNode!=this.wp.parentNode) ){ 	//Near to borders and parent is not the canvas
					this.cDim = this.getChildrenDim(e.target.parentNode);
				}else if( !(this.nearToBorders(e)) ){
					this.cDim = this.getChildrenDim();
				}
			},
			
			/** 
			 * Check if pointer is near to the borders of the target
			 * @param	{Object}	e	Event 
			 * 
			 * @return	{Integer}
			 * */
			nearToBorders: function(e){
				var m 		= 7;																		//Limit in pixels for be near
				if(!this.dimT) 
					return; 
				var dimT 	= this.dimT;
				if(dimT[2] < 40)
					m 		= 5; 
				if( ((dimT[0] + m) > this.rY) || (this.rY > (dimT[0] + dimT[2] - m)) || 
					((dimT[1] + m) > this.rX) || (this.rX > (dimT[1] + dimT[3] - m))  )					//Check if the pointer is near
					return 1;
				else
					return 0;
			},
			
			/** 
			 * Check if pointer is near to the float component
			 * 
			 * @return	{Integer}
			 * */
			nearToFloat: function()
			{
				var index 	= this.posIndex;
				var isLastEl	= this.posIsLastEl;
				if(this.cDim.length !== 0 && ( 
						(!isLastEl && !this.cDim[index][4]) || 
						(this.cDim[index-1] && !this.cDim[index-1][4]) ||
						(isLastEl && !this.cDim[index-1][4]) ) )
					return 1;
				else
					return 0;
			},
			
			/** 
			 * Returns dimension of the taget
			 * @param	{Object}	e Event
			 * 
			 * @return	{Array}
			 * */
			getTargetDim: function(e)
			{
				var elT = e.target,
					$el	= $(elT);
				return [ elT.offsetTop, elT.offsetLeft, $el.outerHeight(), $el.outerWidth() ];
			},
			
			/** 
			 * Returns children and their dimensions of the target element, 
			 * excluding text nodes and the move placeholder
			 * @param 	{Object}	el Element
			 * 
			 * @return 	{Array} 
			 * */
			getChildrenDim: function(el)
			{
				var dim 		= [];
				var elToPars 	= el || this.outsideElem;
				var isInFlow 	= this.isInFlow;													//Assign method for make it work inside $.each
				var $this 		= this;																//Store context
				$(elToPars.childNodes).each(function(){
					var $el		= $(this);
					if(this.nodeName != '#text' && !$el.data('helper') ){							//Ignore text nodes and helpers
						dim.push( [ this.offsetTop, this.offsetLeft, $el.outerHeight(), $el.outerWidth(), isInFlow($this, this), this  ] );
					}
				});
				return dim;
			},
			
			/** 
			 * Track when I go ouside of the element (basically when the target changes)
			 * @param	{Object}	e Event 
			 * 
			 * @return	void
			 * */
			itemLeft: function(e)
			{
				$(this.outsideElem).off('mouseleave',this.itemLeft);
				this.outsideElem = null;
				this.$targetEl	 = null;
				this.lastPos = null;
			},
			
			/** 
			 * Returns true if the elements is in flow, or better is not in flow where
			 *  for example the component is with float:left
			 *  @param	{Object}	$this	Context
			 *  @param 	{Object}	elm	 	Element
			 *  
			 *  @return {Boolean}
			 * */
			isInFlow:  function($this, elm)
			{
			    var $elm = $(elm), ch = -1; 
			    if(!$elm.length)
			    	return false;
			    if( ($elm.height() < ch) || !$this.okProps($elm) ) 
			    	return false;
			    return true;
			},
			
			/** 
			 * Returns true only if the element follow the standard flow
			 * @param 	{Object}	$elm	Element
			 * 
			 * @return 	{Boolean}
			 * */
			okProps: function($elm) 
			{
			    if ($elm.css('float')!=='none')
			        return false;  
			    switch($elm.css('position')) {
			        case 'static': case 'relative':  break;
			        default: 						 return false;
			    }
			    switch ($elm.css('display')) {
			        case 'block': case 'list-item': case 'table':  return true;
			    }
			    return false;
			},
			
			/**
			 * Removes position placeholder
			 * 
			 * @param	void
			 * */
			removePositionPlaceholder: function()
			{
				if(this.$plh && this.$plh.length)
					this.$plh.remove();
				this.$plh = null;
			},
			
			/* Run method */
			run: function(){
				this.enable();
			},
			
			/* Stop method */
			stop: function(){
				this.removePositionPlaceholder();
				this.stopSelectPosition();
				this.$wrapper.css('cursor','');//changes back aspect of the cursor
				this.$wrapper.unbind();//removes all attached events
			}
		};
});
define('Commands/view/CreateComponent',['backbone','./SelectPosition'],
	function(Backbone, SelectPosition) {
		/**
		 * @class CreateComponent
		 * */
		return _.extend({}, SelectPosition, {

			newElement : null,

			tempComponent: { style:{} },

			init: function(opt) {
				SelectPosition.init.apply(this, arguments);
				_.bindAll(this,'startDraw','draw','endDraw','rollback');
				this.config		= opt;
				this.heightType = this.config.newFixedH ? 'height' : 'min-height';
			},

			/**
			 * Returns creation placeholder
			 *
			 * @return 	{Object}
			 * */
			getCreationPlaceholder: function()
			{
				return this.newElem;
			},

			/**
			 * Removes creation placeholder
			 *
			 * @return 	void
			 * */
			removeCreationPlaceholder: function()
			{
				this.newElem.remove();
			},

			/**
			 * Start with enabling to select position and listening to start drawning
			 * @return 	void
			 * */
			enable: function()
			{
				SelectPosition.enable.apply(this, arguments);
				this.$el.css('cursor','crosshair');
				this.enableToDraw();
			},

			/**
			 * Enable user to draw components
			 *
			 * @return 	void
			 * */
			enableToDraw: function()
			{
				this.$el.on('mousedown', this.startDraw);
				//Need to disable selection
			},

			/**
			 * Start drawing component
			 * @param 	{Object}	e	Event
			 *
			 * @return 	void
			 * */
			startDraw : function(e)
			{
				e.preventDefault();
				this.stopSelectPosition();														//Interrupt selecting position
				this.tempComponent = { style: {} };												//Reset the helper
				this.isDragged = false;
				this.beforeDraw(this.tempComponent);
				this.getPositionPlaceholder().addClass('change-placeholder');					//Change color of the position placeholder
				this.newElemOrig = { top : e.pageY, left: e.pageX };
				this.newElem = $('<div>', {class: "tempComp"}).css(this.newElemOrig);			//Create helper element with initial position
				this.newElem.data('helper',1);
				$('body').append(this.newElem);													//Show helper component
				this.parentElem=this.newElem.parent();											//For percent count
				this.targetC = this.outsideElem;
				$(document).mousemove(this.draw);
				$(document).mouseup(this.endDraw);
				$(document).keypress(this.rollback);
			},

			/**
			 * While drawing the component
			 * @param 	{Object}	e	Event
			 *
			 * @return 	void
			 * */
			draw: function(e)
			{
				this.isDragged = true;
				this.updateComponentSize(e);
			},

			/**
			 * End drawing component
			 * @param 	{Object}	e Event
			 *
			 * @return 	void
			 * */
			endDraw : function(e)
			{
				$(document).off('mouseup', this.endDraw);
				$(document).off('mousemove', this.draw);
				$(document).off('keypress',this.rollback);
				var model = {};
				if(this.isDragged){																						//Only if the mouse was moved
					this.updateComponentSize(e);
					this.setRequirements(this.tempComponent);
					model = this.create(null,this.tempComponent,this.posIndex,this.posMethod);
				}
				if(this.getPositionPlaceholder())
					this.getPositionPlaceholder().removeClass('change-placeholder');			//Turn back the original color of the placeholder
				this.startSelectPosition();														//Return with selecting new position
				this.removeCreationPlaceholder();												//Remove the element used for size indication
				this.afterDraw(model);
			},

			/**
			 * Create component
			 * @param	{Object}	target	 	DOM of the target element which to push new component
			 * @param 	{Object}	component 	New component to push
			 * @param 	{Integer}	posIndex	Index inside the collection, 0 if no children inside
			 * @param 	{String}	method 		Before or after of the children
			 *
			 * @return 	{Object} Created model
			 * */
			create: function(target, component, posIndex, method)
			{
				var index = posIndex || 0;
				if(this.posTargetCollection && this.posTargetModel.get('droppable')){
					//Check config parameters for center in wrapper
					if(this.config.firstCentered && (this.$wrapper.get(0) == this.posTargetEl.get(0)) ){
						component.style.margin 	= '0 auto';
					}
					if(this.nearToFloat())							//Set not in flow if the nearest is too
						component.style.float 	= 'left';
					this.beforeCreation(component);
					var model = this.posTargetCollection.add(component, { at: index, silent:false });
					this.afterCreation(model);
					return model;
				}else
					console.warn("Invalid target position");
			},

			/**
			 * Check and set basic requirements for the component
			 * @param 	{Object}	component	New component to be created
			 * @return 	{Object} 	Component updated
			 * */
			setRequirements: function(component)
			{
				var c	= this.config;
				if(component.style.width.replace(/\D/g,'') < c.minComponentW)				//Check min width
					component.style.width = c.minComponentW +'px';
				if(component.style[this.heightType].replace(/\D/g,'') < c.minComponentH)		//Check min height
					component.style[this.heightType] = c.minComponentH +'px';
				if(c.newFixedH)															//Set overflow in case of fixed height
					component.style.overflow = 'auto';
				if(!this.absoluteMode){
					delete component.style.left;
					delete component.style.top;
				}else
					component.style.position = 'absolute';
				return component;
			},

			/**
			 * Update new component size while drawing
			 * @param 	{Object} 	e	Event
			 *
			 * @return 	void
			 * */
			updateComponentSize : function (e)
			{
		       	var newLeft		= e.pageX;
		        var newTop      = e.pageY;
		        var startLeft   = this.newElemOrig.left;
		        var startTop    = this.newElemOrig.top;
		       	var newWidth    = newLeft - startLeft;//$(this.newElem).offset().left
		        var newHeight   = newTop - startTop;//$(this.newElem).offset().top
		        if (newLeft < this.newElemOrig.left) {
		        	startLeft   = newLeft;
		            newWidth    = this.newElemOrig.left - newLeft;
		        }
		        if (newTop < this.newElemOrig.top) {
		        	startTop 	 = newTop;
		            newHeight    = this.newElemOrig.top - newTop;
		        }
		        newWidth = this.absoluteMode ? (newWidth/this.parentElem.width()*100+"%") : newWidth+'px';
		        this.newElem[0].style.left 	= startLeft+'px';
	        	this.newElem[0].style.top 	= startTop+'px';
	        	this.newElem[0].style.width = newWidth;
	        	this.newElem[0].style['min-height'] = newHeight+'px';
		        this.tempComponent.style.width = newWidth;
		        this.tempComponent.style[this.heightType] = newHeight+"px";
		        this.tempComponent.style.left = startLeft + "px";
		        this.tempComponent.style.top = startTop + "px";
			},

			/**
			 * Used to bring the previous situation before event started
			 * @param 	{Object}	e		Event
			 * @param 	{Boolean} 	forse	Indicates if rollback in anycase
			 *
			 * @return 	void
			 * */
			rollback: function(e, force)
			{
				var key = e.which || e.keyCode;
				if(key == this.config.ESCAPE_KEY || force){
					this.isDragged = false;
					this.endDraw();
				}
				return;
			},

			/**
			 * This event is triggered at the beginning of a draw operation
			 * @param 	{Object}	component	Object component before creation
			 *
			 * @return 	void
			 * */
			beforeDraw: function(component){
				component.editable = false;//set this component editable
			},

			/**
			 * This event is triggered at the end of a draw operation
			 * @param 	{Object}	model	Component model created
			 *
			 * @return 	void
			 * */
			afterDraw: function(model){},

			/**
			 * This event is triggered just before a create operation
			 * @param 	{Object} 	component	Object component before creation
			 *
			 * @return 	void
			 * */
			beforeCreation: function(component){},

			/**
			 * This event is triggered at the end of a create operation
			 * @param 	{Object}	model	Component model created
			 *
			 * @return 	void
			 * */
			afterCreation: function(model){},

			/** Run method
			 * */
			run: function(em, sender){
				this.sender	= sender;
				this.$el 	= this.$wrapper;
				this.enable();
			},

			/** Stop method
			 * */
			stop: function(){
				this.removePositionPlaceholder();											//Removes placeholder from eventSelectPosition
				this.stopSelectPosition();
				this.$el.css('cursor','');													//Changes back aspect of the cursor
				this.$el.unbind();															//Removes all attached events
			}
		});
	});
define('Commands/view/DeleteComponent',['backbone', './SelectComponent'],
	function(Backbone, SelectComponent) {
		/** 
		 * @class DeleteComponent
		 * */
		return _.extend({},SelectComponent,{
			
			init: function(o){
				this.hoverClass	= this.pfx + 'hover-delete';
				this.badgeClass	= this.pfx + 'badge-red';
			},
			
			enable: function(){
				var that = this;
				this.$el.find('*').mouseover(function (e){
				    e.stopPropagation();
				    if($(this).data('model').get('removable')){	//Show badge if possible
				    	$(this).addClass(that.hoverClass);
				    	that.attachBadge(this);
				    }
				}).mouseout(function (e){						//hover out
				    e.stopPropagation();
				    $(this).removeClass(that.hoverClass);
				    if(that.badge)								//Hide badge if possible
				    	that.badge.css({ left: -1000, top:-1000 });
				}).click(function(e){
					that.onSelect(e,this);						//Callback on select
				});
			},
			
			/** 
			 * Say what to do after the component was selected
			 * @param Event
			 * @param Object Selected element
			 * */
			onSelect: function(e, el){
				e.stopPropagation();
				var $selected = $(el);
				if(!$selected.data('model').get('removable')) //Do nothing in case can't remove
					return;
				$selected.data('model').destroy();
				this.removeBadge();
				this.clean();
			},
			
			/** 
			 * Updates badge label
			 * @param Object Model
			 * @return void
			 * */
			updateBadgeLabel: function (model){
				this.badge.html( 'Remove '+model.getName() );
			},
		});
	});
define('Commands/view/InsertCustom',['backbone', './SelectPosition'],
	function(Backbone, SelectPosition) {
		/** 
		 * @class InsertCustom
		 * */
		return _.extend({}, SelectPosition, {
			
			/** 
			 * Run method 
			 * */
			run: function(em, sender){
				this.enable();
				this.sender		= sender;
				this.opt 		= sender.get('options') || {};
				this.content	= this.opt.content;
			},
			
			enable: function(){
				SelectPosition.enable.apply(this, arguments);
				_.bindAll(this,'insertComponent');
				this.$wp	= this.$wrapper;
				this.$wp.on('click', this.insertComponent);
			},
			
			/** 
			 * Start insert event
			 * 
			 * @return void
			 * */
			insertComponent: function(){
				this.$wp.off('click', this.insertComponent);
				this.stopSelectPosition();
				this.removePositionPlaceholder();
				var object 	= this.buildContent();
				this.beforeInsert(object);						
				var model = this.posTargetCollection.add(object, { at: this.posIndex, silent:false });				
				if(this.opt.terminateAfterInsert && this.sender)
					this.sender.set('active',false);
				else
					this.enable();
				this.afterInsert(model, this);
			},
			
			/**
			 * Trigger before insert
			 * @param 	{Object}	obj
			 * 
			 * @return 	void
			 * */
			beforeInsert: function(obj){},
			
			/**
			 * Trigger after insert
			 * @param	{Object}	model	Model created after insert
			 * 
			 * @return 	void
			 * */
			afterInsert: function(model){},
			
			/** 
			 * Create different object, based on content, to insert inside canvas
			 * 
			 * @return 	{Object}
			 * */
			buildContent: function(){
				var result = {};
				if(typeof this.content === 'string'){
					result = {						
						content	: this.content, 
						tagName	: 'span',
					};
				}else if(typeof this.content === 'object'){
					result = this.content;
				}
				return result;
			},
		});
	});
define('Commands/view/ImageComponent',['backbone', './InsertCustom'],
	function(Backbone, InsertCustom) {
		/** 
		 * @class ImageComponent
		 * */
		return _.extend({}, InsertCustom, {
			
			/**
			 * Trigger before insert
			 * @param 	{Object}	object
			 * 
			 * */
			beforeInsert: function(object){
				object.type 			= 'image';
				object.style			= {};
				if (!this.nearToFloat()) {
					object.style.display	= 'block';
				}
				if (this.config.firstCentered && (this.$wp.get(0) == this.posTargetEl.get(0)) ) {
					object.style.margin 	= '0 auto';
				}
			},
			
			/**
			 * Trigger after insert
			 * @param	{Object}	model	Model created after insert
			 * 
			 * */
			afterInsert: function(model){
				model.trigger('dblclick');
				if(this.sender)
					this.sender.set('active', false);
			},
			
			
		});
	});
define('Commands/view/MoveComponent',['backbone', './SelectComponent','./SelectPosition'],
	function(Backbone, SelectComponent, SelectPosition) {
		/**
		 * @class MoveComponent
		 * */
		return _.extend({},SelectComponent, SelectPosition,{

			init: function(o){
				_.bindAll(this,'startMove','onMove','endMove','rollback','selectingPosition','itemLeft');//to mantein 'this' context
				this.opt	= o;
				this.hoverClass	= this.pfx + 'hover-move';
				this.badgeClass	= this.pfx + 'badge-yellow';
				this.noSelClass	= this.pfx + 'no-select';
			},

			enable: function(){
				this.canvasTop 	= this.$canvas.offset().top;
				this.canvasLeft	= this.$canvas.offset().left;
				this.$el.css('cursor','move');
				this.$el.on('mousedown', this.startMove);
				this.startSelectComponent();
				//Avoid strange moving behavior
				this.$el.addClass(this.noSelClass);
			},

			/** Highlight component when pointer is over it
			 * @param Event
			 * @param Object Component
			 * @return void
			 * */
			highlightComponent: function(e, el){
				e.stopPropagation();
				if($(el).data('model').get('movable')){							//Show badge if possible
					 $(el).addClass(this.hoverClass);
					 this.attachBadge(el);
			    }
			},

			/** Say what to do after the component was selected
			 * 	- Method from selectComponent
			 * @param Event
			 * @param Object Selected element
			 * */
			onSelect: function(e,el){},

			/** Picking component to move
			 * @param event
			 * */
			startMove: function(e, el){
				this.moved = false;
				if( !$(e.target).data('model').get('movable') ){  return; }					//In case the component selected is not movable
				this.$el.off('mousedown', this.startMove);
				this.stopSelectComponent(e);
				this.$selectedEl = $(e.target);
				this.freezeComponent(this.$selectedEl);
				this.helperObj =  $('<div>', {class: "tempComp"}).css({ 					//HELPER gray box
					top : (e.pageY - this.canvasTop) + this.$canvas.scrollTop(),
					left: (e.pageX - this.canvasLeft) + this.$canvas.scrollLeft(),
					width: $(e.target).width(),
					height: $(e.target).height(),
					position : 'absolute',
					'pointer-events': 'none',							//disable events for the element
				}).data('helper',1).appendTo(this.$el);

				this.startSelectPosition();

				this.$el.on('mousemove',this.onMove);
				$(document).on('mouseup',this.endMove);
				$(document).on('keypress',this.rollback);
			},

			/** During move
			 * @param event */
			onMove: function(e){
				this.moved = true;
				var relativeY = (e.pageY - this.canvasTop) + this.$canvas.scrollTop();
				var relativeX = (e.pageX - this.canvasLeft) + this.$canvas.scrollLeft();
				this.helperObj[0].style.top = (relativeY)+'px';
				this.helperObj[0].style.left = (relativeX)+'px';
			},

			/** Leave component
			 * @param event */
			endMove: function(e){
				this.$el.off('mousemove',this.onMove);
				$(document).off('mouseup', this.endMove);
				$(document).off('keypress', this.rollback);
				this.helperObj.remove();

				this.removePositionPlaceholder();
				this.stopSelectPosition();

				//this.highlightComponent(e,el) after end of move
				if(this.moved)
					this.move(null, this.$selectedEl, this.posIndex, this.posMethod);
				this.unfreezeComponent(this.$selectedEl);
				this.enable();
			},

			/** Move component to new position
			 * @param object Component to move
			 * @param object Target component
			 * @param int Indicates the position inside the collection
			 * @param string Before of after component
			 *
			 * @return void
			 * */
			move: function(target, el, posIndex, posMethod){
				var index = posIndex || 0;
				var model = el.data("model");
				var collection = model.collection;

				var targetCollection 	= this.posTargetCollection;
				var targetModel 		= this.posTargetModel;

				if(targetCollection && targetModel.get('droppable')){
					var modelTemp = targetCollection.add({css:{}}, { at: index });
					var modelRemoved = collection.remove(model);
					targetCollection.add(modelRemoved, { at: index });
					targetCollection.remove(modelTemp);//{ avoidStore: 1 }
				}else
					console.warn("Invalid target position");
			},

			/** Make component untouchable
			 * @param object Component
			 * @return void
			 * */
			freezeComponent: function($component){
				$component.css({'pointer-events':'none'});
				$component.addClass('freezed');
			},

			/** Make component touchable
			 * @param object Component
			 * @return void
			 * */
			unfreezeComponent: function($component){
				$component.css({'pointer-events':'auto'});
				$component.removeClass('freezed');
			},

			/** Used to bring the previous situation before start moving the component
			 * @param Event
			 * @param Bool Indicates if rollback in anycase
			 * @return void
			 * */
			rollback: function(e, force){
				var key = e.which || e.keyCode;
				if(key == this.opt.ESCAPE_KEY || force){
					this.moved = false;
					this.endMove();
				}
				return;
			},

			/** Closing method
			 * */
			last: function(){
				this.placeholder.remove();
				this.placeholderStart.remove();
				this.helperObj.remove();
				this.$el.off('mousemove',this.move);
				$(document).off('mouseup', this.endMove);
				$(document).off('keypress', this.rollback);
			},

			/* Run method */
			run: function(){
				this.enable();
			},

			/* Stop method */
			stop: function(){
				this.stopSelectComponent();
				this.$el.css('cursor','');//changes back aspect of the cursor
				this.$el.unbind();//removes all attached events
				this.$el.removeClass(this.noSelClass);
			}
		});
	});
define('Commands/view/TextComponent',['backbone', './CreateComponent'],
	function(Backbone, CreateComponent) {
		/**
		 * @class TextComponent
		 * */
		return _.extend({}, CreateComponent, {
			
			/** 
			 * This event is triggered at the beginning of a draw operation
			 * @param 	{Object} 	component	Object component before creation
			 * 
			 * */
			beforeDraw: function(component){
				component.type = 'text';
				if(!component.style)
					component.style	= {};
				component.style.padding = '10px';
			},
			
			/** 
			 * This event is triggered at the end of a draw operation
			 * @param 	{Object}	model	Component model created
			 * 
			 * */
			afterDraw: function(model){
				if(!model || !model.set)
					return;
				model.trigger('focus');
				if(this.sender)
					this.sender.set('active', false);
			},
			
		});
	});
define('Commands/view/ExportTemplate',[],function() {
		/**
		 * @class ExportTemplate
		 * */
		return {

			run: function(em, sender){
				this.sender		= sender;
				this.components = em.get('Canvas').getWrapper().get('components');
				this.modal		= em.get('Modal') || null;
				this.cm			= em.get('CodeManager') || null;
				this.enable();
			},

			/**
			 * Build editor
			 * @param	{String}	codeName
			 * @param	{String}	theme
			 * @param	{String}	label
			 *
			 * @return	{Object}	Editor
			 * */
			buildEditor: function(codeName, theme, label)
			{
				if(!this.codeMirror)
					this.codeMirror		= this.cm.getEditor('CodeMirror');

				var $input 		= $('<textarea>'),

					editor		= this.codeMirror.clone().set({
						label		: label,
						codeName	: codeName,
						theme		: theme,
						input		: $input[0],
					}),

					$editor 	= new this.cm.EditorView({
						model		: editor,
						config		: this.cm.config
					}).render().$el;

				editor.init( $input[0] );

				return { el: editor, $el: $editor };
			},

			enable: function()
			{
				if(!this.$editors){
					var oHtmlEd			= this.buildEditor('htmlmixed', 'hopscotch', 'HTML'),
						oCsslEd			= this.buildEditor('css', 'hopscotch', 'CSS');
					this.htmlEditor		= oHtmlEd.el;
					this.cssEditor		= oCsslEd.el;
					this.$editors		= $('<div>');
					this.$editors.append(oHtmlEd.$el).append(oCsslEd.$el);
				}

				if(this.modal){
					this.modal.setTitle('Export template');
					this.modal.setContent(this.$editors);
					this.modal.show();
				}

				this.htmlEditor.setContent( this.cm.getCode(this.components, 'html') );
				this.cssEditor.setContent( this.cm.getCode(this.components, 'css') );

				if(this.sender)
					this.sender.set('active',false);
			},

			stop: function(){}
		};
	});
define('Commands/view/SwitchVisibility',[],function() {
		/**
		 * @class SwitchVisibility
		 * */
		return {
			
			run: function()
			{
				this.$canvas.addClass(this.pfx + 'dashed');
			},
			
			stop: function()
			{
				this.$canvas.removeClass(this.pfx + 'dashed');
			}
		};
	});
define('Navigator/config/config',[],function () {
	return {
		stylePrefix		: 'nv-',
		sortable		: true,
		hidable			: true,
		containerId		: 'navigator',
		itemClass		: 'item',
		itemsClass		: 'items',
	};
});

define('text!Navigator/template/item.html',[],function () { return '<% if (hidable) { %>\n\t<i id="<%= prefix %>btn-eye" class="btn fa fa-eye <%= (visible ? \'\' : \'fa-eye-slash\') %>"></i>\n<% } %>\n<div class="<%= prefix %>title <%= addClass %>">\n\t<i id="<%= prefix %>caret" class="fa fa-chevron-right"></i>\n\t<%= title %>\n</div>\n\n<div id="<%= prefix %>counter"><%= (count ? count : \'\') %></div>\n\n<div id="<%= prefix %>move"> \n\t<i class="fa fa-arrows"></i> \n</div>\n\n<div class="<%= prefix %>children"></div>\n';});

define('Navigator/view/ItemView',['backbone', 'text!./../template/item.html','require'],
	function (Backbone, ItemTemplate, require) {
	/**
	 * @class ItemView
	 * */

	return Backbone.View.extend({

		template: _.template(ItemTemplate),

		initialize: function(o){
			this.opt 		= o;
			this.config		= o.config;
			this.sorter		= o.sorter || {};
			this.pfx		= this.config.stylePrefix;
			if(typeof this.model.get('open') == 'undefined')
				this.model.set('open',false);
			this.listenTo(this.model.components, 'remove add change reset', this.checkChildren);
			this.listenTo(this.model, 'destroy remove', this.remove);
			this.listenTo(this.model, 'change:open', this.updateOpening);
			this.className	= this.pfx + 'item no-select';
			this.events		= {};
			this.events['click > #'+this.pfx+'btn-eye']	= 'toggleVisibility';
			this.events['click .'+this.pfx+'title']		= 'toggleOpening';
			this.$el.data("model", this.model);

			if(o.config.sortable)
				this.events['mousedown > #'+this.pfx+'move']	= 'startSort';

			this.delegateEvents();
		},

		/**
		 * Update item opening
		 *
		 * @return void
		 * */
		updateOpening: function (){
			if(this.model.get('open')){
				this.$el.addClass("open");
				this.$caret.addClass('fa-chevron-down');
			}else{
				this.$el.removeClass("open");
				this.$caret.removeClass('fa-chevron-down');
			}
		},

		/**
		 * Toggle item opening
		 * @param {Object}	e
		 *
		 * @return void
		 * */
		toggleOpening: function(e){
			e.stopPropagation();
			if(!this.model.components.length)
				return;
			this.model.set('open', !this.model.get('open') );
		},

		/**
		 * Delegate to sorter
		 * @param	Event
		 * */
		startSort: function(e){
			if(this.sorter)
				this.sorter.startMove(this, e);
		},

		/**
		 * Freeze item
		 * @return	void
		 * */
		freeze: function(){
			this.$el.addClass(this.pfx + 'opac50');
			this.model.set('open',0);
		},

		/**
		 * Unfreeze item
		 * @return	void
		 * */
		unfreeze: function(){
			this.$el.removeClass(this.pfx + 'opac50');
		},

		/**
		 * Update item on status change
		 * @param	Event
		 *
		 * @return void
		 * */
		updateStatus: function(e){
			var s	= this.model.get('status'),
				pr	= this.model.get('previousModel'),
				pfx	= this.pfx;
			switch(s) {
			    case 'selected':
			    	this.$el.addClass(pfx + 'selected');
			        break;
			    case 'moving':
			        break;
			    default:
			    	this.$el.removeClass(pfx + 'selected');
			}
			if(pr){
				pr.set('previousModel','');
				pr.set('status','');
			}
		},

		/**
		 * Toggle visibility
		 * @param	Event
		 *
		 * @return 	void
		 * */
		toggleVisibility: function(e){
			if(!this.$eye)
				this.$eye	= this.$el.find('> #'+this.pfx+'btn-eye');

			var cCss		= _.clone(this.model.get('style')),
				hClass		= this.pfx + 'hide';
			if(this.isVisible()){
				this.$el.addClass(hClass);
				this.$eye.addClass('fa-eye-slash');
				cCss.display	= 'none';
			}else{
				this.$el.removeClass(hClass);
				this.$eye.removeClass('fa-eye-slash');
				delete cCss.display;
			}
			this.model.set('style', cCss);
		},

		/**
		 * Check if component is visible
		 *
		 * @return bool
		 * */
		isVisible: function(){
			var css	= this.model.get('style'),
				pr	= css.display;
			if(pr && pr == 'none' )
				return;
			return 1;
		},

		/**
		 * Update item aspect after children changes
		 *
		 * @return void
		 * */
		checkChildren: function(){
			var c	= this.model.components.length,
				pfx	= this.pfx;
			if(!this.$counter)
				this.$counter	= this.$el.find('> #' + pfx + 'counter');
			if(c){
				this.$el.find('> .' + pfx + 'title').removeClass(pfx + 'no-chld');
				this.$counter.html(c);
			}else{
				this.$el.find('> .' + pfx + 'title').addClass(pfx + 'no-chld');
				this.$counter.empty();
				this.model.set('open',0);
			}
		},

		render : function(){
			var pfx	= this.pfx,
				vis	= this.isVisible();
			this.$el.html( this.template({
				title		: this.model.getName(),
				addClass	: (this.model.components.length ? '' : pfx+'no-chld'),
				count		: this.model.components.length,
				visible		: vis,
				hidable		: this.config.hidable,
				prefix		: pfx
			}));
			if(typeof ItemsView == 'undefined')
				ItemsView = require('./ItemsView');
			this.$components	= new ItemsView({
				collection 	: this.model.components,
				config		: this.config,
				sorter		: this.sorter,
				parent		: this.model
			}).render().$el;
			this.$el.find('.'+ pfx +'children').html(this.$components);
			this.$caret			= this.$el.find('> .' + pfx + 'title > #' + pfx + 'caret');
			if(!this.model.get('movable') || !this.config.sortable){
				this.$el.find('> #' + pfx + 'move').detach();
			}
			if(!vis)
				this.className += ' ' + pfx + 'hide';
			this.$el.attr('class', _.result(this, 'className'));
			return this;
		},

	});
});

define('Navigator/view/ItemsView',['backbone','./ItemView'], 
	function (Backbone, ItemView) {
	/** 
	 * @class ItemsView
	 * */
	return Backbone.View.extend({
		
		initialize: function(o) {
			this.opt 		= o;
			this.config		= o.config;
			this.preview	= o.preview;
			this.sorter		= o.sorter || {};
			this.pfx		= o.config.stylePrefix;
			this.parent		= o.parent;
			this.listenTo( this.collection, 'add', this.addTo );
			this.listenTo( this.collection, 'reset', this.render );
			this.className 	= this.pfx + 'items';
			
			if(!this.parent)
				this.className	+= ' ' + this.pfx + this.config.containerId;
		},
		
		/**
		 * Add to collection
		 * @param Object Model
		 * 
		 * @return Object
		 * */
		addTo: function(model){
			var i	= this.collection.indexOf(model);
			this.addToCollection(model, null, i);
		},
		
		/**
		 * Add new object to collection
		 * @param	Object	Model
		 * @param	Object 	Fragment collection
		 * @param	integer	Index of append
		 * 
		 * @return Object Object created
		 * */
		addToCollection: function(model, fragmentEl, index){
			var fragment	= fragmentEl || null;
			var viewObject	= ItemView;
			
			var view 		= new viewObject({ 
				model 	: model, 
				config	: this.config,
				sorter	: this.sorter,
			});
			var rendered	= view.render().el;
			
			if(fragment){
				fragment.appendChild(rendered);
			}else{
				if(typeof index != 'undefined'){
					var method	= 'before';
					// If the added model is the last of collection
					// need to change the logic of append
					if(this.$el.children().length == index){
						index--;
						method	= 'after';
					}
					// In case the added is new in the collection index will be -1
					if(index < 0){
						this.$el.append(rendered);
					}else
						this.$el.children().eq(index)[method](rendered);
				}else
					this.$el.append(rendered);
			}
			
			return rendered;
		},
		
		render: function() {
			var fragment = document.createDocumentFragment();
			this.$el.empty();
			
			this.collection.each(function(model){
				this.addToCollection(model, fragment);
			},this);
			
			this.$el.append(fragment);
			this.$el.attr('class', _.result(this, 'className'));
			return this;
		}
	});
});

define('Navigator/view/ItemSort',['backbone'],
	function(Backbone) {
		/** 
		 * @class ItemSort
		 * */
		return Backbone.View.extend({
			
			initialize: function(o) {
				_.bindAll(this,'startMove','onMove','endMove','rollback', 'itemLeft');
				this.config		= o.config || {};
				this.pfx		= o.config.stylePrefix;
				this.itemClass	= '.' + this.pfx + this.config.itemClass;
				this.itemsClass	= '.' + this.pfx + this.config.itemsClass;
				this.setElement('.'+this.pfx+this.config.containerId);
			},
			
			/** 
			 * Picking component to move
			 * @param {Object}	Element view
			 * @param {Object}	Event
			 * 
			 * @return void
			 * */
			startMove: function(eV, e){
				this.moved 		= false;
				this.eV			= eV;
				this.$sel		= this.eV.$el;
				this.$selParent	= this.$sel.closest(this.itemsClass);
				
				// In case the component selected is not movable
				if( !eV.model.get('movable') )
					return;
				
				// Create placeholder if not exists
				if(!this.$plh){
					var pfx		= this.pfx;
					this.$plh 	=  $('<div>', {id: pfx + 'placeholder'}).css({'pointer-events':'none'}).hide();
					this.$plh.append( $('<div>', {id: pfx + "plh-int", class: pfx + 'insert'} ) );
					
					if(!this.$el.length)
						this.$el	= $('.'+this.pfx+this.config.containerId);
					
					this.$plh.appendTo(this.$el);
				}
				this.$plh.data('hide',1);
				eV.freeze();
				this.$el.on('mousemove',this.onMove);
				$(document).on('mouseup',this.endMove);
				$(document).on('keypress',this.rollback);
			},
			
			/**
			 * Get children dimensions
			 * @param	{Object}	Parent element
			 * 
			 * @retun	{Array}
			 * */
			getChildrenDim: function(el){
				var dim 	= [],
					p 		= el || this.$targetEl.parent(),
					oT		= this.elT,
					oL		= this.elL,
					ch		= p.children('.' + this.pfx + this.config.itemClass);
				ch.each(function(){
					var $el		= $(this),
						$elO	= $el.offset();
					dim.push( [ $elO.top - oT, $elO.left - oL, $el.outerHeight(), $el.outerWidth(), true, this]);
				});
				return dim;
			},
			
			/** 
			 * During move
			 * @param {Object} Event 
			 * 
			 * @return void
			 * */
			onMove: function(e){
				this.moved 		= true;
				
				if(this.$plh.data('hide')){
					this.$plh.show();
					this.$plh.data('hide',0);
				}
				var	eO			= this.$el.offset();
				this.elT		= eO.top;
				this.elL		= eO.left;
				this.rY			= (e.pageY - this.elT) + this.$el.scrollTop();
				this.rX 		= (e.pageX - this.elL) + this.$el.scrollLeft();
				this.inspect(e);
				this.updatePosition(this.rX, this.rY);
				var actualPos 	= this.posIndex+':'+this.posMethod;
				
				//If there is a significant changes with the pointer
				if(!this.lastPos || (this.lastPos != actualPos)){								
					this.updatePlaceholderPos(this.posIndex, this.posMethod);
					this.lastPos	= this.posIndex+':'+this.posMethod;
				}
				//Working alternative for find taget element
				//var $targetEl = this.$selParent.children('.'+this.pfx+this.config.itemClass).eq(this.aIndex);
			},
			
			/** 
			 * Search where to put placeholder
			 * @param int X position of the mouse
			 * @param int Y position of the mouse
			 * @retun void
			 * */
			updatePosition: function( posX, posY ){
				this.posMethod = "before";
				this.posIndex = 0;				
				var leftLimit = 0, xLimit = 0, dimRight = 0, yLimit = 0, xCenter = 0, yCenter = 0, dimDown = 0, dim = 0;
				for(var i = 0; i < this.cDim.length; i++){											//Dim => t,l,h,w
					dim = this.cDim[i];
					dimDown = dim[0] + dim[2];
					yCenter = dim[0] + (dim[2] / 2);												//Horizontal center
					xCenter = dim[1] + (dim[3] / 2);												//Vertical center
					dimRight = dim[1] + dim[3];
					if( (xLimit && dim[1] > xLimit) || (yLimit && yCenter > yLimit) ||
						(leftLimit && dimRight < leftLimit))										//No need with this one if over the limit
							continue;
					if(!dim[4]){																	//If it's not inFlow (like float element)
						if( posY < dimDown)	
							yLimit = dimDown;
						if( posX < xCenter){														//If mouse lefter than center
							xLimit = xCenter;
							this.posMethod = "before";
						}else{
							leftLimit = xCenter;
							this.posMethod = "after";
						}
						this.posIndex = i;
					}else{
						this.posIndex = this.aIndex = i;
						if( posY < yCenter ){														//If mouse upper than center
							this.posMethod = "before";												//Should place helper before
							if(posY < dim[0])
								this.aIndex = i - 1;
							break;																	//No need to continue under inFlow element
						}else
							this.posMethod = "after";
					}
				}
			},
			
			/** 
			 * Updates the position of the placeholder
			 * @param int Index of the nearest child
			 * @param str Before or after position
			 * @return void
			 * */
			updatePlaceholderPos: function(index, method){
				var	marg = 0, t = 0, l = 0, w = 0, h = 0,
					un			= 'px',
					margI		= 5,
					plh			= this.$plh[0];
				if( this.cDim[index] ){
					var elDim	= this.cDim[index];
					//If it's like with 'float' style
					if(!elDim[4]){																			
						w		= 'auto';
						h		= elDim[2] - (marg * 2) + un;
						t		= elDim[0] + marg;
						l		= (method == 'before') ? (elDim[1] - marg) : (elDim[1] + elDim[3] - marg);
					}else{
						//w		= '100%';
						w		= elDim[3] + un;
						//h		= elDim[3] + un;
						t		= (method == 'before') ? (elDim[0] - marg) : (elDim[0] + elDim[2] - marg);
						l		= elDim[1];
					}
				}else{
					if(this.$targetEl){
						var trg		= this.$targetEl[0],
							$elO	= this.$targetEl.offset();
						t		= $elO.top 	- this.elT 	+ margI + 17;
						l		= $elO.left - this.elL	+ margI * 7;
						w 		= (parseInt(trg.offsetWidth) - margI * 14) + un;
					}
				}
				plh.style.top			= t	+ un;
				plh.style.left			= l	+ un;
				if(w)
					plh.style.width		= w;
				if(h)
					plh.style.height	= h;
			},
			
			/** 
			 * Leave item
			 * @param event
			 * 
			 * @return void
			 * */
			endMove: function(e){
				this.$el.off('mousemove',this.onMove);
				$(document).off('mouseup', this.endMove);
				$(document).off('keypress', this.rollback);
				this.eV.unfreeze();
				this.$plh.hide();
				if(this.moved)
					this.move(this.$targetEl, this.$sel, this.posIndex, this.posMethod);
				this.itemLeft();
			},
			
			/** 
			 * Move component to new position
			 * @param	{Object} 	Component to move
			 * @param	{Object} 	Target component
			 * @param 	{Integer} 	Indicates the position inside the collection
			 * @param 	{String} 	Before of after component
			 * 
			 * @return void
			 * */
			move: function(target, el, posIndex, method){
				var trg					= target|| this.$targetEl;
				trg						= trg	|| this.$backupEl;
				if(!trg)
					return;
				var index 				= posIndex || 0;
				var model 				= el.data("model");
				var collection 			= model.collection;
				var targetModel 		= trg.data('model');
				var targetCollection	= targetModel.collection;
				
				if(!this.cDim.length)
					targetCollection	= targetModel.get('components');
				
				if(targetCollection && targetModel.get('droppable')){
					index				= method == 'after' ? index + 1 : index;
					var modelTemp 		= targetCollection.add({style:{}}, { at: index});
					var modelRemoved 	= collection.remove(model, { silent:false });
					targetCollection.add(modelRemoved, { at: index, silent:false });
					targetCollection.remove(modelTemp);
				}else
					console.warn("Invalid target position");
			},
			
			/** 
			 * Track inside which element pointer entered
			 * @param event
			 * 
			 * @return void
			 * */
			inspect: function(e){
				var	item		= $(e.target).closest(this.itemClass);
				if(!this.$targetEl || (item.length && item[0] != this.$targetEl[0]) ){
					this.status		= 1;
					if(item.length){
						this.$targetEl	= this.$backupEl = item;
						this.$targetElP	= this.$targetEl.parent();
						this.$targetsEl	= this.$targetEl.find(this.itemsClass + ':first');
						this.$targetEl.on('mouseleave', this.itemLeft);
						this.targetM	= this.$targetEl.data('model');
						this.dimT		= this.getTargetDim(this.$targetEl[0]);
						this.cDim 		= this.getChildrenDim();
					}
				}else if( this.nearToBorders(this.$targetEl[0]) || this.$targetEl[0] == this.$sel[0] ){
					if(this.status == 1){
						this.status		= 2;
						this.lastPos	= null;
						this.cDim 		= this.getChildrenDim(this.$targetElP);
					}
				}else if( !this.nearToBorders(this.$targetEl[0]) ){
					if(this.status == 2){
						this.status		= 1;
						this.lastPos	= null;
					}
					this.cDim		= [];
				}
			},
			
			/** 
			 * Triggered when pointer leaves item
			 * @param event 
			 * 
			 * @return void
			 * */
			itemLeft: function(e){
				if(this.$targetEl){
					this.$targetEl.off('mouseleave',this.itemLeft);
					this.$targetEl 		= null;
				}
			},
			
			/**
			 * Returns dimension of the target
			 * @param Event
			 * 
			 * @return Array
			 * */
			getTargetDim: function(e){
				var $el		= $(e),
					$elO	= $el.offset();
				return [ $elO.top - this.elT, $elO.left - this.elL, $el.outerHeight(), $el.outerWidth() ];
			},
			
			/** 
			 * Check if pointer is near to the borders of the target
			 * @param event 
			 * @return Bool
			 * */
			nearToBorders: function(e){
				var m = 10;																		//Limit in pixels for be near
				if(!this.dimT)
					return; 
				var dimT = this.dimT;
				if( ((dimT[0] + m) > this.rY) || (this.rY > (dimT[0] + dimT[2] - m)) || 
					((dimT[1] + m) > this.rX) || (this.rX > (dimT[1] + dimT[3] - m))  )
					return 1;
				else
					return 0;
			},
			
			/** 
			 * Rollback to previous situation
			 * @param Event
			 * @param Bool Indicates if rollback in anycase
			 * @return void
			 * */
			rollback: function(e, force){
				var key = e.which || e.keyCode;
				if(key == 27 || force){
					this.moved = false;
					this.endMove();
				}
				return;
			},
		});
	});
define('Navigator/main',['require','./config/config','./view/ItemsView','./view/ItemSort'],function(require) {
	/**
	 * @class Navigator
	 * @param {Object} Collection
	 * @param {Object} Configurations
 	 * */
	function Navigator(collection, c)
	{
		var config		= c,
			defaults	= require('./config/config'),
			ItemsView	= require('./view/ItemsView');

	    // Set default options
		for (var name in defaults) {
			if (!(name in config))
				config[name] = defaults[name];
		}
		
		var obj			= {
		    	collection	: collection,
		    	config		: config,
		};
		
		// Check if sort is required
		if(config.sortable){
			var ItemSort	= require('./view/ItemSort');
			obj.sorter		= new ItemSort({config : config});
		}
		
	    this.ItemsView	= new ItemsView(obj);
	}
	
	Navigator.prototype	= {
			render	: function(){
				return this.ItemsView.render().$el;
			},
	};
	
	return Navigator;
});
define('Navigator', ['Navigator/main'], function (main) { return main; });

define('Commands/view/OpenLayers',['Navigator'], function(Layers) {
		/** 
		 * @class OpenStyleManager
		 * */
		return {
			
			run: function(em, sender)
			{
				if(!this.$layers){
					var collection	= em.get('Components').getComponent().get('components'),
						config		= em.get('Config'),
						panels		= em.get('Panels'),
						lyStylePfx	= config.layers.stylePrefix || 'nv-';
					
					config.layers.stylePrefix = config.stylePrefix + lyStylePfx;
					var layers		= new Layers(collection, config.layers);
					this.$layers 	= layers.render();
					
					if(!panels.getPanel('views-container'))
						this.panel	= panels.addPanel({ id: 'views-container'});
					else
						this.panel	= panels.getPanel('views-container');
					
					this.panel.set('appendContent', this.$layers).trigger('change:appendContent');
				}
				this.$layers.show();
			},
			
			stop: function()
			{
				if(this.$layers)
					this.$layers.hide();
			}
		};
	});
define('StyleManager/config/config',[],function () {
	return {
		
		stylePrefix		: 'sm-',
		
		target			: null,
		
		sectors			: [],
		
	};
});
define('StyleManager/model/Sector',['backbone'],
	function(Backbone) {
		/** 
		 * @class Sector
		 * */
		return Backbone.Model.extend({
			
			defaults: {
				name : '', 			
				open: true,		
				properties : {},
			}
		
        });
	});
define('StyleManager/model/Property',['backbone'],
	function(Backbone) {
		/** 
		 * @class Property
		 * */
		return Backbone.Model.extend({
			
			defaults: {
				name : 			'', 			//Name of the property
				property: 		'',				//CSS property, eg. min-height
				type: 			'',				//Type of the property: integer | radio | select | color | file | composite | stack
				units: 			[],				//Unit of measure available, eg. ['px','%','em']
				unit: 			'',				//Unit selected
				defaults: 		'',				//Default value
				info: 			'',				//Description HTML
				value: 			'',				//Selected value of the property
				icon: 			'',				//If exists, a custom class will be attached and no text will be displayed
				preview:		false,			//Show layers preview. Available only for stack property
				functionName:	'',				//Indicates if value need to be wrapped in some function, for istance: transform: rotate(90deg)
				properties : 	{}, 			//For composite properties
				layers : 		{}, 			//For stack properties
				list: 			[],				//If exits, ignore type attribute ad display as multi-optional property
												//Any element could be as: 
												//	value : 'auto', 
												//	icon: 'auto', 
												//	defaults : true, 
												//  style:	'',			//custom style to the value of propriety
												//	name:''				//alternative view to value
			}
		
        });
	});
define('StyleManager/model/Properties',[ 'backbone','./Property'], 
	function (Backbone,Property) {
		/** 
		 * @class Properties
		 * */
		return Backbone.Collection.extend({
			
			model: Property,
			
		});
});

define('StyleManager/model/Sectors',[ 'backbone','./Sector','./Properties'],
	function (Backbone,Sector, Properties) {
		/** 
		 * @class Sectors
		 * */
		return Backbone.Collection.extend({
			
			model: Sector,
			
			initialize: function(collection) {
				
				_.each(collection, function(obj){
					
					if(obj.properties instanceof Array){
						obj.properties = new Properties(obj.properties);
					}
					
				},this);
				
			},
		
		});
});


define('text!StyleManager/templates/propertyLabel.html',[],function () { return '<div class="<%= pfx %>label">\n\t<div class="<%= pfx %>icon <%= icon %>" title="<%= info %>">\n\t\t<%= label %>\n\t</div>\n</div>';});

define('StyleManager/view/PropertyView',['backbone', 'text!./../templates/propertyLabel.html'], 
	function (Backbone, propertyTemplate) {
	/** 
	 * @class PropertyView
	 * */
	return Backbone.View.extend({
		
		template: 		_.template(propertyTemplate),
		templateLabel: 	_.template(propertyTemplate),
		
		events:			{
				'change' : 'valueChanged',
		},
		
		initialize: function(o) {
			this.config			= o.config;
			this.pfx 			= this.config.stylePrefix;
			this.target			= o.target 		|| {};
			this.onChange		= o.onChange 		|| {};
			this.onInputRender	= o.onInputRender	|| {};
			this.customValue	= o.customValue	|| {};
			this.func			= this.model.get('functionName');
			this.defaultValue 	= this.model.get('defaults');
			this.property 		= this.model.get('property');
			this.units 			= this.model.get('units');
			this.min 			= this.model.get('min') || this.model.get('min')===0 ? this.model.get('min') : -5000;
			this.max 			= this.model.get('max') || this.model.get('max')===0 ? this.model.get('max') : 5000;
			this.unit 			= this.model.get('unit') ? this.model.get('unit') : (this.units.length ? this.units[0] : '');
			this.list 			= this.model.get('list');
			this.input 			= this.$input = null;
			this.className 		= this.pfx  + 'property';
			this.selectedComponent	= this.target.get('selectedComponent');
			
			if(this.selectedComponent){
				this.componentValue = this.selectedComponent.get('style')[this.property];
			}
			
			this.listenTo( this.target ,'change:selectedComponent',this.componentSelected);
			this.listenTo( this.model ,'change:value', this.valueChanged);
		}, 
		
		/** 
		 * Rerender property for the new selected component, if necessary
		 * @param Array [Model, value, options]
		 * 
		 * @return void
		 * */
		componentSelected: function(e){
			this.selectedComponent = this.target.get('selectedComponent');
			if(this.selectedComponent){
				//I will rerender it only if the assigned one is different from the actuale value
				//console.log('property '+this.property+" view: "+this.componentValue+" model: "+ this.model.get('value'));
				if( !this.sameValue() ){
					this.renderInputRequest();
				}
			}
		},
		
		/**
		 * Checks if the value from selected component is the same with 
		 * the value of the model
		 * 
		 * @return boolean 
		 * */
		sameValue: function(){
			return this.getComponentValue() == (this.model.get('value')+this.model.get('unit'));
		},
		
		
		/**
		 * Get the value from the selected component of this property
		 * 
		 * @return string
		 * */
		getComponentValue: function(){
			if(!this.selectedComponent) 
				return;			
			
			if(this.selectedComponent.get('style')[this.property])
				this.componentValue = this.selectedComponent.get('style')[this.property];
			else
				this.componentValue = this.defaultValue + (this.unit ? this.unit : '');
			
			// Check if wrap inside function is required
			if(this.func){
				var v = this.fetchFromFunction(this.componentValue);
				if(v)
					this.componentValue = v;
			}
			
			//This allow to ovveride the normal flow of selecting component value,
			//useful in composite properties
			if(this.customValue && typeof this.customValue === "function"){
				var index 	=  this.model.collection.indexOf(this.model);
				var t		= this.customValue(this, index);
				if(t)
					this.componentValue = t;
			}
			
			return this.componentValue;
		},
		
		/**
		 * Fetch string from function type value
		 * @param string Function type value
		 * 
		 * @return string
		 * */
		fetchFromFunction: function(v){
			return v.substring(v.indexOf("(") + 1, v.lastIndexOf(")"));
		},
		
		/** 
		 * Property was changed, so I need to update the component too
		 * @param 	{Object}	e	Events
		 * @param	{Mixed}		val	Value
		 * @param	{Object}	opt	Options
		 * 
		 * @return void
		 * */
		valueChanged: function(e, val, opt){
			if(!this.selectedComponent)
				return;
			
			// Check if component is allowed to be styled
			var stylable	= this.selectedComponent.get('stylable');
			if( (stylable instanceof Array && _.indexOf(stylable, this.property) < 0) || !stylable )
				return;
			var v		= e && e.currentTarget ? this.$input.val() : this.model.get('value'),
				value	= v + (this.$unit ? this.$unit.val() : ''),
				avSt	= opt ? opt.avoidStore : 0;

			//The easiest way to deal with radio inputs
			if(this.model.get('type') == 'radio')
				value = this.$el.find('input:checked').val();
			
			if(this.$input)
				this.$input.val(v);
			this.model.set({ value : v },{ silent : true });
			
			if(this.func)
				value =  this.func + '(' + value + ')';
			
			if( !this.model.get('doNotStyle') ){
				var componentCss = _.clone( this.selectedComponent.get('style') );
				componentCss[this.property] = value;
				this.selectedComponent.set('style', componentCss, { avoidStore : avSt});
			}
			this.selectedValue = value;//TODO ?
			
			if(this.onChange && typeof this.onChange === "function"){
				this.onChange(this.selectedComponent, this.model);
			}
		},
		
		/**
		 * Set value to the input
		 * @param 	String	value
		 * 
		 * @return void
		 * */
		setValue: function(value, force){
			var f	= force===0 ? 0 : 1;
			var v 	= this.model.get('value') || this.defaultValue;
			if(value || f){
				v		= value;
			}
			if(this.$input)
				this.$input.val(v);
			this.model.set({value: v},{silent: true});
		},
		
		/**
		 * Render label
		 * 
		 * @return void
		 * */
		renderLabel: function(){
			this.$el.html( this.templateLabel({
				pfx		: this.pfx,
				icon	: this.model.get('icon'),
				info	: this.model.get('info'),
				label	: this.model.get('name'),
			}) );
		},
		
		/**
		 * Render field property
		 * 
		 * @return void
		 * */
		renderField : function() {
			this.renderTemplate();
			this.renderInput();
			delete this.componentValue;
		},
		
		/**
		 * Render loaded template
		 * 
		 * @return void
		 * */
		renderTemplate: function(){
			this.$el.append( this.template({
				pfx		: this.pfx,
				icon	: this.model.get('icon'),
				info	: this.model.get('info'),
				label	: this.model.get('name'),
			}));
		},
		
		/**
		 * Renders input, to override
		 * 
		 * @return void
		 * */
		renderInput: function(){
			console.warn("No render input implemented for '"+this.model.get('type')+"'");
		},
		
		/**
		 * Request to render input of the property
		 * 
		 * @return void
		 * */
		renderInputRequest: function(){
			this.renderInput();
			if(this.onInputRender && typeof this.onInputRender === "function"){
				var index =  this.model.collection.indexOf(this.model);
				this.onInputRender(this, index);
			}
		},
		
		/**
		 * Clean input
		 * 
		 * @return void
		 * */
		cleanValue: function(){
			this.setValue('');
		},
		
		render : function(){
			this.renderLabel();
			this.renderField();
			this.$el.attr('class', this.className);
			return this;
		},
		
	});
});


define('text!StyleManager/templates/propertyInteger.html',[],function () { return '<div class="<%= pfx %>field <%= pfx %>integer">\n\t<span id=\'<%= pfx %>input-holder\'></span>\n\t<span id=\'<%= pfx %>units-holder\'></span>\n\t<div class="<%= pfx %>int-arrows">\n\t\t<div class="<%= pfx %>u-arrow"></div>\n\t\t<div class="<%= pfx %>d-arrow"></div>\n\t</div>\n</div>';});

define('StyleManager/view/PropertyIntegerView',['backbone','./PropertyView', 'text!./../templates/propertyInteger.html'],
	function (Backbone, PropertyView, propertyTemplate) {
	/**
	 * @class PropertyIntegerView
	 * */
	return PropertyView.extend({

		template: _.template(propertyTemplate),

		initialize: function(options) {
			PropertyView.prototype.initialize.apply(this, arguments);
			_.bindAll(this, 'moveIncrement', 'upIncrement');
			this.events['click .'+this.pfx+'u-arrow']			= 'upArrowClick';
			this.events['click .'+this.pfx+'d-arrow']			= 'downArrowClick';
			this.events['mousedown .'+this.pfx+'int-arrows']	= 'downIncrement';
			this.delegateEvents();
		},

		/**
		 * Invoked when the up arrow is clicked
		 * @param Event
		 *
		 * @return void
		 * */
		upArrowClick: function(e){
			var value	= this.model.get('value');
			value 		= isNaN(value) ? 1 : parseInt(value,10) + 1;
			value 		= value > this.max ? this.max : value;
			this.model.set('value',value);
		},

		/**
		 * Invoked when the down arrow is clicked
		 * @param Event
		 *
		 * @return void
		 * */
		downArrowClick: function(e){
			var value	= this.model.get('value');
			value 		= isNaN(value) ? 0 : parseInt(value,10) - 1;
			value 		= value < this.min ? this.min : value;
			this.model.set('value',value);
		},

		/**
		 * Change easily integer input value with click&drag method
		 * @param Event
		 *
		 * @return void
		 * */
		downIncrement: function(e) {
			e.preventDefault();
			this.moved	= 0;
			var value	= this.model.get('value');
			value 		= isNaN(value) ? 0 : parseInt(value,10);
			var current = {y: e.pageY, val: value };
			$(document).mouseup(current, this.upIncrement);
			$(document).mousemove(current, this.moveIncrement);
		},

		/** While the increment is clicked, moving the mouse will update input value
		 * @param Object
		 *
		 * @return bool
		 * */
		moveIncrement: function (ev) {
			this.moved	= 1;
			this.prValue	= Math.max(this.min, Math.min(this.max, parseInt(ev.data.val - ev.pageY + ev.data.y, 10) ) );
			this.model.set( 'value', this.prValue, { avoidStore: 1 });
			return false;
		},

		/**
		 * Stop moveIncrement method
		 * @param Object
		 *
		 * @return void
		 * */
		upIncrement: function (e) {
			$(document).off('mouseup', this.upIncrement);
			$(document).off('mousemove', this.moveIncrement);

			if(this.prValue && this.moved)
				this.model.set('value', this.prValue - 1, {silent:1}).set('value', this.prValue + 1);
		},

		/** @inheritdoc */
		renderInput: function() {
			var pfx	= this.pfx;
			if(!this.$input){
				this.$input = $('<input>', {placeholder: 'auto', type: 'text' });
				this.$el.find('#'+ pfx +'input-holder').html(this.$input);
			}
			if(!this.$unit){
				if(this.units && this.units.length){
					this.unitS = '<select class="' + pfx + 'unit">';
					_.each(this.units,function(unit){
						var selected 	= unit == this.selectedUnit ? 'selected': '';
						this.unitS 		+= '<option '+selected+' >'+unit+'</option>';
					},this);
					this.unitS += '</select>';
					this.$unit = $(this.unitS);
					this.$el.find('#' + pfx + 'units-holder').html(this.$unit);
				}
			}
			this.setValue(this.componentValue);
		},

		/** @inheritdoc */
		setValue: function(value){
			var u	= this.unit,
				v	= this.model.get('value') || this.defaultValue;

			if(value){
				v		= parseInt(value, 10);
				v		= !isNaN(v) ? v : this.defaultValue;
				var uN	= value.replace(v,'');
				if(_.indexOf(this.units, uN) > -1)
					u = uN;
			}

			if(this.$input)
				this.$input.val(v);
			if(this.$unit)
				this.$unit.val(u);
			this.model.set({value: v, unit: u,},{silent: true});
		},

	});
});


define('text!StyleManager/templates/propertyRadio.html',[],function () { return '<div class="<%= pfx %>field <%= pfx %>list">\n\t<span id=\'<%= pfx %>input-holder\'></span>\n</div>\n<div style="clear:both"></div>';});

define('StyleManager/view/PropertyRadioView',['backbone','./PropertyView', 'text!./../templates/propertyRadio.html'], 
	function (Backbone, PropertyView, propertyTemplate) {
	/** 
	 * @class PropertyRadioView
	 * */
	return PropertyView.extend({
		
		template: _.template(propertyTemplate),
		
		initialize: function(options) {
			PropertyView.prototype.initialize.apply(this, arguments);
			this.className 	= this.className + ' '+ this.pfx +'list';
		},
		
		/** @inheritdoc */
		renderInput: function() {
			var pfx	= this.pfx;
			if(!this.$input){
				if(this.list && this.list.length){
					this.input = '';
					_.each(this.list,function(el){
						var cl 			= el.className ? el.className+' '+ pfx + 'icon' : '',
							title 		= el.title ? el.title : '',
							id			= this.property+'-'+el.value;
						this.input 		+= '<div class="' + pfx + 'el">'+
							'<input class="'+pfx+'radio" type="radio" id="'+ id +'" name="'+this.property+'" value="'+el.value+'" />'+
							'<label class="'+cl+'" title="'+title+'" for="'+ id +'">' + (cl ? '' : el.value) + '</label></div>';
					},this);
					this.$input 		= $(this.input);
					this.$el.find('#'+ pfx +'input-holder').html(this.$input);
					this.$inputRadio 	= this.$input.find('input[name="'+this.property+'"]');
				}
			}
			this.setValue(this.componentValue);
		},
		
		/** @inheritdoc */
		setValue: function(value){
			var v 	= this.model.get('value') || this.defaultValue;
			if(value){
				v	= value;
			}
			if(this.$inputRadio){
				this.$inputRadio.filter('[value="'+v+'"]').prop('checked', true);
			}
			this.model.set({value: v},{silent: true});
		},

	});
});


define('text!StyleManager/templates/propertySelect.html',[],function () { return '<div class="<%= pfx %>field <%= pfx %>select">\n\t<span id=\'<%= pfx %>input-holder\'></span>\n\t<div class="<%= pfx %>sel-arrow"><div class="<%= pfx %>d-s-arrow"></div></div>\n</div>\n<div style="clear:both"></div>';});

define('StyleManager/view/PropertySelectView',['backbone','./PropertyView', 'text!./../templates/propertySelect.html'], 
	function (Backbone, PropertyView, propertyTemplate) {
	/** 
	 * @class PropertySelectView
	 * */
	return PropertyView.extend({
		
		template: _.template(propertyTemplate),
		
		/** @inheritdoc */
		renderInput: function() {
			var pfx	= this.pfx;
			if(!this.$input){
				if(this.list && this.list.length){
					this.input = '<select>';
					_.each(this.list,function(el){
						var name 		= el.name ? el.name : el.value;
						var style 		= el.style ? el.style.replace(/"/g,'&quot;') : '';  
						this.input 		+= '<option value="'+el.value.replace(/"/g,'&quot;')+'" style="'+style+'">'+name+'</option>';
					},this);
					this.input 	+= '</select>';
					this.$input = $(this.input);
					this.$el.find('#'+ pfx +'input-holder').html(this.$input); 
				}
			}
			this.setValue(this.componentValue, 0);
		}, 

	});
});

// Spectrum Colorpicker v1.8.0
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// License: MIT

(function (factory) {
    "use strict";

    if (typeof define === 'function' && define.amd) { // AMD
        define('Spectrum',['jquery'], factory);
    }
    else if (typeof exports == "object" && typeof module == "object") { // CommonJS
        module.exports = factory(require('jquery'));
    }
    else { // Browser
        factory(jQuery);
    }
})(function($, undefined) {
    "use strict";

    var defaultOpts = {

        // Callbacks
        beforeShow: noop,
        move: noop,
        change: noop,
        show: noop,
        hide: noop,

        // Options
        color: false,
        flat: false,
        showInput: false,
        allowEmpty: false,
        showButtons: true,
        clickoutFiresChange: true,
        showInitial: false,
        showPalette: false,
        showPaletteOnly: false,
        hideAfterPaletteSelect: false,
        togglePaletteOnly: false,
        showSelectionPalette: true,
        localStorageKey: false,
        appendTo: "body",
        maxSelectionSize: 7,
        cancelText: "cancel",
        chooseText: "choose",
        togglePaletteMoreText: "more",
        togglePaletteLessText: "less",
        clearText: "Clear Color Selection",
        noColorSelectedText: "No Color Selected",
        preferredFormat: false,
        className: "", // Deprecated - use containerClassName and replacerClassName instead.
        containerClassName: "",
        replacerClassName: "",
        showAlpha: false,
        theme: "sp-light",
        palette: [["#ffffff", "#000000", "#ff0000", "#ff8000", "#ffff00", "#008000", "#0000ff", "#4b0082", "#9400d3"]],
        selectionPalette: [],
        disabled: false,
        offset: null
    },
    spectrums = [],
    IE = !!/msie/i.exec( window.navigator.userAgent ),
    rgbaSupport = (function() {
        function contains( str, substr ) {
            return !!~('' + str).indexOf(substr);
        }

        var elem = document.createElement('div');
        var style = elem.style;
        style.cssText = 'background-color:rgba(0,0,0,.5)';
        return contains(style.backgroundColor, 'rgba') || contains(style.backgroundColor, 'hsla');
    })(),
    replaceInput = [
        "<div class='sp-replacer'>",
            "<div class='sp-preview'><div class='sp-preview-inner'></div></div>",
            "<div class='sp-dd'>&#9660;</div>",
        "</div>"
    ].join(''),
    markup = (function () {

        // IE does not support gradients with multiple stops, so we need to simulate
        //  that for the rainbow slider with 8 divs that each have a single gradient
        var gradientFix = "";
        if (IE) {
            for (var i = 1; i <= 6; i++) {
                gradientFix += "<div class='sp-" + i + "'></div>";
            }
        }

        return [
            "<div class='sp-container sp-hidden'>",
                "<div class='sp-palette-container'>",
                    "<div class='sp-palette sp-thumb sp-cf'></div>",
                    "<div class='sp-palette-button-container sp-cf'>",
                        "<button type='button' class='sp-palette-toggle'></button>",
                    "</div>",
                "</div>",
                "<div class='sp-picker-container'>",
                    "<div class='sp-top sp-cf'>",
                        "<div class='sp-fill'></div>",
                        "<div class='sp-top-inner'>",
                            "<div class='sp-color'>",
                                "<div class='sp-sat'>",
                                    "<div class='sp-val'>",
                                        "<div class='sp-dragger'></div>",
                                    "</div>",
                                "</div>",
                            "</div>",
                            "<div class='sp-clear sp-clear-display'>",
                            "</div>",
                            "<div class='sp-hue'>",
                                "<div class='sp-slider'></div>",
                                gradientFix,
                            "</div>",
                        "</div>",
                        "<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>",
                    "</div>",
                    "<div class='sp-input-container sp-cf'>",
                        "<input class='sp-input' type='text' spellcheck='false'  />",
                    "</div>",
                    "<div class='sp-initial sp-thumb sp-cf'></div>",
                    "<div class='sp-button-container sp-cf'>",
                        "<a class='sp-cancel' href='#'></a>",
                        "<button type='button' class='sp-choose'></button>",
                    "</div>",
                "</div>",
            "</div>"
        ].join("");
    })();

    function paletteTemplate (p, color, className, opts) {
        var html = [];
        for (var i = 0; i < p.length; i++) {
            var current = p[i];
            if(current) {
                var tiny = tinycolor(current);
                var c = tiny.toHsl().l < 0.5 ? "sp-thumb-el sp-thumb-dark" : "sp-thumb-el sp-thumb-light";
                c += (tinycolor.equals(color, current)) ? " sp-thumb-active" : "";
                var formattedString = tiny.toString(opts.preferredFormat || "rgb");
                var swatchStyle = rgbaSupport ? ("background-color:" + tiny.toRgbString()) : "filter:" + tiny.toFilter();
                html.push('<span title="' + formattedString + '" data-color="' + tiny.toRgbString() + '" class="' + c + '"><span class="sp-thumb-inner" style="' + swatchStyle + ';" /></span>');
            } else {
                var cls = 'sp-clear-display';
                html.push($('<div />')
                    .append($('<span data-color="" style="background-color:transparent;" class="' + cls + '"></span>')
                        .attr('title', opts.noColorSelectedText)
                    )
                    .html()
                );
            }
        }
        return "<div class='sp-cf " + className + "'>" + html.join('') + "</div>";
    }

    function hideAll() {
        for (var i = 0; i < spectrums.length; i++) {
            if (spectrums[i]) {
                spectrums[i].hide();
            }
        }
    }

    function instanceOptions(o, callbackContext) {
        var opts = $.extend({}, defaultOpts, o);
        opts.callbacks = {
            'move': bind(opts.move, callbackContext),
            'change': bind(opts.change, callbackContext),
            'show': bind(opts.show, callbackContext),
            'hide': bind(opts.hide, callbackContext),
            'beforeShow': bind(opts.beforeShow, callbackContext)
        };

        return opts;
    }

    function spectrum(element, o) {

        var opts = instanceOptions(o, element),
            flat = opts.flat,
            showSelectionPalette = opts.showSelectionPalette,
            localStorageKey = opts.localStorageKey,
            theme = opts.theme,
            callbacks = opts.callbacks,
            resize = throttle(reflow, 10),
            visible = false,
            isDragging = false,
            dragWidth = 0,
            dragHeight = 0,
            dragHelperHeight = 0,
            slideHeight = 0,
            slideWidth = 0,
            alphaWidth = 0,
            alphaSlideHelperWidth = 0,
            slideHelperHeight = 0,
            currentHue = 0,
            currentSaturation = 0,
            currentValue = 0,
            currentAlpha = 1,
            palette = [],
            paletteArray = [],
            paletteLookup = {},
            selectionPalette = opts.selectionPalette.slice(0),
            maxSelectionSize = opts.maxSelectionSize,
            draggingClass = "sp-dragging",
            shiftMovementDirection = null;

        var doc = element.ownerDocument,
            body = doc.body,
            boundElement = $(element),
            disabled = false,
            container = $(markup, doc).addClass(theme),
            pickerContainer = container.find(".sp-picker-container"),
            dragger = container.find(".sp-color"),
            dragHelper = container.find(".sp-dragger"),
            slider = container.find(".sp-hue"),
            slideHelper = container.find(".sp-slider"),
            alphaSliderInner = container.find(".sp-alpha-inner"),
            alphaSlider = container.find(".sp-alpha"),
            alphaSlideHelper = container.find(".sp-alpha-handle"),
            textInput = container.find(".sp-input"),
            paletteContainer = container.find(".sp-palette"),
            initialColorContainer = container.find(".sp-initial"),
            cancelButton = container.find(".sp-cancel"),
            clearButton = container.find(".sp-clear"),
            chooseButton = container.find(".sp-choose"),
            toggleButton = container.find(".sp-palette-toggle"),
            isInput = boundElement.is("input"),
            isInputTypeColor = isInput && boundElement.attr("type") === "color" && inputTypeColorSupport(),
            shouldReplace = isInput && !flat,
            replacer = (shouldReplace) ? $(replaceInput).addClass(theme).addClass(opts.className).addClass(opts.replacerClassName) : $([]),
            offsetElement = (shouldReplace) ? replacer : boundElement,
            previewElement = replacer.find(".sp-preview-inner"),
            initialColor = opts.color || (isInput && boundElement.val()),
            colorOnShow = false,
            currentPreferredFormat = opts.preferredFormat,
            clickoutFiresChange = !opts.showButtons || opts.clickoutFiresChange,
            isEmpty = !initialColor,
            allowEmpty = opts.allowEmpty && !isInputTypeColor;

        function applyOptions() {

            if (opts.showPaletteOnly) {
                opts.showPalette = true;
            }

            toggleButton.text(opts.showPaletteOnly ? opts.togglePaletteMoreText : opts.togglePaletteLessText);

            if (opts.palette) {
                palette = opts.palette.slice(0);
                paletteArray = $.isArray(palette[0]) ? palette : [palette];
                paletteLookup = {};
                for (var i = 0; i < paletteArray.length; i++) {
                    for (var j = 0; j < paletteArray[i].length; j++) {
                        var rgb = tinycolor(paletteArray[i][j]).toRgbString();
                        paletteLookup[rgb] = true;
                    }
                }
            }

            container.toggleClass("sp-flat", flat);
            container.toggleClass("sp-input-disabled", !opts.showInput);
            container.toggleClass("sp-alpha-enabled", opts.showAlpha);
            container.toggleClass("sp-clear-enabled", allowEmpty);
            container.toggleClass("sp-buttons-disabled", !opts.showButtons);
            container.toggleClass("sp-palette-buttons-disabled", !opts.togglePaletteOnly);
            container.toggleClass("sp-palette-disabled", !opts.showPalette);
            container.toggleClass("sp-palette-only", opts.showPaletteOnly);
            container.toggleClass("sp-initial-disabled", !opts.showInitial);
            container.addClass(opts.className).addClass(opts.containerClassName);

            reflow();
        }

        function initialize() {

            if (IE) {
                container.find("*:not(input)").attr("unselectable", "on");
            }

            applyOptions();

            if (shouldReplace) {
                boundElement.after(replacer).hide();
            }

            if (!allowEmpty) {
                clearButton.hide();
            }

            if (flat) {
                boundElement.after(container).hide();
            }
            else {

                var appendTo = opts.appendTo === "parent" ? boundElement.parent() : $(opts.appendTo);
                if (appendTo.length !== 1) {
                    appendTo = $("body");
                }

                appendTo.append(container);
            }

            updateSelectionPaletteFromStorage();

            offsetElement.bind("click.spectrum touchstart.spectrum", function (e) {
                if (!disabled) {
                    toggle();
                }

                e.stopPropagation();

                if (!$(e.target).is("input")) {
                    e.preventDefault();
                }
            });

            if(boundElement.is(":disabled") || (opts.disabled === true)) {
                disable();
            }

            // Prevent clicks from bubbling up to document.  This would cause it to be hidden.
            container.click(stopPropagation);

            // Handle user typed input
            textInput.change(setFromTextInput);
            textInput.bind("paste", function () {
                setTimeout(setFromTextInput, 1);
            });
            textInput.keydown(function (e) { if (e.keyCode == 13) { setFromTextInput(); } });

            cancelButton.text(opts.cancelText);
            cancelButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();
                revert();
                hide();
            });

            clearButton.attr("title", opts.clearText);
            clearButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();
                isEmpty = true;
                move();

                if(flat) {
                    //for the flat style, this is a change event
                    updateOriginalInput(true);
                }
            });

            chooseButton.text(opts.chooseText);
            chooseButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();

                if (IE && textInput.is(":focus")) {
                    textInput.trigger('change');
                }

                if (isValid()) {
                    updateOriginalInput(true);
                    hide();
                }
            });

            toggleButton.text(opts.showPaletteOnly ? opts.togglePaletteMoreText : opts.togglePaletteLessText);
            toggleButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();

                opts.showPaletteOnly = !opts.showPaletteOnly;

                // To make sure the Picker area is drawn on the right, next to the
                // Palette area (and not below the palette), first move the Palette
                // to the left to make space for the picker, plus 5px extra.
                // The 'applyOptions' function puts the whole container back into place
                // and takes care of the button-text and the sp-palette-only CSS class.
                if (!opts.showPaletteOnly && !flat) {
                    container.css('left', '-=' + (pickerContainer.outerWidth(true) + 5));
                }
                applyOptions();
            });

            draggable(alphaSlider, function (dragX, dragY, e) {
                currentAlpha = (dragX / alphaWidth);
                isEmpty = false;
                if (e.shiftKey) {
                    currentAlpha = Math.round(currentAlpha * 10) / 10;
                }

                move();
            }, dragStart, dragStop);

            draggable(slider, function (dragX, dragY) {
                currentHue = parseFloat(dragY / slideHeight);
                isEmpty = false;
                if (!opts.showAlpha) {
                    currentAlpha = 1;
                }
                move();
            }, dragStart, dragStop);

            draggable(dragger, function (dragX, dragY, e) {

                // shift+drag should snap the movement to either the x or y axis.
                if (!e.shiftKey) {
                    shiftMovementDirection = null;
                }
                else if (!shiftMovementDirection) {
                    var oldDragX = currentSaturation * dragWidth;
                    var oldDragY = dragHeight - (currentValue * dragHeight);
                    var furtherFromX = Math.abs(dragX - oldDragX) > Math.abs(dragY - oldDragY);

                    shiftMovementDirection = furtherFromX ? "x" : "y";
                }

                var setSaturation = !shiftMovementDirection || shiftMovementDirection === "x";
                var setValue = !shiftMovementDirection || shiftMovementDirection === "y";

                if (setSaturation) {
                    currentSaturation = parseFloat(dragX / dragWidth);
                }
                if (setValue) {
                    currentValue = parseFloat((dragHeight - dragY) / dragHeight);
                }

                isEmpty = false;
                if (!opts.showAlpha) {
                    currentAlpha = 1;
                }

                move();

            }, dragStart, dragStop);

            if (!!initialColor) {
                set(initialColor);

                // In case color was black - update the preview UI and set the format
                // since the set function will not run (default color is black).
                updateUI();
                currentPreferredFormat = opts.preferredFormat || tinycolor(initialColor).format;

                addColorToSelectionPalette(initialColor);
            }
            else {
                updateUI();
            }

            if (flat) {
                show();
            }

            function paletteElementClick(e) {
                if (e.data && e.data.ignore) {
                    set($(e.target).closest(".sp-thumb-el").data("color"));
                    move();
                }
                else {
                    set($(e.target).closest(".sp-thumb-el").data("color"));
                    move();
                    updateOriginalInput(true);
                    if (opts.hideAfterPaletteSelect) {
                      hide();
                    }
                }

                return false;
            }

            var paletteEvent = IE ? "mousedown.spectrum" : "click.spectrum touchstart.spectrum";
            paletteContainer.delegate(".sp-thumb-el", paletteEvent, paletteElementClick);
            initialColorContainer.delegate(".sp-thumb-el:nth-child(1)", paletteEvent, { ignore: true }, paletteElementClick);
        }

        function updateSelectionPaletteFromStorage() {

            if (localStorageKey && window.localStorage) {

                // Migrate old palettes over to new format.  May want to remove this eventually.
                try {
                    var oldPalette = window.localStorage[localStorageKey].split(",#");
                    if (oldPalette.length > 1) {
                        delete window.localStorage[localStorageKey];
                        $.each(oldPalette, function(i, c) {
                             addColorToSelectionPalette(c);
                        });
                    }
                }
                catch(e) { }

                try {
                    selectionPalette = window.localStorage[localStorageKey].split(";");
                }
                catch (e) { }
            }
        }

        function addColorToSelectionPalette(color) {
            if (showSelectionPalette) {
                var rgb = tinycolor(color).toRgbString();
                if (!paletteLookup[rgb] && $.inArray(rgb, selectionPalette) === -1) {
                    selectionPalette.push(rgb);
                    while(selectionPalette.length > maxSelectionSize) {
                        selectionPalette.shift();
                    }
                }

                if (localStorageKey && window.localStorage) {
                    try {
                        window.localStorage[localStorageKey] = selectionPalette.join(";");
                    }
                    catch(e) { }
                }
            }
        }

        function getUniqueSelectionPalette() {
            var unique = [];
            if (opts.showPalette) {
                for (var i = 0; i < selectionPalette.length; i++) {
                    var rgb = tinycolor(selectionPalette[i]).toRgbString();

                    if (!paletteLookup[rgb]) {
                        unique.push(selectionPalette[i]);
                    }
                }
            }

            return unique.reverse().slice(0, opts.maxSelectionSize);
        }

        function drawPalette() {

            var currentColor = get();

            var html = $.map(paletteArray, function (palette, i) {
                return paletteTemplate(palette, currentColor, "sp-palette-row sp-palette-row-" + i, opts);
            });

            updateSelectionPaletteFromStorage();

            if (selectionPalette) {
                html.push(paletteTemplate(getUniqueSelectionPalette(), currentColor, "sp-palette-row sp-palette-row-selection", opts));
            }

            paletteContainer.html(html.join(""));
        }

        function drawInitial() {
            if (opts.showInitial) {
                var initial = colorOnShow;
                var current = get();
                initialColorContainer.html(paletteTemplate([initial, current], current, "sp-palette-row-initial", opts));
            }
        }

        function dragStart() {
            if (dragHeight <= 0 || dragWidth <= 0 || slideHeight <= 0) {
                reflow();
            }
            isDragging = true;
            container.addClass(draggingClass);
            shiftMovementDirection = null;
            boundElement.trigger('dragstart.spectrum', [ get() ]);
        }

        function dragStop() {
            isDragging = false;
            container.removeClass(draggingClass);
            boundElement.trigger('dragstop.spectrum', [ get() ]);
        }

        function setFromTextInput() {

            var value = textInput.val();

            if ((value === null || value === "") && allowEmpty) {
                set(null);
                updateOriginalInput(true);
            }
            else {
                var tiny = tinycolor(value);
                if (tiny.isValid()) {
                    set(tiny);
                    updateOriginalInput(true);
                }
                else {
                    textInput.addClass("sp-validation-error");
                }
            }
        }

        function toggle() {
            if (visible) {
                hide();
            }
            else {
                show();
            }
        }

        function show() {
            var event = $.Event('beforeShow.spectrum');

            if (visible) {
                reflow();
                return;
            }

            boundElement.trigger(event, [ get() ]);

            if (callbacks.beforeShow(get()) === false || event.isDefaultPrevented()) {
                return;
            }

            hideAll();
            visible = true;

            $(doc).bind("keydown.spectrum", onkeydown);
            $(doc).bind("click.spectrum", clickout);
            $(window).bind("resize.spectrum", resize);
            replacer.addClass("sp-active");
            container.removeClass("sp-hidden");

            reflow();
            updateUI();

            colorOnShow = get();

            drawInitial();
            callbacks.show(colorOnShow);
            boundElement.trigger('show.spectrum', [ colorOnShow ]);
        }

        function onkeydown(e) {
            // Close on ESC
            if (e.keyCode === 27) {
                hide();
            }
        }

        function clickout(e) {
            // Return on right click.
            if (e.button == 2) { return; }

            // If a drag event was happening during the mouseup, don't hide
            // on click.
            if (isDragging) { return; }

            if (clickoutFiresChange) {
                updateOriginalInput(true);
            }
            else {
                revert();
            }
            hide();
        }

        function hide() {
            // Return if hiding is unnecessary
            if (!visible || flat) { return; }
            visible = false;

            $(doc).unbind("keydown.spectrum", onkeydown);
            $(doc).unbind("click.spectrum", clickout);
            $(window).unbind("resize.spectrum", resize);

            replacer.removeClass("sp-active");
            container.addClass("sp-hidden");

            callbacks.hide(get());
            boundElement.trigger('hide.spectrum', [ get() ]);
        }

        function revert() {
            set(colorOnShow, true);
        }

        function set(color, ignoreFormatChange) {
            if (tinycolor.equals(color, get())) {
                // Update UI just in case a validation error needs
                // to be cleared.
                updateUI();
                return;
            }

            var newColor, newHsv;
            if (!color && allowEmpty) {
                isEmpty = true;
            } else {
                isEmpty = false;
                newColor = tinycolor(color);
                newHsv = newColor.toHsv();

                currentHue = (newHsv.h % 360) / 360;
                currentSaturation = newHsv.s;
                currentValue = newHsv.v;
                currentAlpha = newHsv.a;
            }
            updateUI();

            if (newColor && newColor.isValid() && !ignoreFormatChange) {
                currentPreferredFormat = opts.preferredFormat || newColor.getFormat();
            }
        }

        function get(opts) {
            opts = opts || { };

            if (allowEmpty && isEmpty) {
                return null;
            }

            return tinycolor.fromRatio({
                h: currentHue,
                s: currentSaturation,
                v: currentValue,
                a: Math.round(currentAlpha * 100) / 100
            }, { format: opts.format || currentPreferredFormat });
        }

        function isValid() {
            return !textInput.hasClass("sp-validation-error");
        }

        function move() {
            updateUI();

            callbacks.move(get());
            boundElement.trigger('move.spectrum', [ get() ]);
        }

        function updateUI() {

            textInput.removeClass("sp-validation-error");

            updateHelperLocations();

            // Update dragger background color (gradients take care of saturation and value).
            var flatColor = tinycolor.fromRatio({ h: currentHue, s: 1, v: 1 });
            dragger.css("background-color", flatColor.toHexString());

            // Get a format that alpha will be included in (hex and names ignore alpha)
            var format = currentPreferredFormat;
            if (currentAlpha < 1 && !(currentAlpha === 0 && format === "name")) {
                if (format === "hex" || format === "hex3" || format === "hex6" || format === "name") {
                    format = "rgb";
                }
            }

            var realColor = get({ format: format }),
                displayColor = '';

             //reset background info for preview element
            previewElement.removeClass("sp-clear-display");
            previewElement.css('background-color', 'transparent');

            if (!realColor && allowEmpty) {
                // Update the replaced elements background with icon indicating no color selection
                previewElement.addClass("sp-clear-display");
            }
            else {
                var realHex = realColor.toHexString(),
                    realRgb = realColor.toRgbString();

                // Update the replaced elements background color (with actual selected color)
                if (rgbaSupport || realColor.alpha === 1) {
                    previewElement.css("background-color", realRgb);
                }
                else {
                    previewElement.css("background-color", "transparent");
                    previewElement.css("filter", realColor.toFilter());
                }

                if (opts.showAlpha) {
                    var rgb = realColor.toRgb();
                    rgb.a = 0;
                    var realAlpha = tinycolor(rgb).toRgbString();
                    var gradient = "linear-gradient(left, " + realAlpha + ", " + realHex + ")";

                    if (IE) {
                        alphaSliderInner.css("filter", tinycolor(realAlpha).toFilter({ gradientType: 1 }, realHex));
                    }
                    else {
                        alphaSliderInner.css("background", "-webkit-" + gradient);
                        alphaSliderInner.css("background", "-moz-" + gradient);
                        alphaSliderInner.css("background", "-ms-" + gradient);
                        // Use current syntax gradient on unprefixed property.
                        alphaSliderInner.css("background",
                            "linear-gradient(to right, " + realAlpha + ", " + realHex + ")");
                    }
                }

                displayColor = realColor.toString(format);
            }

            // Update the text entry input as it changes happen
            if (opts.showInput) {
                textInput.val(displayColor);
            }

            if (opts.showPalette) {
                drawPalette();
            }

            drawInitial();
        }

        function updateHelperLocations() {
            var s = currentSaturation;
            var v = currentValue;

            if(allowEmpty && isEmpty) {
                //if selected color is empty, hide the helpers
                alphaSlideHelper.hide();
                slideHelper.hide();
                dragHelper.hide();
            }
            else {
                //make sure helpers are visible
                alphaSlideHelper.show();
                slideHelper.show();
                dragHelper.show();

                // Where to show the little circle in that displays your current selected color
                var dragX = s * dragWidth;
                var dragY = dragHeight - (v * dragHeight);
                dragX = Math.max(
                    -dragHelperHeight,
                    Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight)
                );
                dragY = Math.max(
                    -dragHelperHeight,
                    Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight)
                );
                dragHelper.css({
                    "top": dragY + "px",
                    "left": dragX + "px"
                });

                var alphaX = currentAlpha * alphaWidth;
                alphaSlideHelper.css({
                    "left": (alphaX - (alphaSlideHelperWidth / 2)) + "px"
                });

                // Where to show the bar that displays your current selected hue
                var slideY = (currentHue) * slideHeight;
                slideHelper.css({
                    "top": (slideY - slideHelperHeight) + "px"
                });
            }
        }

        function updateOriginalInput(fireCallback) {
            var color = get(),
                displayColor = '',
                hasChanged = !tinycolor.equals(color, colorOnShow);

            if (color) {
                displayColor = color.toString(currentPreferredFormat);
                // Update the selection palette with the current color
                addColorToSelectionPalette(color);
            }

            if (isInput) {
                boundElement.val(displayColor);
            }

            if (fireCallback && hasChanged) {
                callbacks.change(color);
                boundElement.trigger('change', [ color ]);
            }
        }

        function reflow() {
            if (!visible) {
                return; // Calculations would be useless and wouldn't be reliable anyways
            }
            dragWidth = dragger.width();
            dragHeight = dragger.height();
            dragHelperHeight = dragHelper.height();
            slideWidth = slider.width();
            slideHeight = slider.height();
            slideHelperHeight = slideHelper.height();
            alphaWidth = alphaSlider.width();
            alphaSlideHelperWidth = alphaSlideHelper.width();

            if (!flat) {
                container.css("position", "absolute");
                if (opts.offset) {
                    container.offset(opts.offset);
                } else {
                    container.offset(getOffset(container, offsetElement));
                }
            }

            updateHelperLocations();

            if (opts.showPalette) {
                drawPalette();
            }

            boundElement.trigger('reflow.spectrum');
        }

        function destroy() {
            boundElement.show();
            offsetElement.unbind("click.spectrum touchstart.spectrum");
            container.remove();
            replacer.remove();
            spectrums[spect.id] = null;
        }

        function option(optionName, optionValue) {
            if (optionName === undefined) {
                return $.extend({}, opts);
            }
            if (optionValue === undefined) {
                return opts[optionName];
            }

            opts[optionName] = optionValue;

            if (optionName === "preferredFormat") {
                currentPreferredFormat = opts.preferredFormat;
            }
            applyOptions();
        }

        function enable() {
            disabled = false;
            boundElement.attr("disabled", false);
            offsetElement.removeClass("sp-disabled");
        }

        function disable() {
            hide();
            disabled = true;
            boundElement.attr("disabled", true);
            offsetElement.addClass("sp-disabled");
        }

        function setOffset(coord) {
            opts.offset = coord;
            reflow();
        }

        initialize();

        var spect = {
            show: show,
            hide: hide,
            toggle: toggle,
            reflow: reflow,
            option: option,
            enable: enable,
            disable: disable,
            offset: setOffset,
            set: function (c) {
                set(c);
                updateOriginalInput();
            },
            get: get,
            destroy: destroy,
            container: container
        };

        spect.id = spectrums.push(spect) - 1;

        return spect;
    }

    /**
    * checkOffset - get the offset below/above and left/right element depending on screen position
    * Thanks https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.datepicker.js
    */
    function getOffset(picker, input) {
        var extraY = 0;
        var dpWidth = picker.outerWidth();
        var dpHeight = picker.outerHeight();
        var inputHeight = input.outerHeight();
        var doc = picker[0].ownerDocument;
        var docElem = doc.documentElement;
        var viewWidth = docElem.clientWidth + $(doc).scrollLeft();
        var viewHeight = docElem.clientHeight + $(doc).scrollTop();
        var offset = input.offset();
        offset.top += inputHeight;

        offset.left -=
            Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
            Math.abs(offset.left + dpWidth - viewWidth) : 0);

        offset.top -=
            Math.min(offset.top, ((offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
            Math.abs(dpHeight + inputHeight - extraY) : extraY));

        return offset;
    }

    /**
    * noop - do nothing
    */
    function noop() {

    }

    /**
    * stopPropagation - makes the code only doing this a little easier to read in line
    */
    function stopPropagation(e) {
        e.stopPropagation();
    }

    /**
    * Create a function bound to a given object
    * Thanks to underscore.js
    */
    function bind(func, obj) {
        var slice = Array.prototype.slice;
        var args = slice.call(arguments, 2);
        return function () {
            return func.apply(obj, args.concat(slice.call(arguments)));
        };
    }

    /**
    * Lightweight drag helper.  Handles containment within the element, so that
    * when dragging, the x is within [0,element.width] and y is within [0,element.height]
    */
    function draggable(element, onmove, onstart, onstop) {
        onmove = onmove || function () { };
        onstart = onstart || function () { };
        onstop = onstop || function () { };
        var doc = document;
        var dragging = false;
        var offset = {};
        var maxHeight = 0;
        var maxWidth = 0;
        var hasTouch = ('ontouchstart' in window);

        var duringDragEvents = {};
        duringDragEvents["selectstart"] = prevent;
        duringDragEvents["dragstart"] = prevent;
        duringDragEvents["touchmove mousemove"] = move;
        duringDragEvents["touchend mouseup"] = stop;

        function prevent(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.returnValue = false;
        }

        function move(e) {
            if (dragging) {
                // Mouseup happened outside of window
                if (IE && doc.documentMode < 9 && !e.button) {
                    return stop();
                }

                var t0 = e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0];
                var pageX = t0 && t0.pageX || e.pageX;
                var pageY = t0 && t0.pageY || e.pageY;

                var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

                if (hasTouch) {
                    // Stop scrolling in iOS
                    prevent(e);
                }

                onmove.apply(element, [dragX, dragY, e]);
            }
        }

        function start(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);

            if (!rightclick && !dragging) {
                if (onstart.apply(element, arguments) !== false) {
                    dragging = true;
                    maxHeight = $(element).height();
                    maxWidth = $(element).width();
                    offset = $(element).offset();

                    $(doc).bind(duringDragEvents);
                    $(doc.body).addClass("sp-dragging");

                    move(e);

                    prevent(e);
                }
            }
        }

        function stop() {
            if (dragging) {
                $(doc).unbind(duringDragEvents);
                $(doc.body).removeClass("sp-dragging");

                // Wait a tick before notifying observers to allow the click event
                // to fire in Chrome.
                setTimeout(function() {
                    onstop.apply(element, arguments);
                }, 0);
            }
            dragging = false;
        }

        $(element).bind("touchstart mousedown", start);
    }

    function throttle(func, wait, debounce) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var throttler = function () {
                timeout = null;
                func.apply(context, args);
            };
            if (debounce) clearTimeout(timeout);
            if (debounce || !timeout) timeout = setTimeout(throttler, wait);
        };
    }

    function inputTypeColorSupport() {
        return $.fn.spectrum.inputTypeColorSupport();
    }

    /**
    * Define a jQuery plugin
    */
    var dataID = "spectrum.id";
    $.fn.spectrum = function (opts, extra) {

        if (typeof opts == "string") {

            var returnValue = this;
            var args = Array.prototype.slice.call( arguments, 1 );

            this.each(function () {
                var spect = spectrums[$(this).data(dataID)];
                if (spect) {
                    var method = spect[opts];
                    if (!method) {
                        throw new Error( "Spectrum: no such method: '" + opts + "'" );
                    }

                    if (opts == "get") {
                        returnValue = spect.get();
                    }
                    else if (opts == "container") {
                        returnValue = spect.container;
                    }
                    else if (opts == "option") {
                        returnValue = spect.option.apply(spect, args);
                    }
                    else if (opts == "destroy") {
                        spect.destroy();
                        $(this).removeData(dataID);
                    }
                    else {
                        method.apply(spect, args);
                    }
                }
            });

            return returnValue;
        }

        // Initializing a new instance of spectrum
        return this.spectrum("destroy").each(function () {
            var options = $.extend({}, opts, $(this).data());
            var spect = spectrum(this, options);
            $(this).data(dataID, spect.id);
        });
    };

    $.fn.spectrum.load = true;
    $.fn.spectrum.loadOpts = {};
    $.fn.spectrum.draggable = draggable;
    $.fn.spectrum.defaults = defaultOpts;
    $.fn.spectrum.inputTypeColorSupport = function inputTypeColorSupport() {
        if (typeof inputTypeColorSupport._cachedResult === "undefined") {
            var colorInput = $("<input type='color'/>")[0]; // if color element is supported, value will default to not null
            inputTypeColorSupport._cachedResult = colorInput.type === "color" && colorInput.value !== "";
        }
        return inputTypeColorSupport._cachedResult;
    };

    $.spectrum = { };
    $.spectrum.localization = { };
    $.spectrum.palettes = { };

    $.fn.spectrum.processNativeColorInputs = function () {
        var colorInputs = $("input[type=color]");
        if (colorInputs.length && !inputTypeColorSupport()) {
            colorInputs.spectrum({
                preferredFormat: "hex6"
            });
        }
    };

    // TinyColor v1.1.2
    // https://github.com/bgrins/TinyColor
    // Brian Grinstead, MIT License

    (function() {

    var trimLeft = /^[\s,#]+/,
        trimRight = /\s+$/,
        tinyCounter = 0,
        math = Math,
        mathRound = math.round,
        mathMin = math.min,
        mathMax = math.max,
        mathRandom = math.random;

    var tinycolor = function(color, opts) {

        color = (color) ? color : '';
        opts = opts || { };

        // If input is already a tinycolor, return itself
        if (color instanceof tinycolor) {
           return color;
        }
        // If we are called as a function, call using new instead
        if (!(this instanceof tinycolor)) {
            return new tinycolor(color, opts);
        }

        var rgb = inputToRGB(color);
        this._originalInput = color,
        this._r = rgb.r,
        this._g = rgb.g,
        this._b = rgb.b,
        this._a = rgb.a,
        this._roundA = mathRound(100*this._a) / 100,
        this._format = opts.format || rgb.format;
        this._gradientType = opts.gradientType;

        // Don't let the range of [0,255] come back in [0,1].
        // Potentially lose a little bit of precision here, but will fix issues where
        // .5 gets interpreted as half of the total, instead of half of 1
        // If it was supposed to be 128, this was already taken care of by `inputToRgb`
        if (this._r < 1) { this._r = mathRound(this._r); }
        if (this._g < 1) { this._g = mathRound(this._g); }
        if (this._b < 1) { this._b = mathRound(this._b); }

        this._ok = rgb.ok;
        this._tc_id = tinyCounter++;
    };

    tinycolor.prototype = {
        isDark: function() {
            return this.getBrightness() < 128;
        },
        isLight: function() {
            return !this.isDark();
        },
        isValid: function() {
            return this._ok;
        },
        getOriginalInput: function() {
          return this._originalInput;
        },
        getFormat: function() {
            return this._format;
        },
        getAlpha: function() {
            return this._a;
        },
        getBrightness: function() {
            var rgb = this.toRgb();
            return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        },
        setAlpha: function(value) {
            this._a = boundAlpha(value);
            this._roundA = mathRound(100*this._a) / 100;
            return this;
        },
        toHsv: function() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
        },
        toHsvString: function() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
            return (this._a == 1) ?
              "hsv("  + h + ", " + s + "%, " + v + "%)" :
              "hsva(" + h + ", " + s + "%, " + v + "%, "+ this._roundA + ")";
        },
        toHsl: function() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
        },
        toHslString: function() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
            return (this._a == 1) ?
              "hsl("  + h + ", " + s + "%, " + l + "%)" :
              "hsla(" + h + ", " + s + "%, " + l + "%, "+ this._roundA + ")";
        },
        toHex: function(allow3Char) {
            return rgbToHex(this._r, this._g, this._b, allow3Char);
        },
        toHexString: function(allow3Char) {
            return '#' + this.toHex(allow3Char);
        },
        toHex8: function() {
            return rgbaToHex(this._r, this._g, this._b, this._a);
        },
        toHex8String: function() {
            return '#' + this.toHex8();
        },
        toRgb: function() {
            return { r: mathRound(this._r), g: mathRound(this._g), b: mathRound(this._b), a: this._a };
        },
        toRgbString: function() {
            return (this._a == 1) ?
              "rgb("  + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ")" :
              "rgba(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ", " + this._roundA + ")";
        },
        toPercentageRgb: function() {
            return { r: mathRound(bound01(this._r, 255) * 100) + "%", g: mathRound(bound01(this._g, 255) * 100) + "%", b: mathRound(bound01(this._b, 255) * 100) + "%", a: this._a };
        },
        toPercentageRgbString: function() {
            return (this._a == 1) ?
              "rgb("  + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%)" :
              "rgba(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
        },
        toName: function() {
            if (this._a === 0) {
                return "transparent";
            }

            if (this._a < 1) {
                return false;
            }

            return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
        },
        toFilter: function(secondColor) {
            var hex8String = '#' + rgbaToHex(this._r, this._g, this._b, this._a);
            var secondHex8String = hex8String;
            var gradientType = this._gradientType ? "GradientType = 1, " : "";

            if (secondColor) {
                var s = tinycolor(secondColor);
                secondHex8String = s.toHex8String();
            }

            return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr="+hex8String+",endColorstr="+secondHex8String+")";
        },
        toString: function(format) {
            var formatSet = !!format;
            format = format || this._format;

            var formattedString = false;
            var hasAlpha = this._a < 1 && this._a >= 0;
            var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "name");

            if (needsAlphaFormat) {
                // Special case for "transparent", all other non-alpha formats
                // will return rgba when there is transparency.
                if (format === "name" && this._a === 0) {
                    return this.toName();
                }
                return this.toRgbString();
            }
            if (format === "rgb") {
                formattedString = this.toRgbString();
            }
            if (format === "prgb") {
                formattedString = this.toPercentageRgbString();
            }
            if (format === "hex" || format === "hex6") {
                formattedString = this.toHexString();
            }
            if (format === "hex3") {
                formattedString = this.toHexString(true);
            }
            if (format === "hex8") {
                formattedString = this.toHex8String();
            }
            if (format === "name") {
                formattedString = this.toName();
            }
            if (format === "hsl") {
                formattedString = this.toHslString();
            }
            if (format === "hsv") {
                formattedString = this.toHsvString();
            }

            return formattedString || this.toHexString();
        },

        _applyModification: function(fn, args) {
            var color = fn.apply(null, [this].concat([].slice.call(args)));
            this._r = color._r;
            this._g = color._g;
            this._b = color._b;
            this.setAlpha(color._a);
            return this;
        },
        lighten: function() {
            return this._applyModification(lighten, arguments);
        },
        brighten: function() {
            return this._applyModification(brighten, arguments);
        },
        darken: function() {
            return this._applyModification(darken, arguments);
        },
        desaturate: function() {
            return this._applyModification(desaturate, arguments);
        },
        saturate: function() {
            return this._applyModification(saturate, arguments);
        },
        greyscale: function() {
            return this._applyModification(greyscale, arguments);
        },
        spin: function() {
            return this._applyModification(spin, arguments);
        },

        _applyCombination: function(fn, args) {
            return fn.apply(null, [this].concat([].slice.call(args)));
        },
        analogous: function() {
            return this._applyCombination(analogous, arguments);
        },
        complement: function() {
            return this._applyCombination(complement, arguments);
        },
        monochromatic: function() {
            return this._applyCombination(monochromatic, arguments);
        },
        splitcomplement: function() {
            return this._applyCombination(splitcomplement, arguments);
        },
        triad: function() {
            return this._applyCombination(triad, arguments);
        },
        tetrad: function() {
            return this._applyCombination(tetrad, arguments);
        }
    };

    // If input is an object, force 1 into "1.0" to handle ratios properly
    // String input requires "1.0" as input, so 1 will be treated as 1
    tinycolor.fromRatio = function(color, opts) {
        if (typeof color == "object") {
            var newColor = {};
            for (var i in color) {
                if (color.hasOwnProperty(i)) {
                    if (i === "a") {
                        newColor[i] = color[i];
                    }
                    else {
                        newColor[i] = convertToPercentage(color[i]);
                    }
                }
            }
            color = newColor;
        }

        return tinycolor(color, opts);
    };

    // Given a string or object, convert that input to RGB
    // Possible string inputs:
    //
    //     "red"
    //     "#f00" or "f00"
    //     "#ff0000" or "ff0000"
    //     "#ff000000" or "ff000000"
    //     "rgb 255 0 0" or "rgb (255, 0, 0)"
    //     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
    //     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
    //     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
    //     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
    //     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
    //     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
    //
    function inputToRGB(color) {

        var rgb = { r: 0, g: 0, b: 0 };
        var a = 1;
        var ok = false;
        var format = false;

        if (typeof color == "string") {
            color = stringInputToObject(color);
        }

        if (typeof color == "object") {
            if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
                rgb = rgbToRgb(color.r, color.g, color.b);
                ok = true;
                format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
            }
            else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
                color.s = convertToPercentage(color.s);
                color.v = convertToPercentage(color.v);
                rgb = hsvToRgb(color.h, color.s, color.v);
                ok = true;
                format = "hsv";
            }
            else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
                color.s = convertToPercentage(color.s);
                color.l = convertToPercentage(color.l);
                rgb = hslToRgb(color.h, color.s, color.l);
                ok = true;
                format = "hsl";
            }

            if (color.hasOwnProperty("a")) {
                a = color.a;
            }
        }

        a = boundAlpha(a);

        return {
            ok: ok,
            format: color.format || format,
            r: mathMin(255, mathMax(rgb.r, 0)),
            g: mathMin(255, mathMax(rgb.g, 0)),
            b: mathMin(255, mathMax(rgb.b, 0)),
            a: a
        };
    }


    // Conversion Functions
    // --------------------

    // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
    // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

    // `rgbToRgb`
    // Handle bounds / percentage checking to conform to CSS color spec
    // <http://www.w3.org/TR/css3-color/>
    // *Assumes:* r, g, b in [0, 255] or [0, 1]
    // *Returns:* { r, g, b } in [0, 255]
    function rgbToRgb(r, g, b){
        return {
            r: bound01(r, 255) * 255,
            g: bound01(g, 255) * 255,
            b: bound01(b, 255) * 255
        };
    }

    // `rgbToHsl`
    // Converts an RGB color value to HSL.
    // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
    // *Returns:* { h, s, l } in [0,1]
    function rgbToHsl(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max == min) {
            h = s = 0; // achromatic
        }
        else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return { h: h, s: s, l: l };
    }

    // `hslToRgb`
    // Converts an HSL color value to RGB.
    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
    // *Returns:* { r, g, b } in the set [0, 255]
    function hslToRgb(h, s, l) {
        var r, g, b;

        h = bound01(h, 360);
        s = bound01(s, 100);
        l = bound01(l, 100);

        function hue2rgb(p, q, t) {
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        if(s === 0) {
            r = g = b = l; // achromatic
        }
        else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

    // `rgbToHsv`
    // Converts an RGB color value to HSV
    // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
    // *Returns:* { h, s, v } in [0,1]
    function rgbToHsv(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max === 0 ? 0 : d / max;

        if(max == min) {
            h = 0; // achromatic
        }
        else {
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h, s: s, v: v };
    }

    // `hsvToRgb`
    // Converts an HSV color value to RGB.
    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
    // *Returns:* { r, g, b } in the set [0, 255]
     function hsvToRgb(h, s, v) {

        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);

        var i = math.floor(h),
            f = h - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            mod = i % 6,
            r = [v, q, p, p, t, v][mod],
            g = [t, v, v, q, p, p][mod],
            b = [p, p, t, v, v, q][mod];

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

    // `rgbToHex`
    // Converts an RGB color to hex
    // Assumes r, g, and b are contained in the set [0, 255]
    // Returns a 3 or 6 character hex
    function rgbToHex(r, g, b, allow3Char) {

        var hex = [
            pad2(mathRound(r).toString(16)),
            pad2(mathRound(g).toString(16)),
            pad2(mathRound(b).toString(16))
        ];

        // Return a 3 character hex if possible
        if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
            return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
        }

        return hex.join("");
    }
        // `rgbaToHex`
        // Converts an RGBA color plus alpha transparency to hex
        // Assumes r, g, b and a are contained in the set [0, 255]
        // Returns an 8 character hex
        function rgbaToHex(r, g, b, a) {

            var hex = [
                pad2(convertDecimalToHex(a)),
                pad2(mathRound(r).toString(16)),
                pad2(mathRound(g).toString(16)),
                pad2(mathRound(b).toString(16))
            ];

            return hex.join("");
        }

    // `equals`
    // Can be called with any tinycolor input
    tinycolor.equals = function (color1, color2) {
        if (!color1 || !color2) { return false; }
        return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
    };
    tinycolor.random = function() {
        return tinycolor.fromRatio({
            r: mathRandom(),
            g: mathRandom(),
            b: mathRandom()
        });
    };


    // Modification Functions
    // ----------------------
    // Thanks to less.js for some of the basics here
    // <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

    function desaturate(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.s -= amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    }

    function saturate(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.s += amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    }

    function greyscale(color) {
        return tinycolor(color).desaturate(100);
    }

    function lighten (color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.l += amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    }

    function brighten(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var rgb = tinycolor(color).toRgb();
        rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * - (amount / 100))));
        rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * - (amount / 100))));
        rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * - (amount / 100))));
        return tinycolor(rgb);
    }

    function darken (color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.l -= amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    }

    // Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
    // Values outside of this range will be wrapped into this range.
    function spin(color, amount) {
        var hsl = tinycolor(color).toHsl();
        var hue = (mathRound(hsl.h) + amount) % 360;
        hsl.h = hue < 0 ? 360 + hue : hue;
        return tinycolor(hsl);
    }

    // Combination Functions
    // ---------------------
    // Thanks to jQuery xColor for some of the ideas behind these
    // <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

    function complement(color) {
        var hsl = tinycolor(color).toHsl();
        hsl.h = (hsl.h + 180) % 360;
        return tinycolor(hsl);
    }

    function triad(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
        ];
    }

    function tetrad(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
        ];
    }

    function splitcomplement(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
            tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
        ];
    }

    function analogous(color, results, slices) {
        results = results || 6;
        slices = slices || 30;

        var hsl = tinycolor(color).toHsl();
        var part = 360 / slices;
        var ret = [tinycolor(color)];

        for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
            hsl.h = (hsl.h + part) % 360;
            ret.push(tinycolor(hsl));
        }
        return ret;
    }

    function monochromatic(color, results) {
        results = results || 6;
        var hsv = tinycolor(color).toHsv();
        var h = hsv.h, s = hsv.s, v = hsv.v;
        var ret = [];
        var modification = 1 / results;

        while (results--) {
            ret.push(tinycolor({ h: h, s: s, v: v}));
            v = (v + modification) % 1;
        }

        return ret;
    }

    // Utility Functions
    // ---------------------

    tinycolor.mix = function(color1, color2, amount) {
        amount = (amount === 0) ? 0 : (amount || 50);

        var rgb1 = tinycolor(color1).toRgb();
        var rgb2 = tinycolor(color2).toRgb();

        var p = amount / 100;
        var w = p * 2 - 1;
        var a = rgb2.a - rgb1.a;

        var w1;

        if (w * a == -1) {
            w1 = w;
        } else {
            w1 = (w + a) / (1 + w * a);
        }

        w1 = (w1 + 1) / 2;

        var w2 = 1 - w1;

        var rgba = {
            r: rgb2.r * w1 + rgb1.r * w2,
            g: rgb2.g * w1 + rgb1.g * w2,
            b: rgb2.b * w1 + rgb1.b * w2,
            a: rgb2.a * p  + rgb1.a * (1 - p)
        };

        return tinycolor(rgba);
    };


    // Readability Functions
    // ---------------------
    // <http://www.w3.org/TR/AERT#color-contrast>

    // `readability`
    // Analyze the 2 colors and returns an object with the following properties:
    //    `brightness`: difference in brightness between the two colors
    //    `color`: difference in color/hue between the two colors
    tinycolor.readability = function(color1, color2) {
        var c1 = tinycolor(color1);
        var c2 = tinycolor(color2);
        var rgb1 = c1.toRgb();
        var rgb2 = c2.toRgb();
        var brightnessA = c1.getBrightness();
        var brightnessB = c2.getBrightness();
        var colorDiff = (
            Math.max(rgb1.r, rgb2.r) - Math.min(rgb1.r, rgb2.r) +
            Math.max(rgb1.g, rgb2.g) - Math.min(rgb1.g, rgb2.g) +
            Math.max(rgb1.b, rgb2.b) - Math.min(rgb1.b, rgb2.b)
        );

        return {
            brightness: Math.abs(brightnessA - brightnessB),
            color: colorDiff
        };
    };

    // `readable`
    // http://www.w3.org/TR/AERT#color-contrast
    // Ensure that foreground and background color combinations provide sufficient contrast.
    // *Example*
    //    tinycolor.isReadable("#000", "#111") => false
    tinycolor.isReadable = function(color1, color2) {
        var readability = tinycolor.readability(color1, color2);
        return readability.brightness > 125 && readability.color > 500;
    };

    // `mostReadable`
    // Given a base color and a list of possible foreground or background
    // colors for that base, returns the most readable color.
    // *Example*
    //    tinycolor.mostReadable("#123", ["#fff", "#000"]) => "#000"
    tinycolor.mostReadable = function(baseColor, colorList) {
        var bestColor = null;
        var bestScore = 0;
        var bestIsReadable = false;
        for (var i=0; i < colorList.length; i++) {

            // We normalize both around the "acceptable" breaking point,
            // but rank brightness constrast higher than hue.

            var readability = tinycolor.readability(baseColor, colorList[i]);
            var readable = readability.brightness > 125 && readability.color > 500;
            var score = 3 * (readability.brightness / 125) + (readability.color / 500);

            if ((readable && ! bestIsReadable) ||
                (readable && bestIsReadable && score > bestScore) ||
                ((! readable) && (! bestIsReadable) && score > bestScore)) {
                bestIsReadable = readable;
                bestScore = score;
                bestColor = tinycolor(colorList[i]);
            }
        }
        return bestColor;
    };


    // Big List of Colors
    // ------------------
    // <http://www.w3.org/TR/css3-color/#svg-color>
    var names = tinycolor.names = {
        aliceblue: "f0f8ff",
        antiquewhite: "faebd7",
        aqua: "0ff",
        aquamarine: "7fffd4",
        azure: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "000",
        blanchedalmond: "ffebcd",
        blue: "00f",
        blueviolet: "8a2be2",
        brown: "a52a2a",
        burlywood: "deb887",
        burntsienna: "ea7e5d",
        cadetblue: "5f9ea0",
        chartreuse: "7fff00",
        chocolate: "d2691e",
        coral: "ff7f50",
        cornflowerblue: "6495ed",
        cornsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "0ff",
        darkblue: "00008b",
        darkcyan: "008b8b",
        darkgoldenrod: "b8860b",
        darkgray: "a9a9a9",
        darkgreen: "006400",
        darkgrey: "a9a9a9",
        darkkhaki: "bdb76b",
        darkmagenta: "8b008b",
        darkolivegreen: "556b2f",
        darkorange: "ff8c00",
        darkorchid: "9932cc",
        darkred: "8b0000",
        darksalmon: "e9967a",
        darkseagreen: "8fbc8f",
        darkslateblue: "483d8b",
        darkslategray: "2f4f4f",
        darkslategrey: "2f4f4f",
        darkturquoise: "00ced1",
        darkviolet: "9400d3",
        deeppink: "ff1493",
        deepskyblue: "00bfff",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1e90ff",
        firebrick: "b22222",
        floralwhite: "fffaf0",
        forestgreen: "228b22",
        fuchsia: "f0f",
        gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff",
        gold: "ffd700",
        goldenrod: "daa520",
        gray: "808080",
        green: "008000",
        greenyellow: "adff2f",
        grey: "808080",
        honeydew: "f0fff0",
        hotpink: "ff69b4",
        indianred: "cd5c5c",
        indigo: "4b0082",
        ivory: "fffff0",
        khaki: "f0e68c",
        lavender: "e6e6fa",
        lavenderblush: "fff0f5",
        lawngreen: "7cfc00",
        lemonchiffon: "fffacd",
        lightblue: "add8e6",
        lightcoral: "f08080",
        lightcyan: "e0ffff",
        lightgoldenrodyellow: "fafad2",
        lightgray: "d3d3d3",
        lightgreen: "90ee90",
        lightgrey: "d3d3d3",
        lightpink: "ffb6c1",
        lightsalmon: "ffa07a",
        lightseagreen: "20b2aa",
        lightskyblue: "87cefa",
        lightslategray: "789",
        lightslategrey: "789",
        lightsteelblue: "b0c4de",
        lightyellow: "ffffe0",
        lime: "0f0",
        limegreen: "32cd32",
        linen: "faf0e6",
        magenta: "f0f",
        maroon: "800000",
        mediumaquamarine: "66cdaa",
        mediumblue: "0000cd",
        mediumorchid: "ba55d3",
        mediumpurple: "9370db",
        mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee",
        mediumspringgreen: "00fa9a",
        mediumturquoise: "48d1cc",
        mediumvioletred: "c71585",
        midnightblue: "191970",
        mintcream: "f5fffa",
        mistyrose: "ffe4e1",
        moccasin: "ffe4b5",
        navajowhite: "ffdead",
        navy: "000080",
        oldlace: "fdf5e6",
        olive: "808000",
        olivedrab: "6b8e23",
        orange: "ffa500",
        orangered: "ff4500",
        orchid: "da70d6",
        palegoldenrod: "eee8aa",
        palegreen: "98fb98",
        paleturquoise: "afeeee",
        palevioletred: "db7093",
        papayawhip: "ffefd5",
        peachpuff: "ffdab9",
        peru: "cd853f",
        pink: "ffc0cb",
        plum: "dda0dd",
        powderblue: "b0e0e6",
        purple: "800080",
        rebeccapurple: "663399",
        red: "f00",
        rosybrown: "bc8f8f",
        royalblue: "4169e1",
        saddlebrown: "8b4513",
        salmon: "fa8072",
        sandybrown: "f4a460",
        seagreen: "2e8b57",
        seashell: "fff5ee",
        sienna: "a0522d",
        silver: "c0c0c0",
        skyblue: "87ceeb",
        slateblue: "6a5acd",
        slategray: "708090",
        slategrey: "708090",
        snow: "fffafa",
        springgreen: "00ff7f",
        steelblue: "4682b4",
        tan: "d2b48c",
        teal: "008080",
        thistle: "d8bfd8",
        tomato: "ff6347",
        turquoise: "40e0d0",
        violet: "ee82ee",
        wheat: "f5deb3",
        white: "fff",
        whitesmoke: "f5f5f5",
        yellow: "ff0",
        yellowgreen: "9acd32"
    };

    // Make it easy to access colors via `hexNames[hex]`
    var hexNames = tinycolor.hexNames = flip(names);


    // Utilities
    // ---------

    // `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
    function flip(o) {
        var flipped = { };
        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                flipped[o[i]] = i;
            }
        }
        return flipped;
    }

    // Return a valid alpha value [0,1] with all invalid values being set to 1
    function boundAlpha(a) {
        a = parseFloat(a);

        if (isNaN(a) || a < 0 || a > 1) {
            a = 1;
        }

        return a;
    }

    // Take input from [0, n] and return it as [0, 1]
    function bound01(n, max) {
        if (isOnePointZero(n)) { n = "100%"; }

        var processPercent = isPercentage(n);
        n = mathMin(max, mathMax(0, parseFloat(n)));

        // Automatically convert percentage into number
        if (processPercent) {
            n = parseInt(n * max, 10) / 100;
        }

        // Handle floating point rounding errors
        if ((math.abs(n - max) < 0.000001)) {
            return 1;
        }

        // Convert into [0, 1] range if it isn't already
        return (n % max) / parseFloat(max);
    }

    // Force a number between 0 and 1
    function clamp01(val) {
        return mathMin(1, mathMax(0, val));
    }

    // Parse a base-16 hex value into a base-10 integer
    function parseIntFromHex(val) {
        return parseInt(val, 16);
    }

    // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
    // <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
    function isOnePointZero(n) {
        return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
    }

    // Check to see if string passed in is a percentage
    function isPercentage(n) {
        return typeof n === "string" && n.indexOf('%') != -1;
    }

    // Force a hex value to have 2 characters
    function pad2(c) {
        return c.length == 1 ? '0' + c : '' + c;
    }

    // Replace a decimal with it's percentage value
    function convertToPercentage(n) {
        if (n <= 1) {
            n = (n * 100) + "%";
        }

        return n;
    }

    // Converts a decimal to a hex value
    function convertDecimalToHex(d) {
        return Math.round(parseFloat(d) * 255).toString(16);
    }
    // Converts a hex value to a decimal
    function convertHexToDecimal(h) {
        return (parseIntFromHex(h) / 255);
    }

    var matchers = (function() {

        // <http://www.w3.org/TR/css3-values/#integers>
        var CSS_INTEGER = "[-\\+]?\\d+%?";

        // <http://www.w3.org/TR/css3-values/#number-value>
        var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

        // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
        var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

        // Actual matching.
        // Parentheses and commas are optional, but not required.
        // Whitespace can take the place of commas or opening paren
        var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

        return {
            rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
            rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
            hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
            hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
            hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
            hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
            hex3: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
            hex8: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
        };
    })();

    // `stringInputToObject`
    // Permissive string parsing.  Take in a number of formats, and output an object
    // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
    function stringInputToObject(color) {

        color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
        var named = false;
        if (names[color]) {
            color = names[color];
            named = true;
        }
        else if (color == 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0, format: "name" };
        }

        // Try to match string input using regular expressions.
        // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
        // Just return an object and let the conversion functions handle that.
        // This way the result will be the same whether the tinycolor is initialized with string or object.
        var match;
        if ((match = matchers.rgb.exec(color))) {
            return { r: match[1], g: match[2], b: match[3] };
        }
        if ((match = matchers.rgba.exec(color))) {
            return { r: match[1], g: match[2], b: match[3], a: match[4] };
        }
        if ((match = matchers.hsl.exec(color))) {
            return { h: match[1], s: match[2], l: match[3] };
        }
        if ((match = matchers.hsla.exec(color))) {
            return { h: match[1], s: match[2], l: match[3], a: match[4] };
        }
        if ((match = matchers.hsv.exec(color))) {
            return { h: match[1], s: match[2], v: match[3] };
        }
        if ((match = matchers.hsva.exec(color))) {
            return { h: match[1], s: match[2], v: match[3], a: match[4] };
        }
        if ((match = matchers.hex8.exec(color))) {
            return {
                a: convertHexToDecimal(match[1]),
                r: parseIntFromHex(match[2]),
                g: parseIntFromHex(match[3]),
                b: parseIntFromHex(match[4]),
                format: named ? "name" : "hex8"
            };
        }
        if ((match = matchers.hex6.exec(color))) {
            return {
                r: parseIntFromHex(match[1]),
                g: parseIntFromHex(match[2]),
                b: parseIntFromHex(match[3]),
                format: named ? "name" : "hex"
            };
        }
        if ((match = matchers.hex3.exec(color))) {
            return {
                r: parseIntFromHex(match[1] + '' + match[1]),
                g: parseIntFromHex(match[2] + '' + match[2]),
                b: parseIntFromHex(match[3] + '' + match[3]),
                format: named ? "name" : "hex"
            };
        }

        return false;
    }

    window.tinycolor = tinycolor;
    })();

    $(function () {
        if ($.fn.spectrum.load) {
            $.fn.spectrum.processNativeColorInputs();
        }
    });

});


define('text!StyleManager/templates/propertyColor.html',[],function () { return '<div class="<%= pfx %>field <%= pfx %>color">\n\t<span id=\'<%= pfx %>input-holder\'></span>\n</div>\n<div style="clear:both"></div>';});

define('StyleManager/view/PropertyColorView',['backbone','./PropertyView', 'Spectrum', 'text!./../templates/propertyColor.html'], 
	function (Backbone, PropertyView, Spectrum, propertyTemplate) {
	/** 
	 * @class PropertyColorView
	 * */
	return PropertyView.extend({
		
		template: _.template(propertyTemplate),
		
		/** 
		 * @inheritdoc 
		 * */
		valueChanged: function(){
			PropertyView.prototype.valueChanged.apply(this, arguments);
			if(this.$colorPicker){
				var v	= this.model.get('value');
				this.$colorPicker.spectrum("set", v).css('background-color', v);
			}
		},
		
		/** @inheritdoc */
		renderInput: function() {
			if(!this.$input){
				this.$input = $('<input>', {placeholder: this.defaultValue, type: 'text' });
				this.$el.find('#' + this.pfx + 'input-holder').html(this.$input);
			}
			if(!this.$colorPicker){
				this.$colorPicker = $('<div>', {class: this.pfx + "color-picker"});
				var that = this;
				this.$colorPicker.spectrum({
					showAlpha: 	true,
					chooseText: 'Ok',
					cancelText: '⨯',
					move: function(color) {
						var c	= color.getAlpha() == 1 ? color.toHexString() : color.toRgbString();
						that.$colorPicker.css('background-color', c); 
					},
					change: function(color) {
						var c	= color.getAlpha() == 1 ? color.toHexString() : color.toRgbString();
						c = c.replace(/ /g,'');
						that.$colorPicker.css('background-color', c);
						that.model.set('value', c);
					}
				});
				this.$el.find('#' + this.pfx + 'input-holder').append(this.$colorPicker);
			}
			this.setValue(this.componentValue,0);
		},
		
		/** @inheritdoc */
		setValue: function(value, f){
			PropertyView.prototype.setValue.apply(this, arguments);
			var v 	= this.model.get('value') || this.defaultValue;
			v		= value || v;
			if(this.$colorPicker)
				this.$colorPicker.spectrum("set", v).css('background-color',v);
		},

	});
});


define('text!StyleManager/templates/propertyFile.html',[],function () { return '<div class="<%= pfx %>field <%= pfx %>file">\n\t<div id=\'<%= pfx %>input-holder\'>\n\t\t<div class="<%= pfx %>btn-c">\n\t\t\t<button class="<%= pfx %>btn" id="<%= pfx %>images" type="button"><%= assets %></button>\n\t\t</div>\n\t\t<div style="clear:both;"></div>\n\t</div>\n\t<div id="<%= pfx %>preview-box">\n\t\t<div id="<%= pfx %>preview-file"></div>\n\t\t<div id="<%= pfx %>close">&Cross;</div>\n\t</div>\n</div>\n<div style="clear:both"></div>';});

define('StyleManager/view/PropertyFileView',['backbone','./PropertyView', 'text!./../templates/propertyFile.html'],
	function (Backbone, PropertyView, propertyTemplate) {
	/**
	 * @class PropertyColorView
	 * */
	return PropertyView.extend({

		template: _.template(propertyTemplate),

		initialize: function(options) {
			PropertyView.prototype.initialize.apply(this, arguments);
			this.assets		= this.target.get('assets');
			this.modal		= this.target.get('Modal');
			this.am			= this.target.get('AssetManager');
			this.className 	= this.className + ' '+ this.pfx +'file';
			this.events['click #'+this.pfx+'close']		= 'removeFile';
			this.events['click #'+this.pfx+'images']	= 'openAssetManager';
			this.delegateEvents();
		},

		/** @inheritdoc */
		renderInput: function() {

			if(!this.$input){
				this.$input 		= $('<input>', {placeholder: this.defaultValue, type: 'text' });
			}

			if(!this.$preview){
				this.$preview		= this.$el.find('#' + this.pfx + 'preview-file');
			}

			if(!this.$previewBox){
				this.$previewBox	= this.$el.find('#' + this.pfx + 'preview-box');
			}

			if(!this.componentValue || this.componentValue == this.defaultValue)
				this.setPreviewView(0);
			else
				this.setPreviewView(1);

			this.setValue(this.componentValue,0);
		},

		/**
		 * Change visibility of the preview box
		 * @param bool Visibility
		 *
		 * @return void
		 * */
		setPreviewView: function(v){
			if(!this.$previewBox)
				return;
			if(v)
				this.$previewBox.addClass(this.pfx + 'show');
			else
				this.$previewBox.removeClass(this.pfx + 'show');
		},

		/**
		 * Spread url
		 * @param string Url
		 *
		 * @return void
		 * */
		spreadUrl: function(url){
			this.setValue('url("'+url+'")');
			this.setPreviewView(1);
		},

		/**
		 * Shows file preview
		 * @param string Value
		 * */
		setPreview: function(v){
			if(this.$preview)
				this.$preview.css('background-image',v);
		},

		/** @inheritdoc */
		setValue: function(value, f){
			PropertyView.prototype.setValue.apply(this, arguments);
			this.setPreview(value);
		},

		/** @inheritdoc */
		renderTemplate: function(){
			this.$el.append( this.template({
				upload	: 'Upload',
				assets	: 'Images',
				pfx		: this.pfx
			}));
		},

		/** @inheritdoc */
		cleanValue: function(){
			this.setPreviewView(0);
			this.model.set({value: ''},{silent: true});
		},

		/**
		 * Remove file from input
		 *
		 * @return void
		 * */
		removeFile:function(){
			this.model.set('value',this.defaultValue);
			PropertyView.prototype.cleanValue.apply(this, arguments);
			this.setPreviewView(0);
		},

		/**
		 * Open dialog for image selecting
		 * @param	{Object}	e	Event
		 *
		 * @return void
		 * */
		openAssetManager: function(e){
			var that	= this;
			if(this.modal && this.am){
				this.modal.setTitle('Select image');
				this.modal.setContent(this.am.render());
				this.am.setTarget(null);
				this.modal.show();
				this.am.onSelect(function(model){
					that.modal.hide();
					that.spreadUrl(model.get('src'));
					that.valueChanged(e);
				});
			}
		},


	});
});


define('text!StyleManager/templates/propertyComposite.html',[],function () { return '<div class="<%= pfx %>field <%= pfx %>composite">\n\t<span id=\'<%= pfx %>input-holder\'></span>\n</div>\n<div style="clear:both"></div>';});

define('StyleManager/view/PropertyCompositeView',['backbone','./PropertyView', 'text!./../templates/propertyComposite.html','require'], 
	function (Backbone, PropertyView, propertyTemplate, require) {
	/** 
	 * @class PropertyCompositeView
	 * */
	return PropertyView.extend({
		
		template: _.template(propertyTemplate),
		
		initialize: function(o) {
			PropertyView.prototype.initialize.apply(this, arguments);
			_.bindAll(this, 'build');
			this.config		= o.config;
			this.className 	= this.className + ' '+ this.pfx +'composite';
		},
		
		/**
		 * Renders input
		 * 
		 * @return void
		 * */
		renderInput: function() {
			var props	= this.model.get('properties');
			if(props && props.length){
				if(!this.$input)											
					this.$input = $('<input>', {value: 0, type: 'hidden' });
				
				if(!this.props){
					var Properties 	= require('./../model/Properties');
					this.props		= new Properties(props);
					this.model.set('properties', this.props);
				}
				
				if(!this.$props){
					//Avoid style for children
					this.props.each(function(prop, index){
						prop.set('doNotStyle', true);
					});
					//Not yet supported nested composite
					this.props.each(function(prop, index){
						if(prop && prop.get('type') == 'composite'){
							this.props.remove(prop);
							console.warn(prop.get('property')+' of type composite not yet allowed.');
						}
					},this);
					
					var PropertiesView 	= require('./PropertiesView');
					var that 			= this;
					var propsView = new PropertiesView({
						config			: this.config,
						collection		: this.props,
						target			: this.target,
						onChange		: function(el, model){
							var result = that.build(el, model);  
							that.model.set('value', result);
						},
						onInputRender	: function(property, mIndex){
							var value = that.valueOnIndex(mIndex, property.model);
							property.setValue(value);
						},
						customValue		: function(property, mIndex){
							return that.valueOnIndex(mIndex, property.model);
						},
					});
					this.$props = propsView.render().$el;
					this.$el.find('#'+ this.pfx +'input-holder').html(this.$props);
				}
			}
		},
		
		/**
		 * Get default value of the property
		 * 
		 * @return string
		 * */
		getDefaultValue: function(){
			var str = '';
			this.props.each(function(prop, index){
				str += prop.get('defaults') + prop.get('unit') + ' ';
			});
			return str.replace(/ +$/,'');
		},
		
		/**
		 * Extract string from composite value
		 * @param integer	Index
		 * @param object 	Property model
		 * 
		 * @return string
		 * */
		valueOnIndex: function(index, model){
			var result 	= null;
			var a		= this.getComponentValue().split(' ');
			if(a.length && a[index]){
				result = a[index];
				//Check for function type values
				if(model && model.get('functionName')){
					var v = this.fetchFromFunction(result);
					if(v)
						result	= v;
				}
			}
			return result;
		},
		
		/**
		 * Build composite value
		 * @param Object Selected element
		 * @param Object Property model
		 * 
		 * @return string
		 * */
		build: function(selectedEl, propertyModel){
			var result 	= '';
			this.model.get('properties').each(function(prop){
				var v		= (prop.get('value') || prop.get('defaults')) + prop.get('unit'),
					func	= prop.get('functionName');
				if(func)
					v =  func + '(' + v + ')';
				result 	+= v + ' ';
			});
			//Remove also the last white space
			return result.replace(/ +$/,'');
		},

	});
});


define('text!StyleManager/templates/propertyStack.html',[],function () { return '<div class="<%= pfx %>field <%= pfx %>stack">\n\t<button id=\'<%= pfx %>add\'>+</button>\n\t<span id=\'<%= pfx %>input-holder\'></span>\n</div>\n<div style="clear:both"></div>';});

define('StyleManager/model/Layer',['backbone'],
	function(Backbone) {
		/** 
		 * @class Layer
		 * */
		return Backbone.Model.extend({
			
			defaults: {
				name 	: '', 			
				active	: true,		
				value 	: '',
				preview	: false,
			}
		
        });
	});
define('StyleManager/model/Layers',[ 'backbone','./Layer'], 
	function (Backbone,Layer) {
		/** 
		 * @class Layers
		 * */
		return Backbone.Collection.extend({
			
			model: Layer,
			
		});
});


define('text!StyleManager/templates/layer.html',[],function () { return '<div id="<%= pfx %>label"><%= label %></div>\n<div id="<%= pfx %>preview-box">\n\t<div id="<%= pfx %>preview" style=\'<%= pPreview %>:<%= vPreview %>\'></div> \n</div>\n<div id="<%= pfx %>close-layer" class="<%= pfx %>btn-close">&Cross;</div>\n<div id="<%= pfx %>inputs"></div>\n<div style="clear:both"></div>';});

define('StyleManager/view/LayerView',['backbone', 'text!./../templates/layer.html'],
	function (Backbone, layerTemplate) {
	/**
	 * @class LayerView
	 * */
	return Backbone.View.extend({

		events:{
			'click'				: 'updateIndex',
		},

		template: _.template(layerTemplate),

		initialize: function(o) {
			this.stackModel	= o.stackModel || {};
			this.config 	= o.config;
			this.pfx		= this.config.stylePrefix;
			this.className	= this.pfx + 'layer';
			this.listenTo( this.model, 'destroy remove', this.remove );
			this.listenTo( this.model, 'change:valuePreview', this.previewChanged );
			this.listenTo( this.model, 'change:props', this.showProps );
			this.events['click #' + this.pfx + 'close-layer']			= 'remove';

			if( !this.model.get('preview') ){
				this.$el.addClass(this.pfx + 'no-preview');
			}

			// Parse preview value if requested
			var pPattern = this.model.get('patternPreview');
			if(this.model.get('valuePreview') && pPattern){
				this.model.set('preview',true);
				var nV	= this.formatPreviewValue(pPattern);
				this.model.set({valuePreview: nV}, {silent: true});
			}

			this.delegateEvents();
		},

		/**
		 * Format preview value by pattern of property models
		 * @param Objects Property models
		 *
		 * @return string
		 * */
		formatPreviewValue: function(props){
			var	aV	= this.model.get('valuePreview').split(' '),
				lim = 3,
				nV	= '';
			props.each(function(p, index){
				var v = aV[index];
				if(v){
					if(p.get('type') == 'integer'){
						var vI	= parseInt(v, 10),
							u	= v.replace(vI,'');
						vI	= !isNaN(vI) ? vI : 0;
						if(vI > lim)	vI = lim;
						if(vI < -lim) 	vI = -lim;
						v = vI + u;
					}
				}
				nV	+= v + ' ';
			});
			return nV;
		},

		/**
		 * Show inputs on this layer
		 *
		 * @return void
		 * */
		showProps:function(){
			this.$props = this.model.get('props');
			this.$el.find('#' + this.pfx + 'inputs').html(this.$props.show());
			this.model.set({ props: null },{ silent: true });
		},

		/**
		 * Triggered when the value for the preview is changed
		 *
		 * @return void
		 * */
		previewChanged:function(){
			if( this.model.get('preview') ){
				if(!this.$preview)
					this.$preview = this.$el.find('#'+ this.pfx + 'preview');
				var property = this.model.get('propertyPreview');
				if(property)
					this.$preview.css(property,this.model.get('valuePreview'));
			}
		},

		/** @inheritdoc */
		remove: function(e){
			// Prevent from revoming all events on props
			if(this.$props)
				this.$props.detach();
			e.stopPropagation();
			Backbone.View.prototype.remove.apply(this, arguments);
			this.model.collection.remove(this.model);
			this.stackModel.trigger('refreshValue');
			this.stackModel.set({stackIndex: null},{silent: true});
		},

		/**
		 * Update index
		 * @param Event
		 *
		 * @return void
		 * */
		updateIndex: function(e){
			var index = this.model.collection.indexOf(this.model);
			this.stackModel.set('stackIndex', index);
			this.model.collection.trigger('deselectAll');
			this.$el.addClass(this.pfx + 'active');
		},

		render : function(){
			var index = this.model.collection.indexOf(this.model);
			this.$el.html( this.template({
				label		: 'Layer '+index,
				name		: this.model.get('name'),
				vPreview	: this.model.get('valuePreview'),
				pPreview	: this.model.get('propertyPreview'),
				pfx			: this.pfx,
			}));
			this.$el.attr('class', this.className);
			return this;
		},

	});
});

define('StyleManager/view/LayersView',['backbone','./LayerView'], 
	function (Backbone, LayerView) {
	/** 
	 * @class LayersView
	 * */
	return Backbone.View.extend({
		
		initialize: function(o) {
			this.config 	= o.config;
			this.stackModel	= o.stackModel;
			this.preview	= o.preview;
			this.pfx		= this.config.stylePrefix;
			this.className	= this.pfx + 'layers';
			this.listenTo( this.collection, 'add', this.addTo );
			this.listenTo( this.collection, 'deselectAll', this.deselectAll );
			this.listenTo( this.collection, 'reset', this.render );
		},
		
		/**
		 * Add to collection
		 * @param Object Model
		 * 
		 * @return Object
		 * */
		addTo: function(model){
			this.addToCollection(model);
		},
		
		/**
		 * Add new object to collection
		 * @param Object Model
		 * @param Object Fragment collection
		 * 
		 * @return Object Object created
		 * */
		addToCollection: function(model, fragmentEl){
			var fragment	= fragmentEl || null;
			var viewObject	= LayerView;
			
			if(typeof this.preview != 'undefined'){
				model.set('preview', this.preview);
			}
			
			var view = new viewObject({ 
					model		: model,
					stackModel	: this.stackModel,
					preview		: this.preview,
					config		: this.config,
			});
			var rendered	= view.render().el;
			
			if(fragment){
				fragment.appendChild( rendered );
			}else{
				this.$el.append(rendered);
			}
			
			return rendered;
		},
		
		/**
		 * Deselect all
		 * 
		 * @return void
		 * */
		deselectAll: function(){
			this.$el.find('.'+ this.pfx  +'layer').removeClass(this.pfx + 'active');
		},
		
		render: function() {
			var fragment = document.createDocumentFragment();
			this.$el.empty();
			
			this.collection.each(function(model){
				this.addToCollection(model, fragment);
			},this);
			
			this.$el.append(fragment);
			this.$el.attr('class', this.className);
			return this;
		}
	});
});

define('StyleManager/view/PropertyStackView',['backbone','./PropertyCompositeView', 'text!./../templates/propertyStack.html','./../model/Layers','./LayersView'],
	function (Backbone, PropertyCompositeView, propertyTemplate, Layers, LayersView) {
	/**
	 * @class PropertyStackView
	 * */
	return PropertyCompositeView.extend({

		template: _.template(propertyTemplate),

		initialize: function(o) {
			PropertyCompositeView.prototype.initialize.apply(this, arguments);
			this.model.set('stackIndex', null);
			this.listenTo( this.model ,'change:stackIndex', this.indexChanged);
			this.listenTo( this.model ,'refreshValue', this.refreshValue);
			this.className 	= this.pfx  + 'property '+ this.pfx +'stack';
			this.events['click #'+this.pfx+'add']	= 'addLayer';

			if(!this.layers){
				this.layers		= new Layers();
				this.model.set('layers', this.layers);
				this.$layers	= new LayersView({
					collection	: this.layers,
					stackModel	: this.model,
					preview		: this.model.get('preview'),
					config		: o.config
				});
			}

			this.delegateEvents();
		},

		/**
		 * Triggered when another layer has been selected
		 * @param Event
		 *
		 * @return Object
		 * */
		indexChanged: function(e){
			var layer	= this.layers.at(this.model.get('stackIndex'));
			layer.set('props', this.$props);
			this.target.trigger('change:selectedComponent');
		},

		/**
		 * Get array of values from layers
		 *
		 * @return Array
		 * */
		getStackValues: function(){
			var a = [];
			this.layers.each(function(layer){
				a.push( layer.get('value') );
			});
			return a;
		},

		/**
		 * Extract string from composite value
		 * @param integer	Index
		 *
		 * @return string
		 * */
		valueOnIndex: function(index){
			var result 	= null;
			var aStack	= this.getStackValues();
			var strVar	= aStack[this.model.get('stackIndex')];

			if(!strVar)
				return;
			var a		= strVar.split(' ');
			if(a.length && a[index]){
				result = a[index];
			}
			return result;
		},

		/** @inheritdoc */
		build: function(selectedEl, propertyModel){
			if(this.model.get('stackIndex') === null)
				return;
			var result = PropertyCompositeView.prototype.build.apply(this, arguments);
			var model = this.layers.at(this.model.get('stackIndex'));
			if(!model)
				return;
			model.set('value',result);
			// Update data for preview
			if(this.onPreview && typeof this.onPreview === "function"){
				var v	= this.onPreview(this.model.get('properties'));
				if(v)
					result = v;
				model.set('propertyPreview', this.property);
				model.set('valuePreview',result);
			}

			return this.createValue();
		},

		/**
		 * Change preview value. Limited integer values
		 * @param Models
		 *
		 * @return string
		 * */
		onPreview: function(properties){
			var str = '',
				lim	= 3;
			properties.each(function(p){
				var v = p.get('value');
				if(p.get('type') == 'integer'){
					if(v > lim)		v = lim;
					if(v < -lim) 	v = -lim;
				}
				str	+= v + p.get('unit')+' ';
			});

			return str;
		},

		/**
		 * Add layer
		 * @param Event
		 *
		 * @return Object
		 * */
		addLayer: function(e){
			if(this.selectedComponent){
				var layer	= this.layers.add({ name : 'test' });
				var index	= this.layers.indexOf(layer);
				layer.set('value', this.getDefaultValue());
				this.refreshValue();
				this.model.set('stackIndex', index);
				return layer;
			}
		},

		/**
		 * Refresh value
		 *
		 * @return void
		 * */
		refreshValue: function(){
			this.model.set('value', this.createValue());
		},

		/**
		 * Create value by layers
		 * @return string
		 * */
		createValue: function(){
			return this.getStackValues().join(', ');
		},

		/**
		 * Render layers
		 *
		 * @return self
		 * */
		renderLayers: function() {
			this.$el.find('> .'+this.pfx+'field').append(this.$layers.render().el);
			this.$props.hide();
			return this;
		},

		/** @inheritdoc */
		renderInput: function() {
			PropertyCompositeView.prototype.renderInput.apply(this, arguments);
			this.refreshLayers();
		},

		/**
		 * Refresh layers
		 *
		 * @return void
		 * */
		refreshLayers: function(){
			var v	= this.getComponentValue();
			var n = [];
			if(v){
				var a = v.split(', ');
				_.each(a,function(e){
					n.push({ 	value: e,
								valuePreview: e,
								propertyPreview: this.property,
								patternPreview:	this.props
							});
				},this);
			}
			this.$props.detach();
			this.layers.reset(n);
			this.refreshValue();
			this.model.set({stackIndex: null},{silent: true});
		},

		/** @inheritdoc */
		render : function(){
			this.renderLabel();
			this.renderField();
			this.renderLayers();
			this.$el.attr('class', this.className);
			return this;
		},

	});
});

define('StyleManager/view/PropertiesView',['backbone','./PropertyView', './PropertyIntegerView', './PropertyRadioView', './PropertySelectView', 
        './PropertyColorView', './PropertyFileView', './PropertyCompositeView', './PropertyStackView'], 
	function (Backbone, PropertyView, PropertyIntegerView, PropertyRadioView, PropertySelectView, 
			PropertyColorView, PropertyFileView, PropertyCompositeView, PropertyStackView) {
	/** 
	 * @class PropertiesView
	 * */
	return Backbone.View.extend({
		
		initialize: function(o) {
			this.config 		= o.config;
			this.pfx 			= this.config.stylePrefix;
			this.target			= o.target 			|| {};
			this.onChange		= o.onChange 		|| {};
			this.onInputRender	= o.onInputRender 	|| {};
			this.customValue	= o.customValue		|| {};
		},
		
		render: function() {
			var fragment = document.createDocumentFragment();
			
			this.collection.each(function(model){
				var objView	= PropertyView;
				
				switch(model.get('type')){
					case 'integer': 
						objView	= PropertyIntegerView; 	break;
					case 'radio': 	
						objView	= PropertyRadioView;	break;
					case 'select': 	
						objView	= PropertySelectView;	break;
					case 'color': 	
						objView	= PropertyColorView;	break;
					case 'file': 	
						objView	= PropertyFileView;		break;
					case 'composite': 	
						objView	= PropertyCompositeView;break;
					case 'stack': 	
						objView	= PropertyStackView;	break;
				}
				
				var view = new objView({
					model			: model,
					name			: model.get('name'),
					id				: this.pfx + model.get('property'),
					target			: this.target,
					onChange		: this.onChange,
					onInputRender	: this.onInputRender,
					config			: this.config,
				});
				
				if(model.get('type') != 'composite'){
					view.customValue = this.customValue;
				}
					
				fragment.appendChild(view.render().el);
			},this);

			this.$el.append(fragment);
			this.$el.append($('<div>', {class: "clear"}));
			this.$el.attr('class', this.pfx + 'properties');
			return this;
		}
	});
});

define('StyleManager/view/SectorView',['backbone','./PropertiesView'],
	function (Backbone,PropertiesView) {
	/**
	 * @class SectorView
	 * */
	return Backbone.View.extend({

		events:{},

		initialize: function(o) {
			this.config 	= o.config;
			this.pfx 		= this.config.stylePrefix;
			this.target		= o.target || {};
			this.open 		= this.model.get('open');
			this.events['click .' + this.pfx + 'title']	= 'toggle';
			this.delegateEvents();
		},

		/**
		 * Show the content of the sector
		 * */
		show : function(){
			this.$el.addClass(this.pfx + "open");
			this.$el.find('.' + this.pfx + 'properties').show();
			this.open = true;
		},

		/**
		 * Hide the content of the sector
		 * */
		hide : function(){
			this.$el.removeClass(this.pfx + "open");
			this.$el.find('.' + this.pfx + 'properties').hide();
			this.open = false;
		},

		/**
		 * Toggle visibility of the content
		 * */
		toggle: function(){
			if(this.open)
				this.hide();
			else
				this.show();
		},

		render : function(){
			if(this.open)
				this.show();
			else
				this.hide();
			this.$el.html('<div class="' + this.pfx + 'title">'+this.model.get('name')+'</div>');
			this.renderProperties();
			this.$el.attr('class', this.pfx + 'sector no-select');
			return this;
		},

		renderProperties: function(){
			var objs = this.model.get('properties');

			if(objs){
				var view = new PropertiesView({
					collection	: objs,
					target		: this.target,
					config		: this.config,
				});
				this.$el.append(view.render().el);
			}
		},
	});
});

define('StyleManager/view/SectorsView',['backbone','./SectorView'], 
	function (Backbone, SectorView) {
	/** 
	 * @class sectorsView
	 * */
	return Backbone.View.extend({
		
		initialize: function(o) {
			this.config 	= o.config;
			this.pfx 		= this.config.stylePrefix;
			this.target		= o.target || {};
		},
		
		render: function() {
			var fragment = document.createDocumentFragment();
			
			this.collection.each(function(obj){
				var view = new SectorView({
					model		: obj,
					id			: this.pfx + obj.get('name').replace(' ','_').toLowerCase(),
					name		: obj.get('name'),
					properties	: obj.get('properties'),
					target		: this.target,
					config		: this.config,
				});
				fragment.appendChild(view.render().el);
			}, this);
			
			this.$el.attr('id', this.pfx + 'sectors');
			this.$el.append(fragment);
			return this;
		}
	});
});

define('StyleManager/main',['require','./config/config','./model/Sectors','./view/SectorsView'],function(require) {
	/**
	 * @class 	StyleManager
	 * @param 	{Object} Configurations
	 * 
	 * @return	{Object}
 	 * */
	function StyleManager(config)
	{
		var c				= config || {},
			defaults		= require('./config/config'),
			Sectors			= require('./model/Sectors'),
			SectorsView		= require('./view/SectorsView');

		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}
		
		this.sectors		= new Sectors(c.sectors);
		var obj				= {
				collection	: this.sectors,
				target		: c.target,
		    	config		: c,
		};
		
	    this.SectorsView 	= new SectorsView(obj);
	}
	
	StyleManager.prototype	= {
			
			/**
			 * Get all sectors
			 * 
			 * @return	{Sectors}
			 * */
			getSectors	: function()
			{
				return this.sectors;
			},
			
			/**
			 * Get sector by id
			 * @param	{String}	id	Object id
			 * 
			 * @return	{Sector}|{null}
			 * */
			getSector	: function(id)
			{
				var res	= this.sectors.where({id: id});
				return res.length ? res[0] : null;
			},
			
			/**
			 * Add new Sector
			 * @param	{String}	id	Object id
			 * @param	{Object}	obj	Object data
			 * 
			 * @return	{Sector}
			 * */
			addSector	: function(id, obj)
			{
				if(!this.getSector(id)){
					obj.id	= id;
					return this.sectors.add(obj);
				}
			},
			
			/**
			 * Render sectors
			 * 
			 * @return	{String}
			 * */
			render		: function(){
				return this.SectorsView.render().$el;
			},
	};
	
	return StyleManager;
});
define('StyleManager', ['StyleManager/main'], function (main) { return main; });

define('Commands/view/OpenStyleManager',['StyleManager'], function(StyleManager) {
		/** 
		 * @class OpenStyleManager
		 * */
		return {
			
			run: function(em, sender)
			{
				if(!this.$sm){
					var config		= em.get('Config'),
						panels		= em.get('Panels'),
						smStylePfx	= config.styleManager.stylePrefix || 'sm-';
					
					config.styleManager.stylePrefix = config.stylePrefix + smStylePfx;
					config.styleManager.target		= em;
					
					var sm		= new StyleManager(config.styleManager);
					this.$sm	= sm.render();
					
					if(!panels.getPanel('views-container'))
						this.panel	= panels.addPanel({ id: 'views-container'});
					else
						this.panel	= panels.getPanel('views-container');
					
					this.panel.set('appendContent', this.$sm).trigger('change:appendContent');
				}
				this.$sm.show();
			},
			
			stop: function()
			{
				if(this.$sm)
					this.$sm.hide();
			}
		};
	});
define('Commands/main',['require','./config/config','./view/CommandAbstract','./view/SelectComponent','./view/CreateComponent','./view/DeleteComponent','./view/ImageComponent','./view/MoveComponent','./view/TextComponent','./view/InsertCustom','./view/ExportTemplate','./view/SwitchVisibility','./view/OpenLayers','./view/OpenStyleManager'],function(require) {
	/**
	 * @class 	Commands
	 * @param 	{Object} Configurations
	 *
	 * @return	{Object}
 	 * */
	function Commands(config)
	{
		var c				= config || {},
			defaults		= require('./config/config'),
			AbsCommands		= require('./view/CommandAbstract');

		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}

		this.commands		= {};
		this.config			= c;
		this.Abstract		= AbsCommands;

		this.defaultCommands					= {};
		this.defaultCommands['select-comp']		= require('./view/SelectComponent');
		this.defaultCommands['create-comp']		= require('./view/CreateComponent');
		this.defaultCommands['delete-comp']		= require('./view/DeleteComponent');
		//this.defaultCommands['resize-comp'] 	= require('./view/ResizeComponent');
		this.defaultCommands['image-comp']		= require('./view/ImageComponent');
		this.defaultCommands['move-comp']		= require('./view/MoveComponent');
		this.defaultCommands['text-comp']		= require('./view/TextComponent');
		this.defaultCommands['insert-custom']	= require('./view/InsertCustom');
		this.defaultCommands['export-template']	= require('./view/ExportTemplate');
		this.defaultCommands['sw-visibility']	= require('./view/SwitchVisibility');
		this.defaultCommands['open-layers']		= require('./view/OpenLayers');
		this.defaultCommands['open-sm']			= require('./view/OpenStyleManager');

		this.config.model 		= this.config.em.get('Canvas');
	}

	Commands.prototype	= {

			/**
			 * Add new command
			 * @param	{String}	id
			 * @param	{Object}	obj
			 *
			 * @return 	this
			 * */
			add	: function(id, obj)
			{
				delete obj.initialize;
				this.commands[id]		= this.Abstract.extend(obj);
				return this;
			},

			/**
			 * Get command
			 * @param	{String}	id
			 *
			 * @return 	Command
			 * */
			get	: function(id)
			{
				var el	= this.commands[id];

				if(typeof el == 'function'){
					el 					= new el(this.config);
					this.commands[id]	= el;
				}

				return el;
			},

			/**
			 * Load default commands
			 *
			 * @return 	this
			 * */
			loadDefaultCommands	: function()
			{
				for (var id in this.defaultCommands) {
					this.add(id, this.defaultCommands[id]);
				}

				return this;
			},
	};

	return Commands;
});
define('Commands', ['Commands/main'], function (main) { return main; });

define('Canvas/config/config',[],function () {
	return {
		
		stylePrefix			: 'cv-',
		
		// Coming soon
		rulers				: false,
		
	};
});
define('Canvas/model/Canvas',['backbone'],
	function(Backbone){
		/**
		 * @class Canvas
		 * */
		return Backbone.Model.extend({
			
			defaults :{
				wrapper		: '',
				rulers		: false,
			},
		
		});
	});

define('Canvas/view/CanvasView',['backbone'],
function(Backbone) {
	/**
	 * @class CanvasView
	 * */
	return Backbone.View.extend({
		
		//id: 'canvas',
		
		initialize: function(o) {
			this.config		= o.config;
			this.className	= this.config.stylePrefix + 'canvas';
		},
		
		render: function() {
			this.wrapper	= this.model.get('wrapper');
			if(this.wrapper && typeof this.wrapper.render == 'function'){
				this.$el.append( this.wrapper.render() );
			}
			this.$el.attr({class: this.className, id: this.config.canvasId});
			return this;
		},
	
	});
});
define('Canvas/main',['require','./config/config','./model/Canvas','./view/CanvasView'],function(require) {
	/**
	 * @class 	Canvas
	 * @param 	{Object} Configurations
	 * 
	 * @return	{Object}
 	 * */
	var Canvas	= function(config)
	{
		var c			= config || {},
			defaults	= require('./config/config'),
			Canvas		= require('./model/Canvas'),
			CanvasView	= require('./view/CanvasView');

		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}
		
		this.canvas		= new Canvas(config);
		var obj			= {
				model	: this.canvas,
		    	config	: c,
		};
		
		this.CanvasView	= new CanvasView(obj);
	};
	
	Canvas.prototype	= {
			/**
			 * Add wrapper
			 * @param	{Object}	wrp Wrapper
			 * 
			 * */
			setWrapper	: function(wrp)
			{
				this.canvas.set('wrapper', wrp);
			},
			
			/**
			 * Get wrapper
			 * 
			 * @return	{Object}
			 * */
			getWrapper	: function()
			{
				return this.canvas.get('wrapper').getComponent();
			},
			
			/**
			 * Render canvas
			 * */
			render		: function()
			{
				return	this.CanvasView.render().$el;
			},
	};
	
	return Canvas;
});
define('Canvas', ['Canvas/main'], function (main) { return main; });

define('RichTextEditor/config/config',[],function () {
	return {
		stylePrefix	: 'rte-',
		toolbarId	: 'toolbar',
		containerId	: 'wrapper',
		commands	: [{
							command: 	'bold',
							title: 		'Bold',
							class:		'fa fa-bold',
							group:		'format'
						},{
							command: 	'italic',
							title: 		'Italic',
							class:		'fa fa-italic',
							group:		'format'
						},{
							command: 	'underline',
							title: 		'Underline',
							class:		'fa fa-underline',
							group:		'format'
					 },],
	};
});
/*jslint browser:true*/
define('RichTextEditor/view/TextEditorView',['jquery'],
  function ($) {

  var readFileIntoDataUrl = function (fileInfo) {
    var loader = $.Deferred(),
      fReader = new FileReader();
    fReader.onload = function (e) {
      loader.resolve(e.target.result);
    };
    fReader.onerror = loader.reject;
    fReader.onprogress = loader.notify;
    fReader.readAsDataURL(fileInfo);
    return loader.promise();
  };
  $.fn.cleanHtml = function () {
    var html = $(this).html();
    return html && html.replace(/(<br>|\s|<div><br><\/div>|&nbsp;)*$/, '');
  };
  $.fn.wysiwyg = function (userOptions) {
    var editor = this,
      selectedRange,
      options,
      toolbarBtnSelector,
      updateToolbar = function () {
        if (options.activeToolbarClass) {
          $(options.toolbarSelector).find(toolbarBtnSelector).each(function () {
            var command = $(this).data(options.commandRole);
            if (document.queryCommandState(command)) {
              $(this).addClass(options.activeToolbarClass);
            } else {
              $(this).removeClass(options.activeToolbarClass);
            }
          });
        }
      },
      execCommand = function (commandWithArgs, valueArg) {
        var commandArr = commandWithArgs.split(' '),
          command = commandArr.shift(),
          args = commandArr.join(' ') + (valueArg || '');
        document.execCommand(command, 0, args);
        updateToolbar();
      },
      bindHotkeys = function (hotKeys) {
        $.each(hotKeys, function (hotkey, command) {
          editor.keydown(hotkey, function (e) {
            if (editor.attr('contenteditable') && editor.is(':visible')) {
              e.preventDefault();
              e.stopPropagation();
              execCommand(command);
            }
          }).keyup(hotkey, function (e) {
            if (editor.attr('contenteditable') && editor.is(':visible')) {
              e.preventDefault();
              e.stopPropagation();
            }
          });
        });
      },
      getCurrentRange = function () {
        var sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
          return sel.getRangeAt(0);
        }
      },
      saveSelection = function () {
        selectedRange = getCurrentRange();
      },
      restoreSelection = function () {
        var selection = window.getSelection();
        if (selectedRange) {
          try {
            selection.removeAllRanges();
          } catch (ex) {
            document.body.createTextRange().select();
            document.selection.empty();
          }

          selection.addRange(selectedRange);
        }
      },
      insertFiles = function (files) {
        editor.focus();
        $.each(files, function (idx, fileInfo) {
          if (/^image\//.test(fileInfo.type)) {
            $.when(readFileIntoDataUrl(fileInfo)).done(function (dataUrl) {
              execCommand('insertimage', dataUrl);
            }).fail(function (e) {
              options.fileUploadError("file-reader", e);
            });
          } else {
            options.fileUploadError("unsupported-file-type", fileInfo.type);
          }
        });
      },
      markSelection = function (input, color) {
        restoreSelection();
        if (document.queryCommandSupported('hiliteColor')) {
          document.execCommand('hiliteColor', 0, color || 'transparent');
        }
        saveSelection();
        input.data(options.selectionMarker, color);
      },
      bindToolbar = function (toolbar, options) {
        toolbar.find(toolbarBtnSelector).click(function () {
          restoreSelection();
          editor.focus();
          execCommand($(this).data(options.commandRole));
          saveSelection();
        });
        toolbar.find('[data-toggle=dropdown]').click(restoreSelection);

        toolbar.find('input[type=text][data-' + options.commandRole + ']').on('webkitspeechchange change', function () {
          var newValue = this.value; /* ugly but prevents fake double-calls due to selection restoration */
          this.value = '';
          restoreSelection();
          if (newValue) {
            editor.focus();
            execCommand($(this).data(options.commandRole), newValue);
          }
          saveSelection();
        }).on('focus', function () {
          var input = $(this);
          if (!input.data(options.selectionMarker)) {
            markSelection(input, options.selectionColor);
            input.focus();
          }
        }).on('blur', function () {
          var input = $(this);
          if (input.data(options.selectionMarker)) {
            markSelection(input, false);
          }
        });
        toolbar.find('input[type=file][data-' + options.commandRole + ']').change(function () {
          restoreSelection();
          if (this.type === 'file' && this.files && this.files.length > 0) {
            insertFiles(this.files);
          }
          saveSelection();
          this.value = '';
        });
      },
      initFileDrops = function () {
        editor.on('dragenter dragover', false)
          .on('drop', function (e) {
            var dataTransfer = e.originalEvent.dataTransfer;
            e.stopPropagation();
            e.preventDefault();
            if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
              insertFiles(dataTransfer.files);
            }
          });
      };
    /** Disable the editor
     * @date 2015-03-19 */
    if(typeof userOptions=='string' && userOptions=='destroy'){
      editor.attr('contenteditable', false).unbind('mouseup keyup mouseout dragenter dragover');
      $(window).unbind('touchend');
      return this;
    }
    options = $.extend({}, $.fn.wysiwyg.defaults, userOptions);
    toolbarBtnSelector = 'a[data-' + options.commandRole + '],button[data-' + options.commandRole + '],input[type=button][data-' + options.commandRole + ']';
    bindHotkeys(options.hotKeys);
    if (options.dragAndDropImages) {
      initFileDrops();
    }
    bindToolbar($(options.toolbarSelector), options);
    editor.attr('contenteditable', true)
      .on('mouseup keyup mouseout', function () {
        saveSelection();
        updateToolbar();
      });
    $(window).bind('touchend', function (e) {
      var isInside = (editor.is(e.target) || editor.has(e.target).length > 0),
        currentRange = getCurrentRange(),
        clear = currentRange && (currentRange.startContainer === currentRange.endContainer && currentRange.startOffset === currentRange.endOffset);
      if (!clear || isInside) {
        saveSelection();
        updateToolbar();
      }
    });
    return this;
  };
  $.fn.wysiwyg.defaults = {
    hotKeys: {
      'ctrl+b meta+b': 'bold',
      'ctrl+i meta+i': 'italic',
      'ctrl+u meta+u': 'underline',
      'ctrl+z meta+z': 'undo',
      'ctrl+y meta+y meta+shift+z': 'redo',
      'ctrl+l meta+l': 'justifyleft',
      'ctrl+r meta+r': 'justifyright',
      'ctrl+e meta+e': 'justifycenter',
      'ctrl+j meta+j': 'justifyfull',
      'shift+tab': 'outdent',
      'tab': 'indent'
    },
    toolbarSelector: '[data-role=editor-toolbar]',
    commandRole: 'edit',
    activeToolbarClass: 'btn-info',
    selectionMarker: 'edit-focus-marker',
    selectionColor: 'darkgrey',
    dragAndDropImages: true,
    fileUploadError: function (reason, detail) { console.log("File upload error", reason, detail); }
  };

  return $;
});


define('RichTextEditor/model/CommandButton',['backbone'], 
	function (Backbone) {
		/**
		 * @class CommandButton
		 * */
		return Backbone.Model.extend({ 
			
			defaults: {
				command		: '',
				title		: '',
				class		: '',
				group		: '',
			},
			
		});
});

define('RichTextEditor/model/CommandButtons',[ 'backbone','./CommandButton'], 
	function (Backbone, CommandButton) {
		/**
		 * @class CommandButtons
		 * */
		return Backbone.Collection.extend({
			
			model: CommandButton,
			
		});
});

define('RichTextEditor/view/CommandButtonView',['backbone'], 
	function (Backbone) {
	/** 
	 * @class CommandButtonView
	 * */
	return Backbone.View.extend({
		
		tagName: 'a',
		
		initialize: function(o){
			this.config		= o.config || {};
			this.className	= this.config.stylePrefix + 'btn ' + this.model.get('class');
		},
		
		render: function() {
			this.$el.attr('class',  _.result( this, 'className' ) );
			return this;
		}
	});
});

define('RichTextEditor/view/CommandButtonsView',['backbone','./CommandButtonView'], 
	function (Backbone, CommandButtonView) {
	/** 
	 * @class CommandButtonsView
	 * */
	return Backbone.View.extend({
		
		className: 'no-dots',
		
		attributes : {
			'data-role' 	:	'editor-toolbar',
		},
		
		initialize: function(o){
			this.config		= o.config || {};
			this.id			= this.config.stylePrefix + this.config.toolbarId;
			this.$el.data('helper',1);
		},
		
		/** 
		 * Update RTE target pointer
		 * @param	{String}	target
		 * 
		 * @return 	this
		 * */
		updateTarget: function(target){
			this.$el.attr('data-target',target);
			return this;
		},
		
		render: function() {
			var fragment = document.createDocumentFragment();
			this.$el.empty();
			
			this.collection.each(function(item){
				var view = new CommandButtonView({
					model 		: item,
					config		: this.config,
					attributes 	: {
						'title'		: item.get('title'),
						'data-edit'	: item.get('command'),
					},
				});
				fragment.appendChild(view.render().el);
			},this);
			this.$el.append(fragment);
			this.$el.attr('id',  _.result( this, 'id' ) );
			return this;
		}
	});
});

define('RichTextEditor/main',['require','./config/config','./view/TextEditorView','./model/CommandButtons','./view/CommandButtonsView'],function(require) {
	/**
	 * @class 	RichTextEditor
	 * @param 	{Object} Configurations
	 *
	 * @return	{Object}
 	 * */
	function RichTextEditor(config)
	{
		var c									= config || {},
			defaults						= require('./config/config'),
			rte									= require('./view/TextEditorView'),
			CommandButtons			= require('./model/CommandButtons'),
			CommandButtonsView	= require('./view/CommandButtonsView');

		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}

		this.tlbPfx			= c.stylePrefix;
		this.commands		= new CommandButtons(c.commands);
		var obj				= {
				collection	: this.commands,
		    	config		: c,
		};

		this.toolbar 		= new CommandButtonsView(obj);
		this.$toolbar 		= this.toolbar.render().$el;
	}

	RichTextEditor.prototype	= {

			/**
			 * Bind rich text editor to element
			 * @param		{Object}	view
			 * @param		{Object}	container
			 *
			 * */
			bind		: function(view, container){
				if(!this.$contaniner){
					this.$container		= container;
					this.$toolbar.appendTo(this.$container);
				}
				view.$el.wysiwyg({hotKeys: {}}).focus();
				this.updatePosition(view.$el);
				this.bindToolbar(view).show();
				//Avoid closing edit mode clicking on toolbar
				this.$toolbar.on('mousedown', this.disableProp);
			},

			/**
			 * Unbind rich text editor from element
			 * @param		{Object}	view
			 *
			 * */
			unbind		: function(view){
				view.$el.wysiwyg('destroy');
				this.hide();
				this.$toolbar.off('mousedown', this.disableProp);
			},

			/**
			 * Bind toolbar to element
			 * @param		{Object}	view
			 *
			 * @return 	this
			 * */
			bindToolbar	: function(view){
				var	id	= this.tlbPfx + view.model.cid,
					dId	= this.tlbPfx + 'inited';
				if(!view.$el.data(dId)){
					view.$el.data(dId, 1);
					view.$el.attr('id',id);
				}
				this.toolbar.updateTarget('#' + id);
				return this;
			},

			/**
			 * Update toolbar position
			 * @param 	{Object}	$el	Element
			 *
			 */
			updatePosition: function($el){
				var	cOffset	= this.$container.offset(),
					cTop 	= cOffset ? cOffset.top : 0,
					cLeft	= cOffset ? cOffset.left : 0,
					eOffset	= $el.offset(),
					rTop	= eOffset.top  - cTop + this.$container.scrollTop(),
					rLeft	= eOffset.left - cLeft + this.$container.scrollLeft();
				if(!this.tlbH)
					this.tlbH	= this.$toolbar.outerHeight();
				this.$toolbar.css({
					top		: (rTop - this.tlbH - 5),
					left	: rLeft
				});
			},

			/**
			 * Show toolbar
			 *
			 * */
			show	: function(){
				this.$toolbar.show();
			},

			/**
			 * Hide toolbar
			 *
			 * */
			hide	: function(){
				this.$toolbar.hide();
			},

			/**
			 * Isolate disable propagation method
			 *
			 * */
			disableProp: function(e){
				e.stopPropagation();
			},
	};

	return RichTextEditor;
});
define('RichTextEditor', ['RichTextEditor/main'], function (main) { return main; });

define('DomComponents/config/config',[],function () {
	return {
		stylePrefix		: 'comp-',
		
		wrapperId		: 'wrapper',
		
		// Default wrapper configuration
		wrapper			: {
			removable 	: false,
			stylable	: ['background','background-color','background-image', 'background-repeat','background-attachment','background-position'],
			movable		: false,
			badgable	: false,
		},
		
		// Could be used for default components
		components		: {},
		
		rte				: {},
		
		em				: {},
		
		// Class for new image component
		imageCompClass	: 'fa fa-picture-o',
		
		// Open assets manager on create of image component
		oAssetsOnCreate	: true,
	};
});
define('DomComponents/model/Components',[ 'backbone', 'require'], 
	function (Backbone, require) {
		/**
		 * @class Components
		 * */
	
		return Backbone.Collection.extend({
			
			initialize: function(models, opt){
				
				this.model	= function(attrs, options) {
					var model;
					
					switch(attrs.type){

						case 'text':
							if(!this.mComponentText)
					    		this.mComponentText		= require("./ComponentText");
							model	= new this.mComponentText(attrs, options);
							break;
						
						case 'image':
							if(!this.mComponentImage)
					    		this.mComponentImage	= require("./ComponentImage");
							model	= new this.mComponentImage(attrs, options);
							break;
						
						default:
							if(!this.mComponent)
					    		this.mComponent			= require("./Component");
							model	= new this.mComponent(attrs, options);
					
					}
					
					return	model;
				};
				 
			},
			
		});
});

define('DomComponents/model/Component',['backbone','./Components'], 
	function (Backbone, Components) {
		/**
		 * @class Component
		 * */
		return Backbone.Model.extend({ 
			
			defaults: {
				tagName			: 'div',
				type			: '',
				editable		: false,
				removable		: true,
				movable			: true,
				droppable		: true,
				badgable		: true,
				stylable		: true,
				status			: '',
				previousModel	: '',
				content			: '',
				style			: {},
				attributes		: {},
			},
			
			initialize: function(options) {
				this.defaultC = options.components || [];
				this.components	= new Components(this.defaultC);
				this.set('components', this.components);
			},
			
			/**
			 * Get name of the component
			 * 
			 * @return string
			 * */
			getName: function(){
				if(!this.name){
					var id		= this.cid.replace(/\D/g,''),
						type	= this.get('type');
					this.name 	= type.charAt(0).toUpperCase() + type.slice(1) + 'Box' + id;
				}
				return this.name;
			},
			
		});
});

define('DomComponents/model/ComponentText',['./Component'], 
	function (Component) {
		/**
		 * @class ComponentText
		 * */
		return Component.extend({ 
			
			defaults: _.extend({}, Component.prototype.defaults, {
					content 		: '',
					droppable		: false,
			}),
			
		});
});

define('DomComponents/model/ComponentImage',['./Component'], 
	function (Component) {
		/**
		 * @class ComponentImage
		 * */
		return Component.extend({ 
			
			defaults: _.extend({}, Component.prototype.defaults, {
					src 			: '',
					droppable		: false,
			}),
			
		});
});

define('DomComponents/view/ComponentsView',['backbone','require'],
function(Backbone, require) {
	/** 
	 * @class ComponentsView
	 * */
	return Backbone.View.extend({
		
		initialize: function(o) {
			this.config			= o.config;
			this.listenTo( this.collection, 'add', this.addTo );
			this.listenTo( this.collection, 'reset', this.render );
		},
		
		/**
		 * Add to collection
		 * @param	{Object} Model
		 * 
		 * @return	void
		 * */
		addTo: function(model){
			var i	= this.collection.indexOf(model);
			this.addToCollection(model, null, i);
		},
		
		/**
		 * Add new object to collection
		 * @param	{Object}	Model
		 * @param	{Object} 	Fragment collection
		 * @param	{Integer}	Index of append
		 * 
		 * @return 	{Object} 	Object rendered
		 * */
		addToCollection: function(model, fragmentEl, index){
			if(!this.compView)
				this.compView	=	require('./ComponentView');
			var fragment	= fragmentEl || null,
				viewObject	= this.compView;
			
			switch(model.get('type')){
				case 'text':
					if(!this.compViewText)
						this.compViewText	=	require('./ComponentTextView');
					viewObject	= this.compViewText;
					break;
				case 'image':
					if(!this.compViewImage)
						this.compViewImage	=	require('./ComponentImageView');
					viewObject	= this.compViewImage;
					break;
			}
			
			var view 		= new viewObject({ 
				model 	: model, 
				config	: this.config,
			});
			var rendered	= view.render().el;
			
			if(fragment){
				fragment.appendChild(rendered);
			}else{
				var p	= this.$parent;
				if(typeof index != 'undefined'){
					var method	= 'before';
					// If the added model is the last of collection
					// need to change the logic of append
					if(p.children().length == index){
						index--;
						method	= 'after';
					}
					// In case the added is new in the collection index will be -1
					if(index < 0){
						p.append(rendered);
					}else
						p.children().eq(index)[method](rendered);
				}else{
					p.append(rendered);
				}
			}
			
			return rendered;
		},
		
		render: function($p) {
			var fragment 	= document.createDocumentFragment();
			this.$parent	= $p || this.$el;
			this.$el.empty();
			this.collection.each(function(model){
				this.addToCollection(model, fragment);
			},this);
			this.$el.append(fragment);
			
			return this;
		}
		
	});
});
define('DomComponents/view/ComponentView',['backbone', './ComponentsView'], 
	function (Backbone, ComponentsView) {
		/** 
		 * @class ComponentView
		 * */
		return Backbone.View.extend({
			
			className : function(){ 						//load classes from model
				return this.getClasses(); 
			},
			
			tagName: function(){ 							//load tagName from model
				return this.model.get('tagName'); 
			},
			
			initialize: function(opt){
				this.config			= opt.config;
				this.components 	= this.model.get('components');
				this.attr			= this.model.get("attributes");
				this.classe			= this.attr.class || [];
				this.listenTo( this.model, 'destroy remove', 	this.remove);				
				this.listenTo( this.model, 'change:style', 		this.updateStyle);				
				this.listenTo( this.model, 'change:attributes', this.updateAttributes);
				this.$el.data("model", this.model);
				this.$el.data("model-comp", this.components);
			},
			
			/** 
			 * Get classes from attributes. 
			 * This method is called before initialize
			 * 
			 * @return	{Array}|null
			 * */
			getClasses: function(){
				var attr	= this.model.get("attributes"),
					classes	= attr['class'] || [];
				if(classes.length){
					return classes.join(" ");
				}else
					return null;
			},
			
			/** 
			 * Update attributes
			 * 
			 * @return void
			 * */
			updateAttributes: function(){
				var attributes	= {},
					attr		= this.model.get("attributes");
				for(var key in attr) {			
					  if(attr.hasOwnProperty(key))
					    attributes[key] = attr[key];
				}
				// Update src
				if(this.model.get("src"))
					attributes.src = this.model.get("src");
				
				attributes.style = this.getStyleString();
				
				this.$el.attr(attributes);
			},
			
			/** 
			 * Update style attribute
			 * 
			 * @return void
			 * */
			updateStyle: function(){
				this.$el.attr('style', this.getStyleString());
			},
			
			/** 
			 * Return style string
			 * 
			 * @return	{String}
			 * */
			getStyleString: function(){
				var style	= '';
				this.style	= this.model.get('style');
				for(var key in this.style) {
					  if(this.style.hasOwnProperty(key))
						  style += key + ':' + this.style[key] + ';';
				}
				
				return style;
			},
			
			/** 
			 * Update classe attribute
			 * 
			 * @return void
			 * */
			updateClasses: function(){
				if(this.classe.length)
					this.$el.attr('class', this.classe.join(" "));
			},
			
			/**
			 * Reply to event call 
			 * @param object Event that generated the request
			 * */
			eventCall: function(event){
				event.viewResponse = this;
			},
			
			render: function() {
				this.updateAttributes();
				this.$el.html(this.model.get('content'));
				var view = new ComponentsView({ 
					collection	: this.components,
					config		: this.config,
				});
				this.$components = view;
				// With childNodes lets avoid wrapping 'div'
				this.$el.append(view.render(this.$el).el.childNodes);
				return this;
			},
			
		});
});

define('DomComponents/view/ComponentImageView',['backbone', './ComponentView'], 
	function (Backbone, ComponentView) {
	/**
	 * @class ComponentImageView
	 * */
	
	return ComponentView.extend({
		
		tagName		: 'img',
		
		events		: {
				'dblclick' 	: 'openModal',
		},
		
		initialize: function(o){
			ComponentView.prototype.initialize.apply(this, arguments);
			this.listenTo( this.model, 'change:src', 	this.updateSrc);
			this.listenTo( this.model, 'dblclick', 		this.openModal);
			this.classEmpty		= this.config.stylePrefix + 'image-placeholder ' + this.config.imageCompClass;
			
			if(!this.model.get('src'))
				this.$el.attr('class', this.classEmpty);
			
			if(this.config.modal)
				this.modal		= this.config.modal;
			
			if(this.config.am)
				this.am			= this.config.am;
		},
		
		/** 
		 * Update src attribute
		 * 
		 * @return void
		 * */
		updateSrc: function(){
			this.$el.attr('src',this.model.get("src"));
		},
		
		/**
		 * Open dialog for image changing
		 * @param	{Object}	e	Event
		 * 
		 * @return void
		 * */
		openModal: function(e){
			var that	= this;
			if(this.modal && this.am){
				this.modal.setTitle('Select image');
				this.modal.setContent(this.am.render());
				this.am.setTarget(this.model);
				this.modal.show();
				this.am.onSelect(function(){
					that.modal.hide();
					that.am.setTarget(null);
				});
			}
		},
		
		render: function() {
			this.updateAttributes();
			return this;
		},
	});
});

define('DomComponents/view/ComponentTextView',['backbone', './ComponentView'],
	function (Backbone, ComponentView) {
	/**
	 * @class ComponentTextView
	 * */

	return ComponentView.extend({

		events: {
			'dblclick' 	: 'enableEditing',
		},

		initialize: function(o){
			ComponentView.prototype.initialize.apply(this, arguments);
			_.bindAll(this,'disableEditing');
			this.listenTo( this.model, 'focus', this.enableEditing);
			if(this.config.rte){
				this.rte	= this.config.rte;
			}
		},

		/**
		 * Enable this component to be editable,
		 * load also the mini toolbar for quick editing
		 * @param Event
		 * */
		enableEditing: function(e){
			if(this.rte){
				var $e	= this.config.em.get('$editor');
				if(!this.$wrapper && $e.length)
					this.$wrapper	= $e.find('#'+this.config.wrapperId);
				this.rte.bind(this, this.$wrapper);
			}
			$(document).on('mousedown', this.disableEditing);									//Close edit mode
			this.$el.on('mousedown', this.disablePropagation);								//Avoid closing edit mode on component click
		},

		/**
		 * Disable this component to be editable
		 * @param Event
		 * */
		disableEditing: function(e){
			if(this.rte){
				this.rte.unbind(this);
			}
			$(document).off('mousedown', this.disableEditing);
			this.$el.off('mousedown',this.disablePropagation);
			this.updateContents();
		},

		/** Isolate disable propagation method
		 * @param Event
		 * */
		disablePropagation: function(e){
			e.stopPropagation();
		},

		/**
		 * Update contents of the element
		 *
		 * @return void
		 **/
		updateContents : function(){
			this.model.set('content', this.$el.html());
		},

		render: function() {
			this.updateAttributes();
			this.$el.html(this.model.get('content'));
			return this;
		},
	});
});

define('DomComponents/main',['require','./config/config','./model/Component','./model/ComponentText','./model/ComponentImage','./view/ComponentView','./view/ComponentImageView','./view/ComponentTextView'],function(require) {
	/**
	 * @class 	Components
	 * @param 	{Object} Configurations
	 * 
	 * @return	{Object}
 	 * */
	function Components(config)
	{
		var c					= config || {},
			defaults			= require('./config/config'),
			Component			= require('./model/Component'),
			ComponentText		= require('./model/ComponentText'),
			ComponentImage		= require('./model/ComponentImage'),
			ComponentView		= require('./view/ComponentView'),
			ComponentImageView	= require('./view/ComponentImageView'),
			ComponentTextView	= require('./view/ComponentTextView');

	    // Set default options
		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}
		
		if(!c.wrapper.attributes)
			c.wrapper.attributes 	= {};
		c.wrapper.attributes.id		= 'wrapper';
		
		if(!c.wrapper.style)
			c.wrapper.style 		= {};
		c.wrapper.style.position	= 'relative';
		
		this.component		= new Component(c.wrapper);
		var obj				= {
				model	: this.component,
		    	config	: c,
		};
		
	    this.ComponentView 	= new ComponentView(obj);
	}
	
	Components.prototype	= {
			
			render		: function(){
				return this.ComponentView.render().$el;
			},
			
			getComponent	: function(){
				return this.component;
			},
	};
	
	return Components;
});
define('DomComponents', ['DomComponents/main'], function (main) { return main; });

define('Panels/config/config',[],function () {
	return {
		stylePrefix		: 'pn-',
		
		// Default panels
		defaults		: [],
		
		// Editor model
		em				: null,
		
		// Delay before show children buttons (in milliseconds)
		delayBtnsShow	: 300,			
	};
});
define('Panels/model/Button',[ 'backbone','require'], 
	function (Backbone, require) {
	/**
	 * @class Button
	 * */
	return Backbone.Model.extend({
		
		defaults :{
			id 			: '',
			className	: '',
			command		: '',
			context		: '',
			buttons		: [],
			attributes	: {},
			active		: false,
		},
	
		initialize: function(options) {
			if(this.get('buttons').length){
				var Buttons	= require('./Buttons');
				this.set('buttons', new Buttons(this.get('buttons')) );
			}
		},
	
	});
});

define('Panels/model/Buttons',[ 'backbone','./Button'], 
	function (Backbone, Button) {
		/**
		 * @class Buttons
		 * */
		return Backbone.Collection.extend({
			
			model: Button,
			
			/**
			 * Deactivate all buttons, except one passed
			 * @param	{Object}	except	Model to ignore
			 * @param	{Boolean}	r 		Recursive flag
			 * 
			 * @return	void
			 * */
			deactivateAllExceptOne: function(except, r){
				this.forEach(function(model, index) {
					if(model !== except){
						model.set('active', false);
						if(r && model.get('buttons').length)
							model.get('buttons').deactivateAllExceptOne(except,r);
					}
				});
			},
			
			/**
			 * Deactivate all buttons
			 * @param	{String}	context Context string
			 * 
			 * @return	void
			 * */
			deactivateAll: function(context){
				this.forEach(function(model, index) {
					if( model.get('context') == context ){
						model.set('active', false);
						if(model.get('buttons').length)
							model.get('buttons').deactivateAll(context);
					}
				});
			},
			
		});
});

define('Panels/model/Panel',[ 'backbone','./Buttons'], 
	function (Backbone, Buttons) {
	/**
	 * @class Panel
	 * */
	return Backbone.Model.extend({
		
		defaults :{
			id 		: '',
			content : '',
			visible	: true,
			buttons	: [],
		},
	
		initialize: function(options) {
			this.btn 		= this.get('buttons') || [];
			this.buttons	= new Buttons(this.btn);
			this.set('buttons', this.buttons);
		},
	
	});
});

define('Panels/model/Panels',[ 'backbone','./Panel'], 
	function (Backbone, Panel) {
		/**
		 * @class Panels
		 * */
		return Backbone.Collection.extend({
			
			model: Panel,
			
		});
});

define('Panels/view/ButtonView',['backbone','require'],
function(Backbone, require) {
	/**
	 * @class ButtonView
	 * */
	return Backbone.View.extend({

		tagName		: 'span',

		events		: { 'click'	: 'clicked'	},

		initialize: function(o){
			_.bindAll(this, 'startTimer', 'stopTimer', 'showButtons', 'hideButtons','closeOnKeyPress');
			this.config 	= o.config;
			this.em			= this.config.em || {};
			this.pfx 		= this.config.stylePrefix;
			this.id			= this.pfx + this.model.get('id');
			this.className	= this.pfx + 'btn ' + this.model.get('className');
			this.activeCls	= this.pfx + 'active';
			this.btnsVisCls	= this.pfx + 'visible';
			this.parentM	= o.parentM || null;
			this.listenTo(this.model, 'change:active updateActive', this.updateActive);
			this.listenTo(this.model, 'checkActive', this.checkActive);
			this.listenTo(this.model, 'change:bntsVis',		this.updateBtnsVis);
			this.listenTo(this.model, 'change:attributes', 	this.updateAttributes);
			this.listenTo(this.model, 'change:className', 	this.updateClassName);

			if(this.model.get('buttons').length){
				this.$el.on('mousedown', this.startTimer);
				this.$el.append($('<div>',{class: this.pfx + 'arrow-rd'}));
			}

			if(this.em)
				this.commands	= this.em.get('Commands');
		},

		/**
		 * Updates class name of the button
		 *
		 * @return 	void
		 * */
		updateClassName: function()
		{
			this.$el.attr('class', this.pfx + 'btn ' + this.model.get('className'));
		},

		/**
		 * Updates attributes of the button
		 *
		 * @return 	void
		 * */
		updateAttributes: function()
		{
			this.$el.attr(this.model.get("attributes"));
		},

		/**
		 * Updates visibility of children buttons
		 *
		 * @return	void
		 * */
		updateBtnsVis: function()
		{
			if(!this.$buttons)
				return;

			if(this.model.get('bntsVis'))
				this.$buttons.addClass(this.btnsVisCls);
			else
				this.$buttons.removeClass(this.btnsVisCls);
		},

		/**
		 * Start timer for showing children buttons
		 *
		 * @return	void
		 * */
		startTimer: function()
		{
			this.timeout = setTimeout(this.showButtons, this.config.delayBtnsShow);
			$(document).on('mouseup', 	this.stopTimer);
		},

		/**
		 * Stop timer for showing children buttons
		 *
		 * @return	void
		 * */
		stopTimer: function()
		{
			$(document).off('mouseup', 	this.stopTimer);
			if(this.timeout)
				clearTimeout(this.timeout);
		},

		/**
		 * Show children buttons
		 *
		 * @return 	void
		 * */
		showButtons: function()
		{
			clearTimeout(this.timeout);
			this.model.set('bntsVis', true);
			$(document).on('mousedown',	this.hideButtons);
			$(document).on('keypress',	this.closeOnKeyPress);
		},
		/**
		 * Hide children buttons
		 *
		 * @return 	void
		 * */
		hideButtons: function(e)
		{
			if(e){ $(e.target).trigger('click'); }
			this.model.set('bntsVis', false);
			$(document).off('mousedown',	this.hideButtons);
			$(document).off('keypress', 	this.closeOnKeyPress);
		},

		/**
		 * Close buttons on ESC key press
		 * @param 	{Object}	e	Event
		 *
		 * @return 	void
		 * */
		closeOnKeyPress: function(e)
		{
			var key = e.which || e.keyCode;
			if(key == 27)
				this.hideButtons();
		},

		/**
		 * Update active status of the button
		 *
		 * @return 	void
		 * */
		updateActive: function(){
			var command	= null;

			if(this.commands)
				command	= this.commands.get(this.model.get('command'));

			if(this.model.get('active')){

				this.model.collection.deactivateAll(this.model.get('context'));
				this.model.set('active', true, { silent: true }).trigger('checkActive');

				if(this.parentM)
					this.parentM.set('active', true, { silent: true }).trigger('checkActive');

				if(command)
					command.run(this.em, this.model);
			}else{
				this.$el.removeClass(this.activeCls);

				this.model.collection.deactivateAll(this.model.get('context'));

				if(this.parentM)
					this.parentM.set('active', false, { silent: true }).trigger('checkActive');

				if(command)
					command.stop(this.em, this.model);
			}
		},

		/**
		 * Update active style status
		 *
		 * @return 	void
		 * */
		checkActive: function(){
			if(this.model.get('active'))
				this.$el.addClass(this.activeCls);
			else
				this.$el.removeClass(this.activeCls);
		},

		/**
		 * Triggered when button is clicked
		 * @param	{Object}	e	Event
		 *
		 * @return 	void
		 * */
		clicked: function(e)
		{
			if(this.model.get('bntsVis') )
				return;

			if(this.parentM)
				this.swapParent();

			this.model.set('active', !this.model.get('active'));
		},

		/**
		 * Updates parent model swapping properties
		 *
		 * @return	void
		 * */
		swapParent: function()
		{
			this.parentM.collection.deactivateAll(this.model.get('context'));
			this.parentM.set('attributes', 	this.model.get('attributes'));
			this.parentM.set('options', 	this.model.get('options'));
			this.parentM.set('command', 	this.model.get('command'));
			this.parentM.set('className', 	this.model.get('className'));
			this.parentM.set('active', true, { silent: true }).trigger('checkActive');
		},

		render: function()
		{
			this.updateAttributes();
			this.$el.attr('class', this.className);

			if(this.model.get('buttons').length){
				var btnsView = require('./ButtonsView');								//Avoid Circular Dependencies
				var view = new btnsView({
						collection 	: this.model.get('buttons'),
						config		: this.config,
						parentM		: this.model
				});
				this.$buttons	= view.render().$el;
				this.$buttons.append($('<div>',{class: this.pfx + 'arrow-l'}));
				this.$el.append(this.$buttons);											//childNodes avoids wrapping 'div'
			}

			return this;
		},

	});
});
define('Panels/view/ButtonsView',['backbone','./ButtonView'], 
	function (Backbone, ButtonView) {
	/** 
	 * @class ButtonsView
	 * */
	return Backbone.View.extend({
		
		initialize: function(o) {
			this.opt 		= o;
			this.config		= o.config;
			this.pfx		= o.config.stylePrefix;
			this.parentM	= o.parentM || null;
			this.listenTo( this.collection, 'add', this.addTo );
			this.listenTo( this.collection, 'reset', this.render );
			this.className 	= this.pfx + 'buttons';
		},
		
		/**
		 * Add to collection
		 * @param Object Model
		 * 
		 * @return Object
		 * */
		addTo: function(model){
			this.addToCollection(model);
		},
		
		/**
		 * Add new object to collection
		 * @param	Object	Model
		 * @param	Object 	Fragment collection
		 * 
		 * @return Object Object created
		 * */
		addToCollection: function(model, fragmentEl){
			var fragment	= fragmentEl || null;
			var viewObject	= ButtonView;
			
			var view 		= new viewObject({
				model 	: model, 
				config	: this.config,
				parentM	: this.parentM
			});
			var rendered	= view.render().el;
			
			if(fragment){
				fragment.appendChild(rendered);
			}else{
				this.$el.append(rendered);
			}
			
			return rendered;
		},
		
		render: function() {
			var fragment = document.createDocumentFragment();
			this.$el.empty();
			
			this.collection.each(function(model){
				this.addToCollection(model, fragment);
			}, this);
			
			this.$el.append(fragment);
			this.$el.attr('class', _.result(this, 'className'));
			return this;
		}
	});
});

define('Panels/view/PanelView',['backbone','./ButtonsView'],
function(Backbone, ButtonsView) {
	/** 
	 * @class PanelView
	 * */
	return Backbone.View.extend({
		
		initialize: function(o){
			this.config 	= o.config;
			this.pfx 		= this.config.stylePrefix;
			this.buttons	= this.model.get('buttons');
			this.className	= this.pfx + 'panel';
			this.id			= this.pfx + this.model.get('id');
			this.listenTo(this.model, 'change:appendContent', this.appendContent);
			this.listenTo(this.model, 'change:content', this.updateContent);
		},
		
		/**
		 * Append content of the panel
		 * */
		appendContent: function()
		{
			this.$el.append(this.model.get('appendContent'));
		},
		
		/**
		 * Update content
		 * */
		updateContent: function()
		{
			this.$el.html(this.model.get('content'));
		},
		
		
		render: function() {
			this.$el.attr('class', _.result(this, 'className'));
			this.$el.attr('id', this.id);
			if(this.buttons.length){
				var buttons	= new ButtonsView({
					collection	: this.buttons,
					config		: this.config,
				});
				this.$el.append(buttons.render().el);
			}
			this.$el.append(this.model.get('content'));
			return this;
		},

	});
});
define('Panels/view/PanelsView',['backbone','./PanelView'], 
	function (Backbone, PanelView) {
	/** 
	 * @class ItemsView
	 * */
	return Backbone.View.extend({
		
		initialize: function(o) {
			this.opt 		= o;
			this.config		= o.config;
			this.pfx		= o.config.stylePrefix;
			this.listenTo( this.collection, 'add', this.addTo );
			this.listenTo( this.collection, 'reset', this.render );
			this.className 	= this.pfx + 'panels';
		},
		
		/**
		 * Add to collection
		 * @param Object Model
		 * 
		 * @return Object
		 * */
		addTo: function(model){
			this.addToCollection(model);
		},
		
		/**
		 * Add new object to collection
		 * @param	Object	Model
		 * @param	Object 	Fragment collection
		 * @param	integer	Index of append
		 * 
		 * @return Object Object created
		 * */
		addToCollection: function(model, fragmentEl){
			var fragment	= fragmentEl || null;
			var viewObject	= PanelView;
			
			var view 		= new viewObject({ 
				model 	: model, 
				config	: this.config,
			});
			var rendered	= view.render().el;
			
			if(fragment){
				fragment.appendChild(rendered);
			}else{
				this.$el.append(rendered);
			}
			
			return rendered;
		},
		
		render: function() {
			var fragment = document.createDocumentFragment();
			this.$el.empty();
			
			this.collection.each(function(model){
				this.addToCollection(model, fragment);
			}, this);
			
			this.$el.append(fragment);
			this.$el.attr('class', _.result(this, 'className'));
			return this;
		}
	});
});

define('Panels/main',['require','./config/config','./model/Panels','./view/PanelsView'],function(require) {
	/**
	 * @class 	Panel
	 * @param 	{Object} Configurations
	 * 
	 * @return	{Object}
 	 * */
	function Panel(config)
	{
		var c				= config || {},
			defaults		= require('./config/config'),
			Panels			= require('./model/Panels'),
			PanelsView		= require('./view/PanelsView');

	    // Set default options
		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}
		
		this.panels			= new Panels(c.defaults);
		var obj				= {
				collection	: this.panels,
		    	config		: c,
		};
		
	    this.PanelsView 	= new PanelsView(obj);
	}
	
	Panel.prototype	= {
			
			getPanels	: function(){
				return this.panels;
			},
			
			addPanel	: function(obj){
				return this.panels.add(obj);
			},
			
			getPanel	: function(id){
				var res	= this.panels.where({id: id});
				return res.length ? res[0] : null;
			},
			
			addButton	: function(panelId, obj){
				var pn	= this.getPanel(panelId);
				return pn ? pn.get('buttons').add(obj) : null;
			},
			
			getButton	: function(panelId, id){
				var pn	= this.getPanel(panelId);
				if(pn){
					var res	= pn.get('buttons').where({id: id});
					return res.length ? res[0] : null;
				}
				return null;
			},
			
			active		: function(){
				this.getPanels().each(function(p){
	    			p.get('buttons').each(function(btn){
	    				if(btn.get('active'))
	    					btn.trigger('updateActive');
	    			});
	    		});
			},
			
			render		: function(){
				return this.PanelsView.render().el;
			},
	};
	
	return Panel;
});
define('Panels', ['Panels/main'], function (main) { return main; });

define('editor/model/Editor',[
        'backbone',
        'backboneUndo',
        'keymaster',
        'AssetManager', 
        'StorageManager', 
        'ModalDialog', 
        'CodeManager',
        'Commands',
        'Canvas',
        'RichTextEditor',
        'DomComponents',
        'Panels'],
	function(
			Backbone,
			UndoManager,
			Keymaster,
			AssetManager, 
			StorageManager, 
			ModalDialog, 
			CodeManager, 
			Commands,
			Canvas,
			RichTextEditor,
			DomComponents,
			Panels
			){
		return Backbone.Model.extend({
			
			defaults:{
				selectedComponent: 	null,
				changesCount:		0,
			},
			
			initialize: function(c)
			{
				this.config		= c;
				this.compName	= this.config.storagePrefix + 'components' + this.config.id;
				this.set('Config', c);
				
				this.initStorage();
				this.initModal();
				this.initAssetManager();
				this.initCodeManager();
				this.initCommands();
				this.initPanels();
				this.initRichTextEditor();
				this.initComponents();
				this.initCanvas();
				this.initUndoManager();
				
				this.on('change:selectedComponent', this.componentSelected, this);
			},
			
			/**
			 * Initialize components
			 * */
			initComponents: function()
			{
				var cfg			= this.config.components,
					comp		= this.loadComponentsTree(),
					cmpStylePfx	= cfg.stylePrefix || 'comp-';
				
				cfg.stylePrefix	= this.config.stylePrefix + cmpStylePfx;
				if(comp)
					cfg.wrapper	= comp;
			
				if(this.rte)
					cfg.rte		= this.rte;
			
				if(this.modal)
					cfg.modal	= this.modal;
			
				if(this.am)
					cfg.am		= this.am;
				
				cfg.em			= this;
				
				this.cmp 		= new DomComponents(cfg);
				
				if(this.stm.isAutosave()){ // TODO Currently doesn't listen already created models
					this.updateComponents( this.cmp.getComponent(), null, { avoidStore : 1 });
				}
				
				this.set('Components', this.cmp);
			},
			
			/**
			 * Initialize canvas
			 * */
			initCanvas: function()
			{
				var cfg				= this.config.canvas,
					pfx				= cfg.stylePrefix || 'cv-';
					cfg.stylePrefix	= this.config.stylePrefix + pfx;
				cfg.canvasId	= this.config.idCanvas;
				this.cv			= new Canvas(this.config.canvas);

				if(this.cmp)
					this.cv.setWrapper(this.cmp);
				
				this.set('Canvas', this.cv);
			},
			
			/**
			 * Initialize rich text editor
			 * */
			initRichTextEditor: function()
			{
				var cfg			= this.config.rte,
					rteStylePfx	= cfg.stylePrefix || 'rte-';
				cfg.stylePrefix	= this.config.stylePrefix + rteStylePfx;
				this.rte		= new RichTextEditor(cfg);
				this.set('RichTextEditor', this.rte);
			},
			
			/**
			 * Initialize storage
			 * */
			initStorage: function()
			{
				this.stm		= new StorageManager(this.config.storageManager);
				this.stm.loadDefaultProviders().setCurrentProvider(this.config.storageType);
				this.set('StorageManager', this.stm);
			},
			
			/**
			 * Initialize asset manager
			 * */
			initAssetManager: function()
			{
				var cfg			= this.config.assetManager,
					pfx			= cfg.stylePrefix || 'am-';
				cfg.stylePrefix = this.config.stylePrefix + pfx;
				
				if(this.stm)
					cfg.stm = this.stm;
				
				this.am			= new AssetManager(cfg);
				this.set('AssetManager', this.am);
			},
			
			/**
			 * Initialize modal
			 * */
			initModal: function()
			{
				var cfg			= this.config.modal,
					pfx			= cfg.stylePrefix || 'mdl-';
				cfg.stylePrefix = this.config.stylePrefix + pfx;
				this.modal		= new ModalDialog(cfg);
				this.modal.render().appendTo('body');
				this.set('Modal', this.modal);
			},
			
			/**
			 * Initialize Code Manager
			 * */
			initCodeManager: function()
			{
				var cfg			= this.config.codeManager,
					pfx			= cfg.stylePrefix || 'cm-';
				cfg.stylePrefix = this.config.stylePrefix + pfx;
				this.cm		= new CodeManager(cfg);
				this.cm.loadDefaultGenerators().loadDefaultEditors();
				this.set('CodeManager', this.cm);
			},
			
			/**
			 * Initialize Commands
			 * */
			initCommands: function()
			{
				var cfg			= this.config.commands,
					pfx			= cfg.stylePrefix || 'com-';
				cfg.stylePrefix = this.config.stylePrefix + pfx;
				cfg.em			= this;
				cfg.canvasId	= this.config.idCanvas;
				cfg.wrapperId	= this.config.idWrapper;
				this.com		= new Commands(cfg);
				this.com.loadDefaultCommands();
				this.set('Commands', this.com);
			},
			
			/**
			 * Initialize Panels
			 * */
			initPanels: function()
			{
				var cfg			= this.config.panels,
					pfx			= cfg.stylePrefix || 'pn-';
				cfg.stylePrefix = this.config.stylePrefix + pfx;
				cfg.em			= this;
				this.pn			= new Panels(cfg);
				this.pn.addPanel({ id: 'views-container'});
				this.set('Panels', this.pn);
			},
			
			/**
			 * Initialize Undo manager
			 * */
			initUndoManager: function(){
				if(this.cmp && this.config.undoManager){
					var backboneUndo = new Backbone.UndoManager({
					    register: [this.cmp.getComponent().get('components')],
					    track: true
					});
					key('⌘+z, ctrl+z', function(){
						backboneUndo.undo(); 
					});
					key('⌘+shift+z, ctrl+shift+z', function(){
						backboneUndo.redo();
					});
					
					Backbone.UndoManager.removeUndoType("change");
					var beforeCache;
					Backbone.UndoManager.addUndoType("change:style", {
						"on": function (model, value, opt) {
							if(!beforeCache)
								beforeCache = model.toJSON();
							if (opt && opt.avoidStore) {
								return;
							} else {
								var obj = {
										"object": model,
										"before": beforeCache,
										"after": model.toJSON()
								};
								beforeCache = null;
								return obj;
							}
						},
						"undo": function (model, bf, af, opt) {
							model.set(bf);
						},
						"redo": function (model, bf, af, opt) {
							model.set(af);
						}
					});
					
					//TODO when, for example, undo delete cant redelete it, so need to 
					//recall 'remove command'
				}
			},
			
			/**
			 * Triggered when components are updated
			 * */
			componentsUpdated: function()
			{
				var updatedCount = this.get('changesCount') + 1;
				this.set('changesCount', updatedCount);
				if(this.stm.isAutosave() && updatedCount < this.stm.getChangesBeforeSave()){
					return;
				}
				this.storeComponentsTree();
				this.set('changesCount', 0 );
			},
			
			/** 
			 * Callback on component selection
			 * @param 	{Object} 	Model
			 * @param 	{Mixed} 	New value
			 * @param 	{Object} 	Options
			 * 
			 * */
			componentSelected: function(model, val, options)
			{
				if(!this.get('selectedComponent'))
					this.trigger('deselect-comp');
				else
					this.trigger('select-comp',[model,val,options]);
			},
			
			/** 
			 * Load components from storage
			 * 
			 * @return	{Object}
			 * */
			loadComponentsTree: function(){
				var result = null;
				try{
					result	=  JSON.parse(this.stm.load(this.compName));
				}catch(err){
					console.warn("Error encountered while parsing JSON response");
				}
				return result;
			},
			
			/** 
			 * Save components to storage
			 * 
			 * @return void
			 * */
			storeComponentsTree: function(){
				var wrp	= this.cmp.getComponent();
				if(wrp && this.cm){
					var res	= this.cm.getCode(wrp, 'json');
					this.stm.store(this.compName, JSON.stringify(res));
				}
			},
			
			/**
			 * Triggered when components are updated
			 * @param	{Object}	model
			 * @param	{Mixed}		val	Value
			 * @param	{Object}	opt	Options
			 * 
			 * */
			updateComponents: function(model, val, opt){
				var comps	= model.get('components'),
					avSt	= opt ? opt.avoidStore : 0;

				// Call stopListening for not creating nested listenings 
				this.stopListening(comps, 'add', this.updateComponents);
				this.stopListening(comps, 'remove', this.rmComponents);
				this.listenTo(comps, 'add', this.updateComponents);
				this.listenTo(comps, 'remove', this.rmComponents);
				
				this.stopListening(model, 'change:style change:content', this.updateComponents);
				this.listenTo(model, 'change:style change:content', this.updateComponents);
				
				if(!avSt)
					this.componentsUpdated();
			},
			
			/**
			 * Triggered when some component is removed updated
			 * @param	{Object}	model
			 * @param	{Mixed}		val	Value
			 * @param	{Object}	opt	Options
			 * 
			 * */
			rmComponents: function(model, val, opt){
				var avSt	= opt ? opt.avoidStore : 0;
				
				if(!avSt)
					this.componentsUpdated();
			}
			
		});
	});

define('editor/view/EditorView',['backbone'],
function(Backbone){
	/**
	 * @class EditorView
	 * */
	return Backbone.View.extend({
		
		initialize: function() {
			this.cv				= this.model.get('Canvas');
			this.pn				= this.model.get('Panels');
			this.className		= this.model.config.stylePrefix + 'editor';
		},

		render: function(){
			this.$el.empty();
			
			this.$cont	= $('body ' + this.model.config.container);
			
			this.model.set('$editor', this.$el);
			
			if(this.cv)
				this.$el.append(this.cv.render());
			
			if(this.pn)
				this.$el.append(this.pn.render());
			
			this.$el.attr('class', this.className);
			
			this.$cont.html(this.$el);
			
			if(this.pn)
				this.pn.active();

			return this;
		}
	});
});
define('editor/main',['require','./config/config','./model/Editor','./view/EditorView'],function (require){
		/**
		 * @class 	Grapes
		 * @param 	{Object} Configurations
		 *
		 * @return	{Object}
	 	 * */
		var Grapes	= function(config)
		{
			var c			= config || {},
			defaults		= require('./config/config'),
			Editor			= require('./model/Editor'),
			EditorView		= require('./view/EditorView');

			for (var name in defaults) {
				if (!(name in c))
					c[name] = defaults[name];
			}

			this.editor		= new Editor(c);
			var obj				= {
					model	: this.editor,
			    	config	: c,
			};

		    this.editorView = new EditorView(obj);
		};

		Grapes.prototype	= {

			render		: function()
			{
				return	this.editorView.render().$el;
			}

		};

		return Grapes;
});

require(['src/config/require-config.js'], function() {

	require(['editor/main'],function (g){
		return g;
	});

});
define("main", function(){});

return require('editor/main'); }));