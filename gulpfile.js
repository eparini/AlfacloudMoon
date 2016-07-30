var gulp = require('gulp')
var connect = require('gulp-connect')
// requires browserify and vinyl-source-stream
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var uglify = require('gulp-uglify');

// Connect task
gulp.task('connect', function () {
    connect.server({
        root: 'public',
        port: 4000
    })
})

gulp.task('browserify', function () {
    // Grabs the app.js file
    return browserify('./app/app.js')
        // bundles it and creates a file called main.js
        .bundle()
        .pipe(source('main.js'))
        // saves it the public/js/ directory
        .pipe(gulp.dest('./public/js/'));
})

gulp.task('browserify-prod', function () {
    // Grabs the app.js file
    return browserify('./app/app.js')
        // bundles it and creates a file called main.js
        .bundle()
        .pipe(source('main.js'))
        // saves it the public/js/ directory
        .pipe(gulp.dest('./public/js/')
        ); 
})

gulp.task('watch', function () {
    gulp.watch('app/**/*.js', ['browserify'])
})

gulp.task('move-css', function () {
    return gulp.src('./app/*.css')
        .pipe(gulp.dest('./public/'));
});

gulp.task('default', ['move-css', 'connect', 'browserify'])
gulp.task('production', ['move-css', 'connect', 'browserify-prod'])