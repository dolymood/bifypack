var gulp = require('gulp')
var config = require('../config')

var clean = require('gulp-clean')
gulp.task('cleanDev', function () {
	return gulp.src(config.dev + '*', {
			read: false
		})
		.pipe(clean())
})
