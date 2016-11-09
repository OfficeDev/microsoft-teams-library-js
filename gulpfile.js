"use strict";

var del = require("del"),
    fs = require("fs"),
    gulp = require("gulp"),
    karma = require("karma").Server,
    merge = require('merge2'),
    tslint = require("gulp-tslint"),
    typescript = require("gulp-typescript"),
    rename = require("gulp-rename"),
    typings = require("gulp-typings"),
    uglify = require("gulp-uglify");

var buildDir = "./build/";
var distDir = "./dist/";

gulp.task("typings", function ()
{
    return gulp.src("./typings.json")
        .pipe(typings());
});

gulp.task("tslint", function ()
{
    return gulp.src([ "./src/**/*.ts", "./test/**/*.ts" ])
        .pipe(tslint({
            configuration: "tslint.json",
            tslint: require("tslint"),
            formatter: "verbose"
        }))
        .pipe(tslint.report({
            summarizeFailureOutput: true
        }));
});

var tsProject = typescript.createProject("./tsconfig.json", {
    // Point to the specific typescript package we pull in, not a machine-installed one
    typescript: require("typescript"),
});

gulp.task("ts", [ "typings", "tslint" ], function ()
{
    var tsResult = tsProject.src()
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(gulp.dest(buildDir)),
        tsResult.js
            .pipe(gulp.dest(buildDir))
            .pipe(uglify())
            .pipe(rename({ suffix: ".min" }))
            .pipe(gulp.dest(buildDir)),
    ]);
});

gulp.task("test", [ "ts" ], function (done)
{
    new karma({ configFile: __dirname + "/karma.conf.js" }, done).start();
});

gulp.task("doc", function (done)
{
    var parse = require("json-schema-to-markdown");
    var schema = require("./src/MicrosoftTeams.schema.json");
    var markdown = parse(schema);
    fs.mkdir(buildDir, function () {
        fs.mkdir(buildDir + "/doc", function () {
            fs.writeFile(buildDir + "/doc/MicrosoftTeams.schema.md", markdown, done);
        });
    });
});

gulp.task("dist", [ "ts", "doc" ], function ()
{
    var distFiles = [
        buildDir + "/src/**/*.js",
        buildDir + "/src/**/*.d.ts",
        "./src/**/*.schema.json",
    ];

    return gulp.src(distFiles)
        .pipe(gulp.dest(distDir));
});

gulp.task("default", [ "ts", "test", "doc", "dist" ]);

gulp.task("clean", function() {
    return del([
        buildDir,
        distDir,
        "./typings/"
    ]);
});
