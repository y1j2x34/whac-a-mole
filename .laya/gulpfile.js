// v1.0.0
//是否使用IDE自带的node环境和插件，设置false后，则使用自己环境(使用命令行方式执行)
let useIDENode = process.argv[0].indexOf('LayaAir') > -1 ? true : false;
//获取Node插件和工作路径
let ideModuleDir = useIDENode ? process.argv[1].replace('gulp\\bin\\gulp.js', '').replace('gulp/bin/gulp.js', '') : '';
let workSpaceDir = useIDENode
    ? process.argv[2].replace('--gulpfile=', '').replace('\\.laya\\gulpfile.js', '').replace('/.laya/gulpfile.js', '')
    : './../';

//引用插件模块
const gulp = require(ideModuleDir + 'gulp');
const rollup = require(ideModuleDir + 'rollup');
const typescript = require(ideModuleDir + 'rollup-plugin-typescript2'); //typescript2 plugin

const browserify = require(ideModuleDir + 'browserify');
const source = require(ideModuleDir + 'vinyl-source-stream');
const tsify = require(ideModuleDir + 'tsify');
const glsl = require(ideModuleDir + 'rollup-plugin-glsl');
const watchify = useIDENode ? null : require('watchify');
const gutil = useIDENode ? null : require('gulp-util');
const browserSync = useIDENode ? null : require('browser-sync').create();
const runSequence = useIDENode ? null : require('gulp4-run-sequence');
// 如果是发布时调用编译功能，增加prevTasks
let prevTasks = '';
if (global.publish) {
    prevTasks = ['loadConfig'];
}

//使用browserify，转换ts到js，并输出到bin/js目录
gulp.task('default', gulp.series(...prevTasks, function () {
    // 发布时调用编译功能，判断是否点击了编译选项
    if (global.publish) {
        workSpaceDir = global.workSpaceDir; // 发布时调用编译，workSpaceDir使用publish.js里的变量
        let forceCompile = !fs.existsSync(path.join(workSpaceDir, 'bin', 'js', 'bundle.js')); // 发布时，并且没有编译过，则强制编译
        if (!global.config.compile && !forceCompile) {
            return;
        }
    }

    return rollup
        .rollup({
            input: workSpaceDir + '/src/Main.ts',
            onwarn: (waring, warn) => {
                if (waring.code == 'CIRCULAR_DEPENDENCY') {
                    console.log('warnning Circular dependency:');
                    console.log(waring);
                }
            },
            treeshake: false, //建议忽略
            plugins: [
                typescript({
                    tsconfig: workSpaceDir + '/tsconfig.json',
                    check: true, //Set to false to avoid doing any diagnostic checks on the code
                    tsconfigOverride: { compilerOptions: { removeComments: true } },
                    include: /.*.ts/,
                }),
                glsl({
                    // By default, everything gets included
                    include: /.*(.glsl|.vs|.fs)$/,
                    sourceMap: false,
                    compress: false,
                }),
                /*terser({
				output: {
				},
				numWorkers:1,//Amount of workers to spawn. Defaults to the number of CPUs minus 1
				sourcemap: false
			})*/
            ],
        })
        .then((bundle) => {
            return bundle.write({
                file: workSpaceDir + '/bin/js/bundle.js',
                format: 'iife',
                name: 'laya',
                sourcemap: false,
            });
        })
        .catch((err) => {
            console.log(err);
        });
}));

if (watchify) {
    const watchedBrowserify = watchify(
        browserify({
            basedir: workSpaceDir,
            //是否开启调试，开启后会生成jsmap，方便调试ts源码，但会影响编译速度
            debug: false,
            entries: ['src/Main.ts'],
            cache: {},
            packageCache: {},
        }).plugin(tsify, {
            module: 'commonjs'
        })
    );

    // 记录watchify编译ts的时候是否出错，出错则不刷新浏览器
    let isBuildError = false;
    gulp.task('build', () => {
        return watchedBrowserify
            .bundle()
            .on('error', (...args) => {
                isBuildError = true;
                gutil.log(...args);
            })
            .pipe(source('bundle.js'))
            .pipe(gulp.dest(workSpaceDir + '/bin/js'));
    });

    gulp.task('watch', gulp.series('build', () => {
        // 浏览器开发时自动刷新页面
        browserSync.init({
            port: 3002,
            server: {
                watchFiles: ['../bin/'],
                baseDir: '../bin/',
            },
        });
        //  watchify监听文件刷新
        watchedBrowserify.on('update', () => {
            isBuildError = false;
            runSequence('build', () => {
                if (!isBuildError) {
                    // 没有编译错误时，刷新浏览器界面
                    browserSync.reload();
                }
            });
        });
        // 打印watchify编译日志
        watchedBrowserify.on('log', gutil.log);
    }));
}
