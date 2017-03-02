const gulp = require('gulp');
const ts = require('gulp-typescript');
const merge = require('merge2');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const jsonTransform = require('gulp-json-transform');
const clean = require('gulp-clean');
const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const rollupSourcemaps = require('rollup-plugin-sourcemaps');

gulp.task('es5', () => {
    const tsProject = ts.createProject('tsconfig.es5.json', {module: 'es6'});

    const tsResult = gulp.src(["./**/*.ts", "!node_modules/**/*.*"]) // or tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(gulp.dest('release')),
        tsResult.js
            //.pipe(babel())
            .pipe(sourcemaps.write("./"))
            .pipe(gulp.dest('release'))
    ]);
});

gulp.task('bundle', ['es5'], done => rollup
    .rollup({
        entry: 'release/index.js',
        sourceMap: true,
        plugins: [
            nodeResolve({jsnext: true, main: true}),
            commonjs({
                include: 'node_modules/**',
            }),
            rollupSourcemaps()
        ]
    })
    .then(bundle => bundle.write({
        format: 'umd',
        moduleName: 'jsonStringMapper',
        sourceMap: true,
        dest: 'release/bundles/json-string-mapper.umd.js'
    })));

gulp.task('package-json', function() {
    gulp.src('./package.json')
        .pipe(jsonTransform(function(data, file) {
            delete data.devDependencies;

            if (data.scripts) {
                delete data.scripts.build;
                delete data.scripts.publish;
            }

            data.main = 'bundles/json-string-mapper.umd.js';

            return data;
        }))
        .pipe(gulp.dest('./release'));
});

gulp.task('readme', () => {
    return gulp.src(["./README.md"])
        .pipe(gulp.dest('./release'));
});

gulp.task('clean', function () {
    return gulp.src('./release', {read: false})
        .pipe(clean());
});

gulp.task('build', ['clean', 'bundle', 'package-json', 'readme']);