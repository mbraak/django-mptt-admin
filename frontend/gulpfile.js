const gulp = require("gulp");
const babel = require("gulp-babel");
const sass = require("gulp-sass");
const header = require("gulp-header");


const banner = "/* This file is generated */\n";


gulp.task("js", () =>
    gulp.src("*.js")
        .pipe(babel())
        .pipe(header(banner))
        .pipe(gulp.dest("../django_mptt_admin/static/django_mptt_admin/"))
);

gulp.task("sass", () =>
    gulp.src("*.scss")
        .pipe(sass({ errLogToConsole: true }))
        .pipe(header(banner))
        .pipe(gulp.dest("../django_mptt_admin/static/django_mptt_admin/"))
);

gulp.task("default", ["js", "sass"]);

gulp.task("watch", ["js", "sass"], () => {
    gulp.watch(["./*.js"], ["js"]);
    gulp.watch(["./*.scss"], ["sass"]);
});
