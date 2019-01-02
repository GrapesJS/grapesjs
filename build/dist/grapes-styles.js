define([], function() { return [{"name":"Text","open":false,"build":[{"property":"font-family","type":"select","defaults":"Arial, Helvetica, sans-serif","list":[{"value":"Arial, Helvetica, sans-serif","name":"Arial"},{"value":"Arial Black, Gadget, sans-serif","name":"Arial Black"},{"value":"Brush Script MT, sans-serif","name":"Brush Script MT"},{"value":"Comic Sans MS, cursive, sans-serif","name":"Comic Sans MS"},{"value":"Courier New, Courier, monospace","name":"Courier New"},{"value":"Georgia, serif","name":"Georgia"},{"value":"Helvetica, serif","name":"Helvetica"},{"value":"Impact, Charcoal, sans-serif","name":"Impact"},{"value":"Lucida Sans Unicode, Lucida Grande, sans-serif","name":"Lucida Sans Unicode"},{"value":"Tahoma, Geneva, sans-serif","name":"Tahoma"},{"value":"Times New Roman, Times, serif","name":"Times New Roman"},{"value":"Trebuchet MS, Helvetica, sans-serif","name":"Trebuchet MS"},{"value":"Verdana, Geneva, sans-serif","name":"Verdana"}]},{"property":"font-size","fixedValues":["medium","xx-small","x-small","small","large","x-large","xx-large","smaller","larger","length","initial","inherit"],"type":"integer","defaults":"medium","units":["px","em","rem","%"],"min":0},{"property":"font-weight","type":"select","defaults":"400","list":[{"value":"100","name":"Thin"},{"value":"200","name":"Extra-Light"},{"value":"300","name":"Light"},{"value":"400","name":"Normal"},{"value":"500","name":"Medium"},{"value":"600","name":"Semi-Bold"},{"value":"700","name":"Bold"},{"value":"800","name":"Extra-Bold"},{"value":"900","name":"Ultra-Bold"}]},{"property":"font-style"},{"property":"font-size-adjust"},{"property":"color","type":"color","defaults":"black"},{"property":"text-transform"},{"property":"text-decoration"},{"property":"letter-spacing","fixedValues":["normal","initial","inherit"],"type":"integer","defaults":"normal","units":["px","em","rem","%"]},{"property":"word-spacing"},{"property":"line-height","fixedValues":["normal","initial","inherit"],"type":"integer","defaults":"normal","units":["px","em","rem","%"]},{"property":"text-align","type":"radio","defaults":"left","list":[{"value":"left"},{"value":"center"},{"value":"right"},{"value":"justify"}]},{"property":"vertical-align"},{"property":"direction"}]},{"name":"Background","open":false,"build":[{"property":"background-color","type":"color","defaults":"none"},{"property":"background-image","type":"file","defaults":"none","functionName":"url"},{"property":"background-repeat","type":"select","defaults":"repeat","list":[{"value":"repeat"},{"value":"repeat-x"},{"value":"repeat-y"},{"value":"no-repeat"}]},{"property":"background-position","type":"select","defaults":"left top","list":[{"value":"left top"},{"value":"left center"},{"value":"left bottom"},{"value":"right top"},{"value":"right center"},{"value":"right bottom"},{"value":"center top"},{"value":"center center"},{"value":"center bottom"}]},{"property":"background-attachment","type":"select","defaults":"scroll","list":[{"value":"scroll"},{"value":"fixed"},{"value":"local"}]},{"property":"opacity"},{"property":"background-size","type":"select","defaults":"auto","list":[{"value":"auto"},{"value":"cover"},{"value":"contain"}]}]},{"name":"Dimensions","open":false,"build":[{"property":"width","fixedValues":["initial","inherit","auto"],"type":"integer","defaults":"auto","units":["px","%","vw"],"min":0},{"property":"height","fixedValues":["initial","inherit","auto"],"type":"integer","defaults":"auto","units":["px","%","vh"],"min":0},{"property":"top","type":"integer","defaults":0,"units":["px","%","vh"]},{"property":"right","type":"integer","defaults":0,"units":["px","%","vw"]},{"property":"bottom","type":"integer","defaults":0,"units":["px","%","vh"]},{"property":"left","type":"integer","defaults":0,"units":["px","%","vw"]},{"property":"margin-top","fixedValues":["initial","inherit","auto"],"type":"integer","defaults":0,"units":["px","%","vh"]},{"property":"margin-right","fixedValues":["initial","inherit","auto"],"type":"integer","defaults":0,"units":["px","%","vw"]},{"property":"margin-bottom","fixedValues":["initial","inherit","auto"],"type":"integer","defaults":0,"units":["px","%","vh"]},{"property":"margin-left","fixedValues":["initial","inherit","auto"],"type":"integer","defaults":0,"units":["px","%","vw"]},{"property":"padding-top","fixedValues":["initial","inherit","auto"],"type":"integer","defaults":0,"units":["px","%","vh"],"min":0},{"property":"padding-right","fixedValues":["initial","inherit","auto"],"type":"integer","defaults":0,"units":["px","%","vw"],"min":0},{"property":"padding-bottom","fixedValues":["initial","inherit","auto"],"type":"integer","defaults":0,"units":["px","%","vh"],"min":0},{"property":"padding-left","fixedValues":["initial","inherit","auto"],"type":"integer","defaults":0,"units":["px","%","vw"],"min":0},{"property":"box-shadow","type":"stack","preview":true,"properties":[{"property":"box-shadow-h","type":"integer","defaults":0,"units":["px","%"]},{"property":"box-shadow-v","type":"integer","defaults":0,"units":["px","%"]},{"property":"box-shadow-blur","type":"integer","defaults":"5px","units":["px"],"min":0},{"property":"box-shadow-spread","type":"integer","defaults":0,"units":["px"]},{"property":"box-shadow-color","type":"color","defaults":"black"},{"property":"box-shadow-type","type":"select","defaults":"","list":[{"value":"","name":"Outside"},{"value":"inset","name":"Inside"}]}]},{"property":"max-width","fixedValues":["initial","inherit","auto"],"type":"integer","defaults":"auto","units":["px","%","vw"],"min":0},{"property":"min-width","fixedValues":["initial","inherit","auto"],"type":"integer","defaults":"auto","units":["px","%","vw"],"min":0},{"property":"min-height","fixedValues":["initial","inherit","auto"],"type":"integer","defaults":"auto","units":["px","%","vh"],"min":0},{"property":"max-height","fixedValues":["initial","inherit","auto"],"type":"integer","defaults":"auto","units":["px","%","vh"],"min":0},{"property":"box-shadow-h","type":"integer","defaults":0,"units":["px","%"]},{"property":"box-shadow-v","type":"integer","defaults":0,"units":["px","%"]},{"property":"box-shadow-blur","type":"integer","defaults":"5px","units":["px"],"min":0},{"property":"box-shadow-spread","type":"integer","defaults":0,"units":["px"]},{"property":"box-shadow-color","type":"color","defaults":"black"},{"property":"box-shadow-type","type":"select","defaults":"","list":[{"value":"","name":"Outside"},{"value":"inset","name":"Inside"}]}]},{"name":"Border","open":false,"build":[{"property":"border-top-width"},{"property":"border-right-width"},{"property":"border-bottom-width"},{"property":"border-left-width"},{"property":"border-top-color"},{"property":"border-right-color"},{"property":"border-bottom-color"},{"property":"border-left-color"},{"property":"border-top-style"},{"property":"border-right-style"},{"property":"border-bottom-style"},{"property":"border-left-style"},{"property":"border-radius","type":"composite","properties":[{"property":"border-top-left-radius","type":"integer","defaults":"0px","units":["px","%"],"min":0},{"property":"border-top-right-radius","type":"integer","defaults":"0px","units":["px","%"],"min":0},{"property":"border-bottom-left-radius","type":"integer","defaults":"0px","units":["px","%"],"min":0},{"property":"border-bottom-right-radius","type":"integer","defaults":"0px","units":["px","%"],"min":0}]},{"property":"border-top-left-radius","type":"integer","defaults":"0px","units":["px","%"],"min":0},{"property":"border-top-right-radius","type":"integer","defaults":"0px","units":["px","%"],"min":0},{"property":"border-bottom-left-radius","type":"integer","defaults":"0px","units":["px","%"],"min":0},{"property":"border-bottom-right-radius","type":"integer","defaults":"0px","units":["px","%"],"min":0}]},{"name":"Layout","open":false,"build":[{"property":"position","type":"radio","defaults":"static","list":[{"value":"static"},{"value":"relative"},{"value":"absolute"},{"value":"fixed"}]},{"property":"display","type":"select","defaults":"block","list":[{"value":"block"},{"value":"inline"},{"value":"inline-block"},{"value":"none"}]},{"property":"visibility"},{"property":"z-index"},{"property":"overflow-x"},{"property":"overflow-y"},{"property":"white-space"},{"property":"clip"},{"property":"float","type":"radio","defaults":"none","list":[{"value":"none"},{"value":"left"},{"value":"right"}]},{"property":"clear"},{"property":"overflow","type":"select","defaults":"visible","list":[{"value":"visible"},{"value":"hidden"},{"value":"scroll"},{"value":"auto"}]}]},{"name":"Other","open":false,"build":[{"property":"cursor","type":"select","defaults":"auto","list":[{"value":"auto"},{"value":"pointer"},{"value":"copy"},{"value":"crosshair"},{"value":"grab"},{"value":"grabbing"},{"value":"help"},{"value":"move"},{"value":"text"}]},{"property":"list-style-image"},{"property":"list-style-position"},{"property":"list-style-type"},{"property":"marker-offset"},{"property":"transition-property","type":"select","defaults":"width","list":[{"value":"all"},{"value":"width"},{"value":"height"},{"value":"background-color"},{"value":"transform"},{"value":"box-shadow"},{"value":"opacity"}]},{"property":"transition-duration","type":"integer","defaults":"2","units":["s"],"min":0},{"property":"transition-timing-function","type":"select","defaults":"ease","list":[{"value":"linear"},{"value":"ease"},{"value":"ease-in"},{"value":"ease-out"},{"value":"ease-in-out"}]},{"property":"perspective","type":"integer","defaults":0,"units":["px"],"min":0},{"property":"transform-rotate-x","type":"integer","defaults":0,"units":["deg"],"functionName":"rotateX"},{"property":"transform-rotate-y","type":"integer","defaults":0,"units":["deg"],"functionName":"rotateY"},{"property":"transform-rotate-z","type":"integer","defaults":0,"units":["deg"],"functionName":"rotateZ"},{"property":"transform-scale-x","type":"integer","defaults":1,"functionName":"scaleX"},{"property":"transform-scale-y","type":"integer","defaults":1,"functionName":"scaleY"},{"property":"transform-scale-z","type":"integer","defaults":1,"functionName":"scaleZ"}]}] });