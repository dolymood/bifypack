var gulp = require('gulp')
var config = require('../config')
var utils = require('../utils')
var browserSync = require('./browserSync')

var minifyCss = require('gulp-minify-css')
var sourcemaps = require('gulp-sourcemaps')

gulp.task('style', function () {
	var styleConfig = utils.parseConfig(config.style)
	var ret = gulp.src(utils.getSrc(styleConfig.src), {
		base: config.src
	})
	.pipe(sourcemaps.init())
	if (styleConfig.plugins && styleConfig.plugins.length) {
		// 如果有插件 则继续pipe
		styleConfig.plugins.forEach(function (plugin) {
			ret = ret.pipe(plugin(styleConfig, config, utils))
		})
	} else {
		// 没有插件 走默认
		ret = ret.pipe(minifyCss())
	}
	return ret
		.pipe(sourcemaps.write('./', {
			includeContent: true
		}))
		.pipe(gulp.dest(config.dev))
		.pipe(browserSync.stream({once: true}))
})
