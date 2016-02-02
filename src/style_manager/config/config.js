define(function () {
	return {

		stylePrefix		 : 'sm-',

    // Default sectors, which could include also properties
    //
    // Example:
    // sectors: [{
    //    name: 'Some sector name',
    //    properties:[{
    //        name      : 'Width',
    //        property  : 'width',
    //        type      : 'integer',
    //        units     : ['px','%'],
    //        defaults  : 'auto',
    //        min       : 0,
    //    }],
    // }]
		sectors			   : [],

    // Text to show in case no element selected
    textNoElement  : 'Select element before using Style Manager',

	};
});