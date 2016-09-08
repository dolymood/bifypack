var gulp = require('gulp')
var config = require('../config')
var utils = require('../utils')
var browserSync = require('./browserSync')

var replace = require('gulp-replace')
var RevAll = require('gulp-rev-all')
var through = require('through2')
var mergestream = require('merge-stream')
var path = require('path')
var gulpif = require('gulp-if')

gulp.task('html', function () {
	var bundleMap
	if (config.script.browserify.bundle) {
		try {
			bundleMap = require(process.cwd() + '/' + config.bundleMapFile)
		} catch (e) {}
	}
	var htmlConfig = utils.parseConfig(config.html)
	var st = gulp.src(utils.getSrc(htmlConfig.src), {
		base: config.src
	})
	// 需要首先走替换逻辑
	// 以防有插件做了html压缩这样的事情
	if (config.placeholder.script) {
		utils.eachObj(config.placeholder.script, function (rep, reg) {
			st = st.pipe(replace(reg, function (search, file) {
				return createScript(rep, file)
			}))
		})
	}
	if (config.placeholder.style) {
		utils.eachObj(config.placeholder.style, function (rep, reg) {
			st = st.pipe(replace(reg, function (search, file) {
				return createStyle(rep, file)
			}))
		})
	}

	if (htmlConfig.plugins && htmlConfig.plugins.length) {
		// 如果有插件 则继续pipe
		htmlConfig.plugins.forEach(function (plugin) {
			st = st.pipe(plugin(htmlConfig, config, utils))
		})
	} else {
		// 没有插件 走默认
	}

	// 最后做rev替换操作
	var revsMap = {}
	var htmls = []
	st = st
		.pipe(gulp.dest(config.dev))
		.pipe(through.obj(function (file, enc, callback) {
			htmls.push(file)
			callback(null, file)
		}, function (callback) {
			if (bundleMap) {
				var ss = []
				utils.eachObj(bundleMap, function (fss, commonName) {
					var revAll = new RevAll({
						dontRenameFile: [/^\/favicon.ico$/g, '.html'],
						replacer: function (fragment, replaceRegExp, newReference, referencedFile) {
							revsMap[fragment.contents] = replaceRegExp
						}
					})
					var s = gulp.src(fss.map(function (source_rc) {
							return config.dev + source_rc
						}))
						.pipe(through.obj(function (a, b, c) {
							this.push(a)
							htmls.forEach(function (htm) {
								this.push(htm)
							}, this)
							c()
						}))
						.pipe(revAll.revision())
						.pipe(gulpif('*.html', through.obj(function (file, enc, callback) {
							var contents = String(file.contents)
							var r = revsMap[contents]
							if (r) {
								var a = contents.replace(r, function (m) {
									var p = path.relative(path.dirname(file.path), config.dev + commonName)
									p = p.replace(/\\/g, '/')
									return '"' + p + '"></script><script src=' + m
								})
								file.contents = new Buffer(a)
							}
							callback(null, file)
						})))
						.pipe(gulpif('*.html', gulp.dest(config.dev)))

					ss.push(s)
				})
				if (ss.length) {
					mergestream.apply(gulp, ss).on('finish', function () {
						callback()
						htmls.length = 0
					})
				} else {
					callback()
				}
			} else {
				callback()
			}
		}))
		.pipe(browserSync.stream({once: true}))

	return st

	function createScript (src, file) {
		return utils.createTag(src, file, function (p) {
			return '<script src="' + p + '"></script>'
		})
	}
	function createStyle (src, file) {
		return utils.createTag(src, file, function (p) {
			return '<link rel="stylesheet" type="text/css" href="' + p + '">'
		})
	}
})
