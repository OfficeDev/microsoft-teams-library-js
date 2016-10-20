"use strict";

var gulp = require("gulp"),
    karma = require("karma").Server,
    merge = require('merge2'),
    tslint = require("gulp-tslint"),
    typescript = require("gulp-typescript"),
    rename = require("gulp-rename"),
    rimraf = require("rimraf"),
    typings = require("gulp-typings"),
    uglify = require("gulp-uglify");

var config = {
    karmaConfig: __dirname + "/karma.conf.js",
    tsConfig: "./tsconfig.json",
    tsFiles: [ "./src/**/*.ts", "./test/**/*.ts" ],
    tsLintConfig: "tslint.json",
    typingsConfig: "./typings.json",
    typingsDir: "./typings/",
    outDir: "./dist/",
};

gulp.task("typings", function ()
{
    return gulp.src(config.typingsConfig)
        .pipe(typings());
});

gulp.task("tslint", function ()
{
    return gulp.src(config.tsFiles)
        .pipe(tslint({
            configuration: config.tsLintConfig,
            tslint: require("tslint"),
            formatter: "verbose"
        }))
        .pipe(tslint.report({
            summarizeFailureOutput: true
        }));
});

var tsProject = typescript.createProject(config.tsConfig, {
    // Point to the specific typescript package we pull in, not a machine-installed one
    typescript: require("typescript"),
});

gulp.task("ts", [ "typings", "tslint" ], function ()
{
    var tsResult = tsProject.src()
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(gulp.dest(config.outDir)),
        tsResult.js
            .pipe(gulp.dest(config.outDir))
            .pipe(uglify())
            .pipe(rename({ suffix: ".min" }))
            .pipe(gulp.dest(config.outDir)),
    ]);
});

gulp.task("test", [ "ts" ], function (done)
{
  new karma({
    configFile: config.karmaConfig,
    singleRun: true
  }, done).start();
});

gulp.task("default", [ "ts", "test" ]);

gulp.task("clean:dist", function (cb)
{
    rimraf(config.outDir, cb);
});

gulp.task("clean:typings", function (cb)
{
    rimraf(config.typingsDir, cb);
});

gulp.task("clean", [ "clean:dist", "clean:typings" ]);
