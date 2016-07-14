define(function () {
	return {

    // Style prefix
    stylePrefix     : 'clm-',

    // Default classes
    defaults : [],

    // Label for classes
    label: 'Classes',

    // Label for states
    statesLabel: '- State -',

    // States
    states: [
        { name: 'hover', label: 'Hover' },
        { name: 'active', label: 'Click' },
        { name: 'nth-of-type(2n)', label: 'Even/Odd' }
    ],

    // Media queries
    medias: [
        { name: 'Desktop', width: ''},
        { name: 'Tablet', width: '991px' },
        { name: 'Mobile landscape', width: '767px' },
        { name: 'Mobile portrait', width: '479px' },
    ],

	};
});