// const gulp  = require('gulp');
import del from "del";
import gulp from "gulp";
import gb_pug from "gulp-pug";

import gp_img from "gulp-image";
import gp_ws from "gulp-webserver";
import gp_sass from "gulp-sass"
import gp_min_css from "gulp-csso";
import autoprefixer from "gulp-autoprefixer"; // 구형 브라우저지원

//---------set-----------------------
//  gulp browserify + babelify set
import babelify from "babelify";
import gp_bro from "gulp-bro"; //
//---------set-----------------------

gp_sass.compiler = require("node-sass");

const routes = {
    pug: {
        watch: "src/**/*.pug",
        src: "src/*.pug",
        dist: "build"
    },
    img: {
        src: "src/img/*",
        dist: "build/img"
    },
    scss: {
        watch: "src/scss/**/*.scss",
        src: "src/scss/style.scss",
        dist: "build/css"
    },
    js: {
        src: "src/js/*.js",
        dist: "build/js"
    }
};


const webserver = () =>
    gulp.src("build")
    .pipe(gp_ws({
        livereload: true,
        port: "8004",
        open: true
    }));

const pug = () =>
    gulp.src(routes.pug.src)
        .pipe(gb_pug())
        .pipe(gulp.dest(routes.pug.dist));

const img = () =>
    gulp.src(routes.img.src)
        .pipe(gp_img())
        .pipe(gulp.dest(routes.img.dist));

const clean = () => del(["build"]); // 확장자나 폴더명

const styles = () =>
    gulp
        .src(routes.scss.src)
        .pipe(gp_sass().on("error", gp_sass.logError))
        .pipe(gp_min_css())
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(gulp.dest(routes.scss.dist));


const js = () =>
    gulp
    .src(routes.js.src)
    .pipe(gp_bro({
        transform: [
            babelify.configure({ presets: ['@babel/preset-env'] }),
            [ 'uglifyify', { global: true } ]
        ]
    }))
    .pipe(gulp.dest(routes.js.dist));

const watch = () =>
    gulp.watch(routes.pug.watch, pug);
    gulp.watch(routes.img.src, img);
    gulp.watch(routes.scss.watch, styles);
    gulp.watch(routes.js.src, js);

const prepare = gulp.series([clean, img]);

const assets = gulp.series([pug, styles, js]);

const live = gulp.series([webserver] );

export const dev = gulp.series( [prepare, assets, live] ); // export 해야 package.json 에서 사용가능

