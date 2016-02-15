const gulp = require("gulp");
const babel = require("gulp-babel");


gulp.task("default", () =>
    gulp.src("*.js")
        .pipe(babel())
        .pipe(gulp.dest("../django_mptt_admin/static/django_mptt_admin/"))
);

gulp.task("watch", ["default"], () =>
    gulp.watch(["./*.js"], ["default"])
);
