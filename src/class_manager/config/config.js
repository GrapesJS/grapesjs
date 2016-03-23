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

	};
});