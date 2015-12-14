var gulp = require('gulp')
var config = require('../config')
var utils = require('../utils')

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
	var exts = config.rev.dontRenameFile
	// var dontRename = [/^\/favicon.ico$/g, ]
	var revAll = new RevAll({
		dontRenameFile: exts,
		transformFilename: function (file, hash) {
			var ext = path.extname(file.path)
			return path.basename(file.path, ext) + '_' + hash.substr(0, 5) + ext
		},
		replacer: function (fragment, replaceRegExp, newReference, referencedFile) {
			var externals = config.script.browserify.externals
			fragment.contents = fragment.contents.replace(replaceRegExp, function(m, pre, _path, extension, aft) {
				if (~exts.indexOf(extension)) {
					newReference = _path
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

	return gulp.src(config.dev + '**', {
			base: config.dev
		})
		.pipe(gulpif('*.js', sourcemaps.init()))
		.pipe(gulpif('*.js', uglify()))
		.pipe(revAll.revision())
		.pipe(gulpif('*.js', sourcemaps.write('./', {
			includeContent: true
		})))
		.pipe(gulp.dest(config.product))
})
