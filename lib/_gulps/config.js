var path = require('path')

var src = 'src/'
var dev = 'dev/' // 需要加入到 .gitignore
var product = 'dist/' // 需要加入到 .gitignore
var prefix = 'http://s.xx.com'
var bundleMapFile = 'bifypack.bundleMap.json' // 需要加入到 .gitignore
var externals = {}
var config = {
	src: src,
	dev: dev,
	product: product,
	prefix: prefix, // todo rev-all
	bundleMapFile: bundleMapFile,

	script: {

		eslint: [],

		browserify: {

			src: [], // 不考虑利用 factor-bundle 来生成公共文件的入口文件

			// bundle: { // factor-bundle
			// 	'apps/warning/common/common.js': 'apps/warning/*/*.js'
			// },

			externals: externals, // browserify.externals & exposify.expose

			// https://www.npmjs.com/browse/keyword/browserify-plugin
			plugins: [],

			// https://github.com/substack/node-browserify/wiki/list-of-transforms
			transforms: []

		},

		normal: { // lib & some require
		}

	},

	placeholder: {},

	html: [], // html tasks
	style: {
		src: []
	},
	img: []
}

module.exports = config
