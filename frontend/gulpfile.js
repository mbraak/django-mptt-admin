const gulp = require("gulp");
const babel = require("gulp-babel");
const browserify = require("gulp-browser").browserify;
const sass = require("gulp-sass");
const header = require("gulp-header");
const uglify = require("gulp-uglify");


const banner = "/* This file is generated */\n";


gulp.task("js", () =>
    gulp.src("django_mptt_admin.js")
        .pipe(babel())
        .pipe(browserify())
        .pipe(uglify())
        .pipe(gulp.dest("../django_mptt_admin/static/django_mptt_admin/"))
);

gulp.task("sass", () =>
    gulp.src("django_mptt_admin.scss")
        .pipe(sass({ errLogToConsole: true }))
        .pipe(header(banner))
        .pipe(gulp.dest("../django_mptt_admin/static/django_mptt_admin/"))
);

gulp.task("default", ["js", "sass"]);

gulp.task("watch", ["js", "sass"], () => {
    gulp.watch(["./*.js"], ["js"]);
    gulp.watch(["./*.scss"], ["sass"]);
});
