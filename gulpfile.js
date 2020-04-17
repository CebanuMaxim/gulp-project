const { src, dest, watch, parallel, series } = require("gulp");

const sass = require('gulp-sass');
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const eslint = require("gulp-eslint");
const mocha = require("gulp-mocha");
const sync = require("browser-sync").create();



function generateCSS(cb) {
    src('./sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(dest('public/stylesheets'))
        .pipe(sync.stream());
    cb();
}



function generateHTML(cb) {
    src("./views/index.ejs")
        .pipe(ejs({
            title: "Hello Semaphore!",
        }))
        .pipe(rename({
            extname: ".html"
        }))
        .pipe(dest("public"));
    cb();
}



function runLinter(cb) {
    return src(['**/*.js', '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .on('end', function () {
            cb();
        });
}



function runTests(cb) {
    return src(['**/*.test.js'])
        .pipe(mocha())
        .on('error', function () {
            cb(new Error('Test failed'));
        })
        .on('end', function () {
            cb();
        });
}



function watchFiles(cb) {
    watch('views/**.ejs', generateHTML);
    watch('sass/**.scss', generateCSS);
    watch([ '**/*.js', '!node_modules/**'], parallel(runLinter, runTests));
}



function browserSync(cb) {
    sync.init({
        server: {
            baseDir: "./public"
        }
    });

    watch('views/**.ejs', generateHTML);
    watch('sass/**.scss', generateCSS);
    watch("./public/**.html").on('change', sync.reload);
}



exports.css = generateCSS;
exports.html = generateHTML;
exports.lint = runLinter;
exports.test = runTests;
exports.watch = watchFiles;
exports.sync = browserSync;

exports.default = series(runLinter,parallel(generateCSS,generateHTML),runTests);