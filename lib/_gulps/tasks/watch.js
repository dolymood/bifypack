var gulp = require('gulp')
var config = require('../config')
var utils = require('../utils')
var browserSync = require('./browserSync')

gulp.task('watch', ['browserify'], function () {
	gulp.start('html', 'style', 'img', 'script', 'watchify')
	gulp.watch(utils.getSrc(config.html), ['html'])
	gulp.watch(utils.getSrc(config.style), ['style'])
	gulp.watch(utils.getSrc(config.img), ['img'])
})
