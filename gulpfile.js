const fs = require("fs");
const del = require("del");
const path = require("path");
const gulp = require("gulp");
const sass = require("gulp-sass");
const gutil = require("gulp-util");
const webpack = require("webpack");
const watch = require("gulp-watch");
const electron = require("electron");
const rename = require("gulp-rename");
const runsequence = require("run-sequence");
const sourcemaps = require("gulp-sourcemaps");
const browsersync = require("browser-sync");

const pkjson = require("./package.json");
const wpconfig = require("./webpack.config.js");

gulp.task("bundle", (cb) => {
    return webpack(wpconfig, (err, stats) => {
        if (err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({}));
        cb();
    });
});

gulp.task("clean", () => {
    del.sync("./app/**/*");
    del.sync("./dist/*-unpacked");
    return;
});

gulp.task("static", () => {
    return gulp.src("./src/static/**/*").pipe(gulp.dest("./app/"));
});

gulp.task("sass", () => {
    return gulp.src("./src/styles/**/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
        .pipe(rename({ suffix: ".min" }))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(`./app/styles/`));
});

gulp.task("pkjson", () => {
    let copy_pkjson = pkjson;
    delete copy_pkjson.build;
    delete copy_pkjson.devDependencies;
    delete copy_pkjson.scripts;
    fs.writeFileSync("./app/package.json", JSON.stringify(copy_pkjson, null, 4), "utf8");
});

gulp.task("watch:static", ["static"], () => {
    watch("./src/static/**/*", (file) => {
        switch (file.event) {
            case "add":
                gutil.log(`File ${path.relative(__dirname, file.path)} was created! Copying to build folder...`);
                gulp.src(file.path).pipe(gulp.dest(`./app/${path.relative("./src/static", path.dirname(file.path))}`));
                break;
            case "unlink":
                gutil.log(`File ${path.relative(__dirname, file.path)} was removed! Removing from build folder...`);
                del.sync(`./app/${path.relative("./src/static", file.path)}`);
                break;
            case "change":
                gutil.log(`File ${path.relative(__dirname, file.path)} has changed! Updating on build folder...`);
                gulp.src(file.path).pipe(gulp.dest(`./app/${path.relative("./src/static", path.dirname(file.path))}`));
                break;
        }
        browsersync.reload();
    });
});

gulp.task("watch:sass", ["sass"], () => {
    gulp.watch("./src/styles/**/*.scss", ["sass"], (file) => {
        gutil.log(`File ${path.relative(__dirname, file.path)} changed! Rebundling...`);
    });
});

gulp.task("watch:bundle", ["bundle"], () => {
    gulp.watch(["./src/**/*", "!./src/**/*.scss", "!./src/**/*.sass", "!./src/**/*.less"], ["bundle"], (file) => {
        gutil.log(`File ${path.relative(__dirname, file.path)} changed! Rebundling...`);
    });
});

gulp.task("watch", ["watch:bundle", "watch:sass", "watch:static"], () => {
    gulp.watch(["./app/**/*", "!./app/**/*.css", "!./app/**/*.map", "!./app/bower_components"], browsersync.reload);
});

gulp.task("build", () => {
    return runsequence("clean", ["pkjson", "static", "sass", "bundle"]);
});

gulp.task("serve", () => {
    return runsequence("clean", "pkjson", "watch", () => {
        browsersync.init({
            ui: false,
            open: false,
            notify: false,
            server: { baseDir: "./app" },
        });

        const spawn = require("child_process").spawn;
        const proc = spawn(electron, ["app"]);
        proc.stdout.on("data", (data) => { console.log(data.toString()); });
        proc.stderr.on("data", (data) => { console.log(data.toString()); });
        proc.on("exit", (code) => {
            console.log(`Child exited with code ${code}`);
            process.exit(0);
        });

        return;
    });
});
