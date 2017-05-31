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
        }

    });

    grunt.loadNpmTasks('gruntify-eslint');
    grunt.registerTask('default', ['eslint']);
};