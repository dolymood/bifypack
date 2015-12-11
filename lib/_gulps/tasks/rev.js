var gulp = require('gulp')
var config = require('../config')

var RevAll = require('gulp-rev-all')
var path = require('path')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')
var gulpif = require('gulp-if')

gulp.task('rev', ['clean', 'static'], function () {
	var prefix = config.prefix
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
			fragment.contents = fragment.contents.replace(replaceRegExp, function(m, pre, path, extension, aft) {
				if (~exts.indexOf(extension)) {
					newReference = path
				}
				if (!extension && !externals[m]) {
					newReference = path
				}
				return pre + newReference + extension + aft	
			})
			if (prefix) {
				// todo
			}
		}
	})

	return gulp.src(config.dev + '**', {
			base: config.dev
		})
		.pipe(gulpif('*.js', sourcemaps.init()))
		.pipe(gulpif('*.js', uglify()))
		.pipe(gulpif('*.js', sourcemaps.write('./', {
			includeContent: true
		})))
		.pipe(revAll.revision())
		.pipe(gulp.dest(config.product))
})
