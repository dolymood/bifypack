var gulp = require('gulp')
var config = require('../config')
var utils = require('../utils')

gulp.task('watch', ['watchify'], function () {
	gulp.start('html', 'style', 'img', 'script')
	gulp.watch(utils.getSrc(config.html), ['html'])
	gulp.watch(utils.getSrc(config.style), ['style'])
	gulp.watch(utils.getSrc(config.img), ['img'])
})
