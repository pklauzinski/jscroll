module.exports = function(grunt) {

    'use strict';

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        /**
         * https://github.com/gruntjs/grunt-contrib-jshint
         */
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                newcap: false,
                es3: true,
                forin: true,
                indent: 4,
                unused: 'vars',
                strict: true,
                trailing: true,
                quotmark: 'single',
                latedef: true,
                globals: {
                    jQuery: true
                }
            },
            files: {
                src: ['Gruntfile.js', 'jquery.jscroll.js']
            }
        },

        /**
         * https://github.com/gruntjs/grunt-contrib-uglify
         */
        uglify: {
            options: {
                preserveComments: 'some'
            },
            jscroll: {
                files: {
                    'jquery.jscroll.min.js': [
                        'jquery.jscroll.js'
                    ]
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['jshint', 'uglify']);
};