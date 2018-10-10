"use strict";

var del = require("del");
var fs = require("fs");
var gulp = require("gulp");
var gutil = require("gulp-util");
var umd = require("gulp-umd");
var karma = require("karma").Server;
var merge = require("merge2");
var tslint = require("gulp-tslint");
var header = require("gulp-header");
var typescript = require("gulp-typescript");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var deployCdn = require("gulp-deploy-azure-cdn");
var prettierPlugin = require("gulp-prettier-plugin");
var KeyVault = require("azure-keyvault");
var argv = require("yargs").option("version", {
  type: "string"
}).argv; // version may look like a number, so force it to be a string
var AuthenticationContext = require("adal-node").AuthenticationContext;

var buildDir = "./build/";
var distDir = "./dist/";
var libName = "microsoftTeams";
var dtsHeaderTemplate = `export = microsoftTeams;
`;

/// global options
var options = {
  connectionString: ""
};

gulp.task("tslint", function() {
  return gulp
    .src(["./src/**/*.ts", "./test/**/*.ts"])
    .pipe(
      tslint({
        configuration: "tslint.json",
        tslint: require("tslint"),
        formatter: "verbose"
      })
    )
    .pipe(
      tslint.report({
        summarizeFailureOutput: true
      })
    );
});

gulp.task("prettier", () =>
  gulp
    .src(["./src/**/*.ts", "./test/**/*.ts", "./gulpfile.js"])
    .pipe(
      prettierPlugin(undefined, {
        filter: true
      })
    )
    // passing a function that returns base will write the files in-place
    .pipe(gulp.dest(file => file.base))
);

var tsProject = typescript.createProject("./tsconfig.json", {
  // Point to the specific typescript package we pull in, not a machine-installed one
  typescript: require("typescript")
});

gulp.task("ts", ["tslint"], function() {
  var tsResult = tsProject.src().pipe(tsProject());

  return merge([
    tsResult.dts.pipe(header(dtsHeaderTemplate)).pipe(gulp.dest(buildDir)),
    tsResult.js
      .pipe(
        umd({
          exports: function(file) {
            return libName;
          },
          namespace: function(file) {
            return libName;
          }
        })
      )
      .pipe(gulp.dest(buildDir))
      .pipe(uglify())
      .pipe(
        rename({
          suffix: ".min"
        })
      )
      .pipe(gulp.dest(buildDir))
  ]);
});

gulp.task("test", ["ts"], function(done) {
  new karma(
    {
      configFile: __dirname + "/karma.conf.js"
    },
    done
  ).start();
});

gulp.task("doc", function(done) {
  var parse = require("json-schema-to-markdown");
  var schema = require("./src/MicrosoftTeams.schema.json");
  var markdown = parse(schema);
  fs.mkdir(buildDir, function() {
    fs.mkdir(buildDir + "/doc", function() {
      fs.writeFile(buildDir + "/doc/MicrosoftTeams.schema.md", markdown, done);
    });
  });
});

gulp.task("dist", ["ts", "doc"], function() {
  var distFiles = [
    buildDir + "/src/**/*.js",
    buildDir + "/src/**/*.d.ts",
    "./src/**/*.schema.json"
  ];

  return gulp.src(distFiles).pipe(gulp.dest(distDir));
});

gulp.task("default", ["prettier", "ts", "test", "doc", "dist"]);

gulp.task("clean", function() {
  return del([buildDir, distDir]);
});

/// tasks for uploading dist assets to CDN
gulp.task("get-connectionstring-from-secret", function(done) {
  var clientId = argv.clientId;
  var clientSecret = argv.clientSecret;
  var vaultUri = argv.vaultUri;
  var secretName = argv.secretName;
  var secretIdentifier = vaultUri + "/secrets/" + secretName + "/";

  if (!clientId || !clientSecret || !vaultUri || !secretName) {
    console.error(
      "missing required inputs for 'get-connectionstring-form-secret'"
    );
    process.exit(1);
  }

  // Authenticator - retrieves the access token
  var authenticator = function(challenge, callback) {
    var context = new AuthenticationContext(challenge.authorization);
    return context.acquireTokenWithClientCredentials(
      challenge.resource,
      clientId,
      clientSecret,
      function(err, tokenResponse) {
        if (err) throw err;
        var authorizationValue =
          tokenResponse.tokenType + " " + tokenResponse.accessToken;
        return callback(null, authorizationValue);
      }
    );
  };

  var credentials = new KeyVault.KeyVaultCredentials(authenticator);
  var keyVaultClient = new KeyVault.KeyVaultClient(credentials);

  keyVaultClient.getSecret(secretIdentifier, function(err, secretBundle) {
    if (err) throw err;
    options.connectionString = secretBundle.value;
    done();
  });
});

gulp.task(
  "upload",
  ["get-connectionstring-from-secret", "dist", "test"],
  function() {
    var buildVer = argv.version || "";
    if (!buildVer) {
      console.error("missing build version argument (--version)!");
      process.exit(1);
    }

    const assetBundles = [
      {
        glob: distDir + "*.schema.json",
        dest: `v${buildVer}/manifest`
      },
      {
        glob: distDir + "*.js",
        dest: `v${buildVer}/js`
      },
      {
        glob: distDir + "*.d.ts",
        dest: `v${buildVer}/types`
      }
    ];

    var uploadTasks = assetBundles.map(function(assetBundle) {
      return gulp.src(assetBundle.glob).pipe(
        deployCdn({
          containerName: "sdk", // container name in blob
          serviceOptions: [options.connectionString], // custom arguments to azure.createBlobService
          folder: assetBundle.dest, // path within container
          zip: true, // gzip files if they become smaller after zipping, content-encoding header will change if file is zipped
          deleteExistingBlobs: false, // true means recursively deleting anything under folder
          concurrentUploadThreads: 4, // number of concurrent uploads, choose best for your network condition
          metadata: {
            cacheControl: "public, max-age=31536000" // cache in browser for 1 year
          },
          testRun: argv.whatIf || false // test run - means no blobs will be actually deleted or uploaded, see log messages for details
        })
      );
    });

    return merge(...uploadTasks).on("error", gutil.log);
  }
);
