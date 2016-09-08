var gulp = require('gulp')
var config = require('../config')
var utils = require('../utils')

gulp.task('img', function () {
	var imgConfig = utils.parseConfig(config.img)
	var ret = gulp.src(utils.getSrc(imgConfig.src, config.src), {
		base: config.src
	})
	if (imgConfig.plugins && imgConfig.plugins.length) {
		// 如果有插件 则继续pipe
		imgConfig.plugins.forEach(function (plugin) {
			ret = ret.pipe(plugin(imgConfig, config, utils))
		})
	} else {
		// 没有插件 走默认 去掉了imgmin
	}
	return ret
		.pipe(gulp.dest(config.dev))
})
