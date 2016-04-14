var gulp = require('gulp')

gulp.task('_static', ['cleanDev'], function (callback) {
	gulp.start('browserify').on('task_stop', function (e) {
		if (e.task === 'browserify') {
			callback()
		}
	})
})

gulp.task('static', ['_static'], function (callback) {
	var tasks = ['html', 'style', 'img', 'script', 'copy']
	var len = tasks.length
	var tasksMap = {}
	tasks.forEach(function (n) {
		tasksMap[n] = 1
	})
	var a = gulp.start.apply(gulp, tasks)
	a.on('task_stop', function (e) {
		if (tasksMap[e.task]) {
			len -= 1
			if (len === 0) {
				callback()
			}
		}
	})
})
