var gulp = require('gulp')
var config = require('../config')
var utils = require('../utils')

var gulpif = require('gulp-if')
var mergestream = require('merge-stream')
var concat = require('gulp-concat')

gulp.task('script', function () {
	var ss = []
	utils.eachObj(config.script.normal, function (src, dist) {
		var s = gulp.src(utils.getSrc(src), {
				base: dist === '*' && config.src || ''
			})
			.pipe(gulpif(dist !== '*', concat(dist)))
			.pipe(gulp.dest(config.dev))
		ss.push(s)
	})
	return mergestream.apply(gulp, ss)
})
