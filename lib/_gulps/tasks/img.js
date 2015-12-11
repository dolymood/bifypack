var gulp = require('gulp')
var config = require('../config')
var utils = require('../utils')
var imagemin = require('gulp-imagemin')

gulp.task('img', function () {
	return gulp.src(utils.getSrc(config.img, config.src), {
			base: config.src
		})
		.pipe(imagemin())
		.pipe(gulp.dest(config.dev))
})
