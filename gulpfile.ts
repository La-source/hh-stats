import * as gulp from "gulp";
import {createProject} from "gulp-typescript";

gulp.task("default", () =>
    gulp.src("src/**/*.ts")
        .pipe(createProject("tsconfig.json")())
        .pipe(gulp.dest("dist")),
);
