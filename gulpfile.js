var gulp = require('gulp')
var mocha = require('gulp-mocha')
var notify = require('mocha-notifier-reporter')

require('babel/register')

var src = ['src/**/*.js', 'test/**/*.js'];

gulp.task('mocha', function() {
	return gulp.src(src)
		.pipe(mocha({
			reporter: notify.decorate('spec')
		}));
})

gulp.task('default', ['mocha'])


gulp.watch(src, ['default'])
