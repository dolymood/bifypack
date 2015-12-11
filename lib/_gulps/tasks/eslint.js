var gulp = require('gulp')
var config = require('../config')
var utils = require('../utils')
var eslint = require('gulp-eslint')

gulp.task('eslint', function () {
	return gulp.src(utils.getSrc(config.script.eslint))
		.pipe(eslint({
			useEslintrc: true
		}))
		.pipe(eslint.format())
		.pipe(eslint.failOnError())
})
