# bifypack

基于[gulp](http://gulpjs.com/)和[browserify](http://browserify.org/)的项目构建工具，名字设想很简单，取`browserify`和`webpack`的结合。

## 安装使用

全局安装：

```
npm install -g bifypack
```

然后在项目根目录下创建一个`bifypackfile`的`js`文件，如同`gulp`的初始化`gulpfile.js`一样，该文件就是构建配置文件。

有了配置文件，然后就是执行了，`bifypack`是依赖于`gulp`的，也是基于任务式的，但是非编程。目前执行很简单：

```
bifypack <task>
```

下面就看默认提供的`task`。

## task

基础`task`：

* `eslint`: 利用[eslint](https://github.com/eslint/eslint)做语法检查，规则文件就是项目根目录下的`.eslintrc`文件，参考<http://eslint.org/docs/user-guide/configuring#using-configuration-files>

* `browserify`: [browserify](http://browserify.org/) task，主要根据配置文件中指定入口文件转为可以在浏览器中执行的代码，如果配置了`bundle`，还会根据规则利用[factor-bundle](https://github.com/substack/factor-bundle)插件生成公共代码。

* `watchify`: 利用[watchify](https://www.npmjs.com/package/watchify)提升`browserify`编译效率。

* `clean`: 清空配置文件中指定的`product`目录内容。

* `cleanDev`: 清空配置文件中指定的`dev`目录内容。

* `html`: 主要把配置的`html`文件复制到配置的`dev`目录下；同时这个过程还会将`placeholder`中的规则做替换生成标签插入到html中，还会把利用[factor-bundle](https://github.com/substack/factor-bundle)插件生成公共代码插入到html中。

* `img`: 主要是将配置的`img`资源复制到配置的`dev`目录下，同时会利用[gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin)来压缩图片。

* `style`: 将指定的入口css文件利用[gulp-minify-css](https://www.npmjs.com/package/gulp-minify-css)压缩，然后复制到配置的`dev`目录下，同时会增加`.map`文件，便于开发调试。一般会配合用于将html文件中的占位符替换为`<link rel="stylesheet">`标签。

* `script`: 将指定的浏览器可以直接执行的代码复制（合并）到配置的`dev`目录下，一般会配合用于将html文件中的占位符替换为`<script>`标签。

集成`task`：

* `static`: 也是默认`default`的`task`，执行`browserify`, `html`, `style`, `img`, `script`任务task。

* `watch`: 主要watch执行`html`, `style`, `img`任务，以及`watchify`任务。

* `reload`: 主要利用`watch`task和[browser-sync](http://www.browsersync.io/)实现便利开发。

* `rev`: 会先执行`static`任务，把文件编译到指定`dev`目录，然后将指定`dev`目录下的文件利用[gulp-rev-all](https://www.npmjs.com/package/gulp-rev-all)给文件名增加hash值且替换引用地址；将最终结果编译到指定的`product`目录。

对于一般开发而言，只需要在开发时执行`bifypack reload`，就可以很方便的开一个服务进行开发了。如果需要增加hash值，编译至指定`product`目录的话，则只需要执行`bifypack rev`就好了。

## bifypackfile

这个是`bifypack`的配置文件，这里主要来看一个示例：

```js
var path = require('path')

var src = 'src/'
var dev = 'dev/' // 加入到 .gitignore
var product = 'dist/' // 加入到 .gitignore
var bundleMapFile = 'bifypack.bundleMap.json' // 加入到 .gitignore
var externals = {
	jquery: '$'
}
var sexts = ['gif', 'png', 'jpg', 'jpeg'].join(',')

var config = {
	src: src, // 源目录 默认 src/
	dev: dev, // 开发目录 默认 dev/
	product: product, // 生产目录 默认 dist/
	bundleMapFile: bundleMapFile, // 默认bifypack.bundleMap.json，这个比较特殊，如果说利用factor-bundle插件生成公共代码文件的话，才会生成这个文件，主要是为了在html中增加新生成的这个公共代码文件的`<script>`标签

	rev: { // gulp-rev-all的配置，这些文件不重命名
		dontRenameFile: ['.html', '.map', '.jpg', '.jpeg', '.png', '.gif']
	},
	script: { // js相关

		eslint: ['pages/**/*.js', 'common/**/*.js', 'components/**/*.js'], // 检查

		browserify: { // browserify配置

			src: ['pages/home/*.js'], // 不考虑利用 factor-bundle 来生成公共文件的入口文件

			bundle: { // factor-bundle 生成公共文件 apps/xx/common.js
			 	'apps/xx/common.js': 'apps/xx/*/*.js'
			},

			externals: externals, // browserify.externals 以及 exposify transform的expose
			
			/**plugins和transforms都需要增加到自己项目的依赖中**/
			// https://www.npmjs.com/browse/keyword/browserify-plugin
			plugins: [ // 插件
				'bundle-collapser/plugin',

				// 还可以：
				{
					name: 'xx',
					options: {
						xxx: 'xxx'
					}
				}
			],

			// https://github.com/substack/node-browserify/wiki/list-of-transforms
			transforms: [ // transforms
				{
					name: 'exposify',
					options: {
						expose: externals
					}
				},
				{
					name: 'node-lessify', // 这个是dolymood/node-lessify版本，主要解决插入到页面上的css中的图片路径问题，如果是绝对路径则使用默认node-lessify即可
					options: {
						root: path.join(process.cwd(), src), // dolymood/node-lessify的配置
						prefix: '/' // dolymood/node-lessify的配置
					}
				},
				'partialify' // partialify transform，注意和其他transform的冲突，例如 cssify browserify-css 等
			]

		},

		normal: { // 正常的通过script任务执行的，主要操作是复制，合并，重命名
			'lib/jquery.js': 'lib/jquery/*.js',
			'lib/jquery-ui.js': 'lib/jquery-ui/*.js',
			'lib/avalon.js': 'lib/avalon/avalon.js',
			'lib/avalon.ui.js': ['lib/mmstate/*.js', 'lib/oniui/*.js']
		}

	},

	placeholder: { // html中的占位符替换规则，替换为对应的script标签或者link标签，都为js或css的各个入口文件
		script: {
			// <!--SCRIPT_LIB_PLACEHOLDER--> 的结果就是 加入四个script标签，相对地址会做处理
			'<!--SCRIPT_LIB_PLACEHOLDER-->': [
				'lib/jquery.js',
				'lib/jquery-ui.js',
				'lib/avalon.js',
				'lib/avalon.ui.js'
			]
		},
		style: {
			// <!--STYLE_COMMON_PLACEHOLDER--> 的结果就是 加入n个link标签，相对地址同样会做处理
			'<!--STYLE_COMMON_PLACEHOLDER-->': [
				'lib/**/*.css',
				'common/common.css'
			]
		}
	},

	html: ['*.html'], // html任务指定源
	style: [ // style任务指定源
		'common/common.css',
		'lib/**/*.css',
		'pages/**/*.css'
	],
	img: [ // img任务指定源
		'favicon.ico',
		'lib/**/*.{' + sexts + '}',
		'components/**/*.{' + sexts + '}',
		'pages/**/*.{' + sexts + '}'
	]
}

module.exports = config

```

## 后续

目前只是支持基础的一些配置，还有额外的很多配置；目前还可以通过自建额外`task`的方式进行增强：

1. 在项目根目录下执行`npm link bifypack`

2. 在某目录下修改原有的task

```js
// 放在tasks目录下的其中task文件
var marked = require('gulp-marked')
var bifypack = require('bifypack')
var gulp = bifypack.gulp
gulp.task('marked', ['static'], function () {
	return gulp.src(bifypack.config.src + bifypack.config.marked)
		.pipe(marked())
		.pipe(gulp.dest(bifypack.config.dev))
})
```

然后这样执行`bifypack marked -e tasks`即可，`tasks`也就是目录名。
