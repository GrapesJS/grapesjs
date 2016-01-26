define(function () {
	return {
		// Enable/Disable autosaving
		autosave 			: 1,

		// Indicates which storage to use. Available: local | remote
		storageType			: 'local',

		// If autosave enabled, indicates how many changes (general changes to structure)
		// need to be done before save. Useful with remoteStorage to reduce remote calls
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