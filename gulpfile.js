let gulp = require('gulp'),
 sass = require('gulp-sass'),
 browserSync = require('browser-sync').create(),
 header = require('gulp-header'),
 cleanCSS = require('gulp-clean-css'),
 rename = require("gulp-rename"),
 uglify = require('gulp-uglify'),
 filter = require('gulp-filter'),
 webpack = require('webpack'),
 webpackDevServer = require('webpack-dev-server'),
 pkg = require('./package.json'),
 addStream = require('add-stream'),
 sourceMap = require('gulp-sourcemaps'),
 gif = require('gulp-if'),
 clean = require('gulp-clean'),
 sequence = require('gulp-sequence'),
 mainBowerFiles = require('gulp-main-bower-files'),
 del = require('del'),
 srcFolder = 'source',
 publicFolder = 'public',
 bowerFolder = 'bower_components'
let webpackConfig = require('./webpack.config')
let isProduction = false;
// let env = process.env.NODE_ENV = 'development';
// let env = process.env.NODE_ENV = 'production';

// Set the banner content
var banner = ['/*!\n',
  ' *  - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2017-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %>\n',
  ' */\n',
  ''
].join('');

gulp.task('webpack', function() {
  webpack(webpackConfig,
    function(err, stats) {
      if(err) throw new gutil.PluginError("webpack", err);
      console.log("[webpack]", stats.toString({
          // output options
      }));
  } 
);
});

gulp.task('main-bower-files', function() {
  return gulp.src('./bower.json')
      .pipe(mainBowerFiles())
      .pipe(gulp.dest('./public/bower/'));
});



gulp.task('index', function() {
  gulp.src('index.html')
    .pipe(gulp.dest(publicFolder));
})
  

// Compiles SCSS files from /scss into /css
gulp.task('styles', function() {
  return gulp.src(srcFolder + '/sass/index.sass')
  .pipe(sourceMap.init())
  .pipe(header(banner ,{
    pkg: pkg
  }))
  .pipe(sass())
  .pipe(gif(isProduction ,
    uglify()
  ))
  .pipe(sourceMap.write())
  .pipe(gulp.dest(publicFolder + '/styles/'))
});

gulp.task('assets' ,function(){
  gulp.src([srcFolder + '/image/**/*'])
    .pipe(gulp.dest(publicFolder + '/assets/image/'));
});

gulp.task('clean',function(){
  del.sync(publicFolder);
});

gulp.task('bootstrap' ,function() {
  gulp.src(srcFolder + '/sass/bootstrap.sass')
    .pipe(sass({
      includePaths: [bowerFolder + '/bootstrap-sass/assets/stylesheets']
    }))
    .pipe(gulp.dest(publicFolder + '/styles/'));
});

gulp.task('fonts', function() {
  gulp.src(bowerFolder + '/bootstrap-sass/assets/fonts/**/*')
  .pipe(gulp.dest(publicFolder + '/fonts/'));

  gulp.src(bowerFolder + '/font-awesome/scss/font-awesome.scss')
    .pipe(sass({
      // includePaths: [bowerFolder + '/bootstrap-sass/assets/stylesheets']
    }))
    .pipe(gulp.dest(publicFolder + '/styles/'));

  gulp.src(bowerFolder + '/font-awesome/fonts/*')
    .pipe(gulp.dest(publicFolder + '/fonts/font-awesome/'));
});

// Default task
gulp.task('default',sequence('build' ,'browserSync'));

gulp.task('build',sequence('clean' ,['styles','bootstrap' ,'fonts' ,'index' ,'assets' ,'main-bower-files' ] ,'webpack' ));

// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'public'
    },
  })
})

// Dev task with browserSync
gulp.task('watch', function() {
  gulp.watch('scss/*.scss', ['sass']);
  // gulp.watch('css/*.css', ['minify-css']);
  // gulp.watch('js/*.js', ['minify-js']);
  // // Reloads the browser whenever HTML or JS files change
  gulp.watch('*.html', browserSync.reload());
  gulp.watch('source/**/*.js', browserSync.reload);
});
