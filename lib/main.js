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
		gulp.start(task)
	}
}