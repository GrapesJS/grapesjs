define(function () {
	return {
		stylePrefix		: 'comp-',

		wrapperId			: 'wrapper',

		// Default wrapper configuration
		wrapper			: {
			removable : false,
			copyable	: false,
			stylable	: ['background','background-color','background-image', 'background-repeat','background-attachment','background-position'],
			movable		: false,
			badgable	: false,
			components: [],
		},

		// Could be used for default components
		components: [],

		rte					: {},

		em					: {},

		// Class for new image component
		imageCompClass	: 'fa fa-picture-o',

		// Open assets manager on create of image component
		oAssetsOnCreate	: true,
	};
});