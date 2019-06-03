import * as gulp from "gulp";
import {init, write} from "gulp-sourcemaps";
import {createProject} from "gulp-typescript";

gulp.task("default", () =>
    gulp.src("src/**/*.ts")
        .pipe(init())
        .pipe(createProject("tsconfig.json")())
        .pipe(gulp.src([
            "src/**/*.ejs",
            "src/**/*.css",
            "src/**/*.js",
            "src/**/*.json",
            "package*.json",
        ]))
        .pipe(write())
        .pipe(gulp.dest("dist")),
);
