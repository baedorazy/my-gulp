import gulp from "gulp";
import del from "del";
import ws from "gulp-webserver";
import gp_pug from "gulp-pug";
import gp_img from "gulp-image";
import gp_atoprefixer from "gulp-autoprefixer";
import gp_mincss from "gulp-csso";
//---------set-----------------------
//  gulp browserify + babelify set
import babelify from "babelify";
import gp_bro from "gulp-bro"; //
//-----------------------------------
//---------set-----------------------
import gp_sass from "gulp-sass";
       gp_sass.compiler  = require("node-sass");
//-----------------------------------
import gp_pages from "gulp-gh-pages"; // Final deploy

const routes = {
    pug: {
        watch: "src/**/*.pug",
        src: "src/*.pug",
        dest: "build"
    },
    img: {
        src: "src/img/*",
        dest: "build/img"
    },
    scss: {
        watch: "src/scss/*.scss",
        src: "src/scss/common.scss",
        dest: "build/css"
    },
    js: {
        watch: "src/js/*.js",
        src: "src/js/main.js",
        dest: "build/js"
        
    },
    dist: {
        src: "build/**/*",
    }
};

const pug = () =>
    gulp
        .src(routes.pug.src)
        .pipe(gp_pug())
        .pipe(gulp.dest(routes.pug.dest));

const img = () =>
    gulp
        .src(routes.img.src)
        .pipe(gp_img())
        .pipe(gulp.dest(routes.img.dest));

// #####################################################
// scss폴더에서 _(언더바)는 sass한테 compile 하지는 말고 사용만 하라고 알려주는거
//            예를들어 reset.css에 밑줄이 없다면, sass는 reset.css를 만들고 그걸 common.css에다가 import할꺼,
//            한마디로 언더스코어가 들어간 파일은 sass가 css로 만드는걸 원하지 않는 파일들, 하지만 sass에서 쓰긴한다,
// #####################################################
const scss = () =>
    gulp
        .src(routes.scss.src)
        .pipe(gp_sass().on('error', gp_sass.logError)) // 이렇게 하는 이유 sass 에러라고 스크립트를 멈추고 싶진 않아서 따로 관리,,
        .pipe(gp_atoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gp_mincss()) // min
        .pipe(gulp.dest(routes.scss.dest));
        
const js = () =>
    gulp
        .src(routes.js.src)
        .pipe(gp_bro({
            transform: [
                babelify.configure({ presets: ['@babel/preset-env'] }),
                                          // gp_bro presets:[es2015]라고 되있었는데, 내가 쓰는건 바벨 이니깐,, .babelrc사용험,
                [ 'uglifyify', { global: true } ]
            ]
        }))
        .pipe(gulp.dest(routes.js.dest));

const webserver = () =>
    gulp
        .src("build")
        .pipe(ws({"livereload": true, open: true, host: '0.0.0.0', port: 8888})); // 저정하면 자동으로 로드해 줌.

export const gpDeploy = () =>
    gulp.src(routes.dist.src)
    .pipe(gp_pages()); // option remoteUrl은 기본적으로 이 프로젝트 URL임

const watch = () =>
    gulp.watch(routes.pug.watch, pug);
    gulp.watch(routes.img.src, img);
    gulp.watch(routes.scss.watch, scss);
    gulp.watch(routes.js.watch, js); // 콘솔에 5와  50 사이 무작위 숫자가 나오면 동작확인

const clean = () => del(["build/"]);

const prepare = gulp.series([clean, img]); // 이미지는 무거우니 처음에만 동작하게 만듦
const assets = gulp.series([pug, scss, js]);
const live = gulp.parallel([webserver, watch]); // 동시에 두가지 task 가 동작하길 바란다면 parallel 요걸 쓰면 병렬로 실행해.

export const build = gulp.series([prepare, assets]);
export const dev =  gulp.series([prepare, live]); // export는 package.jsondㅔ서 사용할 command만 해주면 됨.
export const deploy = gulp.series([build, gpDeploy]); //
