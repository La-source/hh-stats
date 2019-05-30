import * as gulp from "gulp";
import {init, write} from "gulp-sourcemaps";
import {createProject} from "gulp-typescript";

gulp.task("default", () =>
    gulp.src("src/**/*.ts")
        .pipe(init())
        .pipe(createProject("tsconfig.json")())
        .pipe(gulp.src([
            "src/**/*.ejs",
            "package*.json",
            "src/game-constant.json",
        ]))
        .pipe(write())
        .pipe(gulp.dest("dist")),
);