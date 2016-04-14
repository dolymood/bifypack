var gulp = require('gulp')
var config = require('../config')
var utils = require('../utils')
var gutil = require('gulp-util')
var chalk = require('chalk')

var RevAll = require('gulp-rev-all')
var path = require('path')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')
var gulpif = require('gulp-if')

var prefix = config.rev.prefix
var prefixMap

if (prefix) {
	prefixMap = {}
	if (typeof prefix === 'string') {
		prefixMap['*'] = prefix
	} else {
		utils.eachObj(prefix, function (pre, ex) {
			if (~ex.indexOf('{')) {
				// 有{
				var p = ex.match(/^[^\{]+/)
				ex = ex.match(/\{[^\}]+\}/)
				if (ex) {
					ex = ex[0].match(/[^\{,\}]+/g)
					if (ex) {
						ex.forEach(function (v) {
							prefixMap[p + v] = pre
						})
					}
				}
			} else {
				prefixMap[ex] = pre
			}
		})
	}	
}
if (prefixMap && Object.keys(prefixMap) < 1) {
	prefixMap = undefined
}

gulp.task('rev', ['clean', 'static'], function () {
	var dontRenameFile = config.rev.dontRenameFile || []
	var manifest = config.rev.manifest
	var dontRenameFileReg = dontRenameFile.map(function (dontRename) {
		if (dontRename instanceof RegExp) {
			return dontRename
		}
		return new RegExp(dontRename + '$', 'ig')
	})
	var revAll = new RevAll({
		dontRenameFile: dontRenameFileReg,
		transformFilename: function (file, hash) {
			var ext = path.extname(file.path)
			return path.basename(file.path, ext) + '_' + hash.substr(0, 5) + ext
		},
		replacer: function (fragment, replaceRegExp, newReference, referencedFile) {
			var externals = config.script.browserify.externals
			fragment.contents = fragment.contents.replace(replaceRegExp, function(m, pre, _path, extension, aft) {
				// 存在 匹配的话 就需要重新指向
				for (var i = dontRenameFileReg.length - 1; i >= 0; i--) {
					if ((_path + extension).match(dontRenameFileReg[i])) {
						newReference = _path
						break
					}
				}
				if (!extension && !externals[m]) {
					newReference = _path
				}
				if (prefixMap && extension) {
					var allPrefix = prefixMap['*']
					var prefixU = prefixMap[extension] || allPrefix
					if (prefixU) {
						// 需要替换
						return pre + prefixU + path.relative(config.dev, referencedFile.path).replace(/\\/g, '/') + aft
					}
				}

				return pre + newReference + extension + aft	
			})
		}
	})
	var s = gulp.src(config.dev + '**', {
			base: config.dev
		})
	// 增加错误处理
	s.on('error', function (error) {
		gutil.log(chalk.cyan('Rev error:'), error.message)
	})
	s = s
		.pipe(gulpif('*.js', sourcemaps.init()))
		.pipe(gulpif('*.js', uglify()))
		.pipe(revAll.revision())
		.pipe(gulpif('*.js', sourcemaps.write('./', {
			includeContent: true
		})))
		.pipe(gulp.dest(config.product))
	if (manifest) {
		s = s
			.pipe(revAll.manifestFile())
			.pipe(gulp.dest(config.product))
	}
	return s
})
