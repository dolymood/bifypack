var gulp = require('gulp')
var requireDir = require('require-dir')
var assign = require('lodash.assign')

module.exports = {
	run: function (task) {
		if (!task) {
			task = 'default'
		}
		var config = require(process.cwd() + '/bifypackfile')
		var defConfig = require('./_gulps/config')
		assign(defConfig, config)

		requireDir('./_gulps/tasks', {recurse: true})
		logEvents(gulp.start(task))
	}
}

var gutil = require('node_modules/gulp/node_modules/gulp-util/index')
var chalk = require('node_modules/gulp/node_modules/chalk/index')
var prettyTime = require('node_modules/gulp/node_modules/pretty-hrtime/index')
// form gulp
function logEvents (gulpInst) {
	gulpInst.on('task_start', function (e) {
		// TODO: batch these
		// so when 5 tasks start at once it only logs one time with all 5
		gutil.log('Starting', '\'' + chalk.cyan(e.task) + '\'...')
	})

	gulpInst.on('task_stop', function (e) {
		var time = prettyTime(e.hrDuration)
		gutil.log(
			'Finished', '\'' + chalk.cyan(e.task) + '\'',
			'after', chalk.magenta(time)
		)
	})

	gulpInst.on('task_err', function (e) {
		var msg = formatError(e)
		var time = prettyTime(e.hrDuration)
		gutil.log(
			'\'' + chalk.cyan(e.task) + '\'',
			chalk.red('errored after'),
			chalk.magenta(time)
		)
		gutil.log(msg)
	})

	gulpInst.on('task_not_found', function (err) {
		gutil.log(
			chalk.red('Task \'' + err.task + '\' is not in your gulpfile')
		)
		gutil.log('Please check the documentation for proper gulpfile formatting')
		process.exit(1)
	})
}

// Format orchestrator errors
function formatError (e) {
	if (!e.err) {
		return e.message
	}

	// PluginError
	if (typeof e.err.showStack === 'boolean') {
		return e.err.toString()
	}

	// Normal error
	if (e.err.stack) {
		return e.err.stack
	}

	// Unknown (string, number, etc.)
	return new Error(String(e.err)).stack
}
