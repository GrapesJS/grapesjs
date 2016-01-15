module.exports = function(grunt) {  
	
  var	appPath 	= 'bundle',
  	  	buildPath 	= 'dist',
  	  	configPath 	= 'config/require-config.js';
  
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-mocha');
  
  grunt.initConfig({
    appDir: appPath,
    builtDir: buildPath,
    pkg: grunt.file.readJSON("package.json"),
    requirejs:{
    	compile:{
    		options: {
    			mainConfigFile: 		'<%= appDir %>/' + configPath,
    			appDir: 				'<%= appDir %>',
    			dir: 					'<%= builtDir %>',
    			baseUrl: 				'./',
    			name: 					'main',
    			removeCombined: 		true,
    			findNestedDependencies: true,
    			keepBuildDir: 			true,
    			inlineText: 			true,  
    			optimize: 				'none'
    			//paths: { "jquery": "empty:" }, //try to exclude
    		}
    	}
    },
    
    jshint: {
    	all: [
    		'Gruntfile.js',
    		'<%= appDir %>/**/*.js',
    	]
    },
    
    uglify: {
    	options: {
    	      banner: 	'/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */'
    	    },
    	build:{
    		files: {
    	        '<%= builtDir %>/grapes.min.js': ['<%= builtDir %>/main.js']
    	      }
    	}
    },
    
    sass: {
        dist: {
          files: [{
              expand: true,
              cwd: 'styles/scss',
              src: ['**/*.scss'],
              dest: 'styles/css',
              ext: '.css'
          }]
        }
    },
    
    mocha: {
    	  test: {
    	    src: ['test/index.html'],
    	    options: {  log: true, },
    	  },
    },
    
    connect: {
    	/*
    	app: {
    	    options: {
    	      port: 8001,
    	      open: {
    	    	  target: 'http://localhost:8001',
    	    	  //appName: 'Firefox'	// 'Google Chrome'
    	      }
    	    }
    	},
    	*/
    	test: {
    	    options: {
    	      open: {
    	    	  target: 'http://localhost:8000/test',
    	      }
    	    }
    	}
    },
    
    watch: {
    	script: {
    		files: [ '<%= appDir %>/**/*.js' ],
    		tasks: ['jshint']
    	},
    	css: {
    		files: '**/*.scss',
    		tasks: ['sass']
    	},
    	test: {
    		files: [ 'test/specs/**/*.js' ],
    		tasks: ['mocha'],
    		options: { livereload: true }, //default port 35729
    	}
    }
    
  });
  
  /**
   * Need to copy require configs cause r.js will try to load them from the path indicated inside
   * main.js file. This is the only way I have found to do it and only for the pleasure of using separate config 
   * requirejs file.
   * */
  grunt.registerTask('before-requirejs', function() {
	    //if(grunt.file.exists(buildPath))
	    	//grunt.file.delete(buildPath);
	    grunt.file.mkdir(buildPath);
	    grunt.file.copy(appPath + '/' + configPath, buildPath + '/' + appPath + '/' + configPath);
  });
  
  grunt.registerTask('after-requirejs', function() {
	  //grunt.file.copy(buildPath + '/main.js', buildPath + '/main.min.js');
  });
  
  grunt.registerTask('dev', ['connect', 'watch']);
  
  grunt.registerTask('test', ['mocha']);
  
  grunt.registerTask('deploy', ['jshint', 'before-requirejs', 'requirejs', 'after-requirejs', 'uglify']);
  
  grunt.registerTask('default', ['dev']);
  
};