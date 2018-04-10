module.exports = function(grunt) {

    'use strict';

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        /**
         * https://github.com/gyandeeps/gruntify-eslint
         */
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            src: ['Gruntfile.js', 'jquery.jscroll.js']
        },

        /**
         * https://github.com/gruntjs/grunt-contrib-uglify
         */
        uglify: {
            options: {
                output: {
                    comments: 'some'
                }
            },
            jscroll: {
                files: {
                    'dist/jquery.jscroll.min.js': [
                        'jquery.jscroll.js'
                    ]
                }
            }
        }

    });

    grunt.loadNpmTasks('gruntify-eslint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['eslint', 'uglify']);
};