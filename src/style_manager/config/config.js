define(function () {
	return {

	stylePrefix: 'sm-',

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
	sectors: [{
        name: 'General',
        open: false,
        buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
    },{
        name: 'Dimension',
        open: false,
        buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
    },{
        name: 'Typography',
        open: false,
        buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-shadow'],
        properties: [{
            property: 'text-align',
            list        : [
                {value: 'left', className: 'fa fa-align-left'},
                {value: 'center', className: 'fa fa-align-center' },
                {value: 'right', className: 'fa fa-align-right'},
                {value: 'justify', className: 'fa fa-align-justify'}
            ],
        }]
    },{
        name: 'Decorations',
        open: false,
        buildProps: ['border-radius-c', 'background-color', 'border-radius', 'border', 'box-shadow', 'background'],
    },{
        name: 'Extra',
        open: false,
        buildProps: ['transition', 'perspective', 'transform'],
    }],

    // Text to show in case no element selected
    textNoElement: 'Select an element before using Style Manager',

	};
});