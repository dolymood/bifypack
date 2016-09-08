var config = require('./config')
var assign = require('lodash.assign')
var globby = require('globby')
var path = require('path')

module.exports = {
	assign: assign,
	eachObj: eachObj,
	getSrc: getSrc,
	browserifyOptions: browserifyOptions,
	createTag: createTag,
	parseConfig: parseConfig
}

function parseConfig (config) {
	if (Array.isArray(config)) {
		return {
			src: config,
			plugins: []
		}
	}
	return config
}

function createTag (src, file, createFn) {
	if (typeof src === 'string') {
		src = [src]
	}
	var ret = []
	var fpath = path.dirname(file.path)
	src.map(function (targets) {
		targets = globby.sync(getSrc(targets), {
			nonull: true
		})
		targets.map(function (s) {
			var p = path.relative(fpath, s)
			p = p.replace(/\\/g, '/')
			ret.push(createFn(p))
		})
	})
	return ret.join('')
}

function eachObj (obj, cb, context) {
	for (var k in obj) {
		if (false === cb.call(context, obj[k], k)) {
			break
		}
	}
}

function getSrc (src, relative) {
	if (typeof src === 'string') {
		return [getS(src)]
	}
	return src.map(function (s) {
		return getS(s)
	})

	function getS(s) {
		if (s.charAt(0) === '!') {
			return s.substr(1)
		}
		return (relative || config.src) + s
	}
}

function browserifyOptions (val, b) {
	if (typeof val === 'string') {
		return {
			name: val
		}
	}
	return val
}
