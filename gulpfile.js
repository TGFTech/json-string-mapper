const gulp = require('gulp');
const ts = require('gulp-typescript');
const merge = require('merge2');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const jsonTransform = require('gulp-json-transform');
const clean = require('gulp-clean');

gulp.task('es5', () => {
    const tsProject = ts.createProject('tsconfig.json', {module: 'es6'});

    const tsResult = gulp.src(["./**/*.ts", "!node_modules/**/*.*"]) // or tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(gulp.dest('release')),
        tsResult.js
            .pipe(babel())
            .pipe(sourcemaps.write("./"))
            .pipe(gulp.dest('release'))
    ]);
});

gulp.task('package-json', function() {
    gulp.src('./package.json')
        .pipe(jsonTransform(function(data, file) {
            delete data.devDependencies;

            if (data.scripts) {
                delete data.scripts.build;
                delete data.scripts.publish;
            }

            data.main = 'index.js';

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

gulp.task('build', ['clean', 'es5', 'package-json', 'readme']);