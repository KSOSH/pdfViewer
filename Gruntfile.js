module.exports = function(grunt) {
	var fs = require('fs'),
		chalk = require('chalk'),
		uniqid = function () {
			var md5 = require('md5');
			result = md5((new Date()).getTime()).toString();
			grunt.verbose.writeln("Generate hash: " + chalk.cyan(result) + " >>> OK");
			return result;
		};
	
	String.prototype.hashCode = function() {
		var hash = 0, i, chr;
		if (this.length === 0) return hash;
		for (i = 0; i < this.length; i++) {
			chr   = this.charCodeAt(i);
			hash  = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	};
	const NpmImportPlugin = require("less-plugin-npm-import");
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);
	var gc = {
		assets: "dist/viewer/pdf_viewer"
	}
	grunt.initConfig({
		globalConfig : gc,
		pkg : grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: "\n",
			},
			main: {
				src: [
					'src/js/main.js'
				],
				dest: 'test/js/main.js'
			},
			app: {
				src: [
					'bower_components/jquery/dist/jquery.js',
					'bower_components/fancybox/dist/jquery.fancybox.js',
					'src/js/app.js'
				],
				dest: 'test/js/app.js'
			},
			viewer: {
				src: [
					'src/js/pdfviewer.js'
				],
				dest: 'dist/viewer/pdf_viewer/pdf.js/web/pdfviewer.js'
			}
		},
		uglify: {
			options: {
				sourceMap: false,
				compress: {
					drop_console: false
	  			}
			},
			app: {
				files: [
					{
						expand: true,
						flatten : true,
						src: [
							'test/js/main.js'
						],
						dest: '<%= globalConfig.assets %>',
						filter: 'isFile',
						rename: function (dst, src) {
							return dst + '/' + src.replace('.js', '.min.js');
						}
					},
					{
						expand: true,
						flatten : true,
						src: [
							'test/js/app.js'
						],
						dest: 'dist',
						filter: 'isFile',
						rename: function (dst, src) {
							return dst + '/' + 'pdftest.js';
						}
					}
				]
			}
		},
		less: {
			app: {
				options : {
					compress: false,
					ieCompat: false,
					plugins: [
						new NpmImportPlugin({prefix: '~'})
					],
					modifyVars: {
						'hashes': '\'' + uniqid() + '\''
					}
				},
				files : {
					'test/css/main.css' : [
						'src/less/main.less'
					],
					'test/css/test.css' : [
						'bower_components/fancybox/dist/jquery.fancybox.css',
						'src/less/test.less'
					]
				}
			}
		},
		autoprefixer:{
			options: {
				browsers: [
					"last 4 version"
				],
				cascade: true
			},
			app: {
				files: {
					'test/css/prefix.main.css' : [
						'test/css/main.css'
					],
					'test/css/prefix.test.css' : [
						'test/css/test.css'
					]
				}
			}
		},
		group_css_media_queries: {
			app: {
				files: {
					'test/css/media/main.css': ['test/css/prefix.main.css'],
					'test/css/media/test.css': ['test/css/prefix.test.css']
				}
			}
		},
		replace: {
			app: {
				options: {
					patterns: [
						{
							match: /\/\*.+?\*\//gs,
							replacement: ''
						},
						{
							match: /\r?\n\s+\r?\n/g,
							replacement: '\n'
						}
					]
				},
				files: [
					{
						expand: true,
						flatten : true,
						src: [
							'test/css/media/main.css'
						],
						dest: 'test/css/replace/',
						filter: 'isFile'
					},
					{
						expand: true,
						flatten : true,
						src: [
							'test/css/media/test.css'
						],
						dest: 'test/css/replace/',
						filter: 'isFile'
					}
				]
			}
		},
		cssmin: {
			options: {
				mergeIntoShorthands: false,
				roundingPrecision: -1
			},
			app: {
				files: {
					'<%= globalConfig.assets %>/main.min.css' : ['test/css/replace/main.css'],
					'dist/pdftest.css' : ['test/css/replace/test.css'],
					'dist/viewer/pdf_viewer/pdf.js/web/pdfviewer.css': ['src/less/pdfviewer.css']
				}
			}
		},
		pug: {
			app: {
				options: {
					doctype: 'html',
					client: false,
					pretty: '\t',
					separator:  '\n',
					data: function(dest, src) {
						return {
							"hash": uniqid()
						}
					}
				},
				files: [
					{
						expand: true,
						cwd: __dirname + '/src/pug/',
						src: [ '*.pug' ],
						dest: __dirname + '/dist/viewer/pdf_viewer/',
						ext: '.html'
					},
					{
						expand: true,
						cwd: __dirname + '/src/pug/pug/',
						src: [ '*.pug' ],
						dest: __dirname + '/dist/',
						ext: '.html'
					},
					{
						expand: true,
						cwd: __dirname + '/src/pug/',
						src: [ '*.pug' ],
						dest: __dirname + '/dist/viewer/pdf_viewer/',
						ext: '.php'
					},
					{
						expand: true,
						cwd: __dirname + '/src/pug/pug/',
						src: [ '*.pug' ],
						dest: __dirname + '/dist/',
						ext: '.php'
					},
				]
			},
		},
		copy: {
			main: {
				expand: true,
				cwd: 'src/pdf.js',
				src: '**',
				dest: 'dist/viewer/pdf_viewer/pdf.js/',
			},
		},
	});
	grunt.registerTask('default', [
		'copy',
		'concat',
		'uglify',
		'less',
		'autoprefixer',
		'group_css_media_queries',
		'replace',
		'cssmin',
		'pug'
	]);
}