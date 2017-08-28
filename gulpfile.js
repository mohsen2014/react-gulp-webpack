let gulp = require('gulp'),
 scss = require('gulp-scss'),
 browserSync = require('browser-sync').create(),
 header = require('gulp-header'),
 cleanCSS = require('gulp-clean-css'),
 rename = require("gulp-rename"),
 uglify = require('gulp-uglify'),
 filter = require('gulp-filter'),
 webpack = require('webpack'),
 pkg = require('./package.json'),
 addStream = require('add-stream'),
 sourceMap = require('gulp-sourcemaps'),
 gif = require('gulp-if'),
 clean = require('gulp-clean'),
 sequence = require('gulp-sequence'),
 mainBowerFiles = require('gulp-main-bower-files'),
 del = require('del'),
 srcFolder = 'source',
 publicFolder = 'public';

let isProduction = false;
// let env = process.env.NODE_ENV = 'development';
// let env = process.env.NODE_ENV = 'production';

// Set the banner content
var banner = ['/*!\n',
  ' *  - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  ''
].join('');


gulp.task('main-bower-files', function() {
  return gulp.src('./bower.json')
      .pipe(mainBowerFiles())
      .pipe(gulp.dest('./public/bower/'));
});

function build (watch, callback) {
  var plugins = [
      new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
      })
  ];

  if (isProduction) {
      plugins.push(new webpack.optimize.UglifyJsPlugin());
  }

  webpack({
      plugins: plugins,
      cache: true,
      watch: watch,
      module: {
          loaders: [
              { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader' }
          ]
      },
      devtool: "#source-map",
      entry: path.resolve(__dirname, 'source/index.js'),
      output: {
          filename: 'app.js',
          path: path.resolve(__dirname, 'public')
      }
  }, function (err, stats) {
      if (callback) callback();
  });
}


gulp.task('index', function() {
  gulp.src('index.html')
    .pipe(gulp.dest(publicFolder));
  gulp.src(['source/js/freelancer.js' ,'source/js/jqBootstrapValidation.js'])
    .pipe(gulp.dest(publicFolder));

  
})
  

// Compiles SCSS files from /scss into /css
gulp.task('styles', function() {
  return gulp.src(srcFolder + '/scss/freelancer.scss')
  .pipe(sourceMap.init())
  .pipe(header(banner ,{
    pkg: pkg
  }))
  .pipe(scss())
  .pipe(gif(isProduction ,
    uglify()
  ))
  .pipe(sourceMap.write())
  .pipe(gulp.dest(publicFolder + '/styles/'))
});

gulp.task('assets' ,function(){
  gulp.src([srcFolder + '/img/**/*'])
    .pipe(gulp.dest(publicFolder + '/assets/image/'));
});

gulp.task('clean',function(){
  // gulp.src(publicFolder)
  //   .pipe(clean());
  del.sync('public/**')
});

// Default task
gulp.task('default',sequence('clean' ,['styles' ,'index' ,'assets' ,'main-bower-files'] ,'browserSync'));

gulp.task('build',sequence(['clean'] ,['styles' ,'index' ,'assets' ,'main-bower-files' ,'watch'] ));

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
