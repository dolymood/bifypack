var gulp = require('gulp')
var config = require('../config')
var utils = require('../utils')

var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var browserify = require('browserify')
var watchify = require('watchify')
var globby = require('globby')
var through = require('through2')
var browserSync = require('./browserSync')
var fs = require('fs')
var mergestream = require('merge-stream')
var path = require('path')
var collapser = require('bundle-collapser/plugin')
var exposify = require('exposify')
var factorbundle = require('factor-bundle')
var externals = config.script.browserify.externals || {}

var _browserifyTask = function (devMode, entries, bubbleName, bundleMap) {
	var targets
	if (!bundleMap) {
		if (!bubbleName) {
			targets = globby.sync(utils.getSrc(entries))
			var ret = []
			targets.forEach(function (target) {
				ret.push(_browserifyTask(devMode, target, target.replace(config.src, '')))
			})
			return ret
		} else {
			targets = [entries]
		}
	} else {
		targets = globby.sync(utils.getSrc(entries))
	}
	
	var opts = {
		entries: targets,
		debug: !!devMode
	}
	var b
	if (devMode) {
		// https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md
		opts = utils.assign({}, watchify.args, opts)
		b = browserify(opts)
		b = watchify(b)
		b.on('update', bundle)
	} else {
		b = browserify(opts)
	}

	b.external(Object.keys(externals))

	if (bundleMap) {
		b.plugin(factorbundle, {
			outputs: function () {
				// 必须函数 否则出错
				// https://github.com/substack/factor-bundle/pull/75
				return targets.map(function (t) {
					t = source(t.replace(config.src, ''))
					t.pipe(gulp.dest(config.dev))
					return t
				})
			}
		})
	}
	b.plugin(collapser)
	config.script.browserify.plugins && config.script.browserify.plugins.forEach(function (name) {
		var p = utils.browserifyOptions(name, b)
		b.plugin(p.name, p.options)
	})

	b.transform(exposify, {
		expose: externals
	})
	config.script.browserify.transforms && config.script.browserify.transforms.forEach(function (name) {
		var p = utils.browserifyOptions(name, b)
		b.transform(p.name, p.options)
	})
	
	return bundle()

	function bundle () {
		var r = b.bundle()

		if (bundleMap) {
			if (targets.length > 1) {
				r = r
					.pipe(source(bubbleName))
					.pipe(buffer())
					.pipe(through.obj(function (file, enc, callback) {
						if (file.isNull()) {
							return callback(null, file)
						}
						if (file.isStream() || file.isBuffer()) {
							var contents = String(file.contents)
							if (contents.indexOf('require=') === 0) {
								targets.forEach(function (n) {
									if (!bundleMap[bubbleName]) {
										bundleMap[bubbleName] = []
									}
									bundleMap[bubbleName].push(n.replace(config.src, ''))
								})
								// 有公共模块
								return callback(null, file)
							} else {
								return callback()
							}
						}
						callback(null, file)
					}))
					.pipe(gulp.dest(config.dev))
			}
		} else {
			r = r
				.pipe(source(bubbleName))
				.pipe(buffer())
				.pipe(gulp.dest(config.dev))
		}
		
		if (devMode) {
			r = r.pipe(browserSync.stream({once: true}))
		}
		return r
	}
}

var browserifyTask = function (devMode) {
	var ss = []
	var bundleMap = {}
	var src = config.script.browserify.src
	var bundleConfig = config.script.browserify.bundle || {}
	var hasBubble = Object.keys(bundleConfig).length > 0

	if (hasBubble) {
		utils.eachObj(bundleConfig, function (entries, name) {
			ss.push(_browserifyTask(devMode, entries, name, bundleMap))
		})
	}
	src && ss.push.apply(ss, _browserifyTask(devMode, src))

	return mergestream.apply(gulp, ss).pipe(writeMapFile())
	
	function writeMapFile () {
		return through.obj(function (file, enc, callback) {
			callback(null, file)
		}, function (callback) {
			if (hasBubble) {
				fs.writeFileSync(process.cwd() + '/' + config.bundleMapFile, JSON.stringify(bundleMap))
			}
			callback()
		})
	}
}

gulp.task('browserify', function () {
	return browserifyTask()
})

module.exports = browserifyTask
