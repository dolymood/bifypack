var gulp = require('gulp')
var requireDir = require('require-dir')
var assign = require('lodash.assign')
var gutil = require('gulp-util')
var chalk = require('chalk')
var prettyTime = require('pretty-hrtime')
var path = require('path')
var defConfig = require('./_gulps/config')

module.exports = {
	gulp: gulp,
	config: defConfig,
	run: function (task, options) {
		if (!task) {
			task = 'default'
		}
		var cwd = process.cwd()
		var config = require(cwd + '/bifypackfile')
		var scriptConfig = config.script
		delete config.script
		var revConfig = config.rev
		delete config.rev
		assign(defConfig, config)
		var defScript = defConfig.script
		// 处理 script
		if (scriptConfig) {
			// eslint
			if (scriptConfig.eslint) {
				defScript.eslint = scriptConfig.eslint
			}
			// normal
			if (scriptConfig.normal) {
				defScript.normal = scriptConfig.normal
			}
			// browserify
			if (scriptConfig.browserify) {
				assign(defScript.browserify, scriptConfig.browserify)
			}
		}
		// 处理rev
		if (revConfig) {
			assign(defConfig.rev, revConfig)
		}
		requireDir('./_gulps/tasks', {recurse: true})
		var extension = options.extension
		if (extension) {
			extension = path.join(cwd, extension)
			requireDir(extension, {recurse: true})
		}
		logEvents(gulp.start(task))
	}
}

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
