var gulp = require('gulp');
var path = require('path');
var git = require('gulp-git');

var exec = require('child_process').exec;
var clean = require('gulp-clean');


gulp.task('clean', function () {
    return gulp.src('checkout', {read: false})
        .pipe(clean());
});

gulp.task('clone', ['clean'], function(){
	
	return my_promise = new Promise( (resolve, reject) => {
	   git.clone('https://tanujaggarwal@github.com/Compro-Single-Step/SIMS-Builder.git',
	            {args: path.join(__dirname, 'checkout', 'develop')}, function(err) {
	    if (err)
	    	reject(err)
	    else
	    	resolve("Success");
	  });
  	})
});


gulp.task('install', ['clone'], function(cb) {
	 process.chdir('./checkout/develop');
    exec('npm install', {maxBuffer: 1024 * 500}, function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('buildforDeploy', ['install'], function(cb) {
    exec('npm run build', {maxBuffer: 1024 * 500}, function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('move', ['buildforDeploy'], function(){
	console.log("Moving files in develop folder");
  	gulp.src('./checkout/develop/dist/**/*')
        .pipe(gulp.dest('./checkout/qaRelease/dist'));

	console.log("Moving files in develop folder");
  	packageJson = gulp.src('./checkout/develop/package.json')
      .pipe(gulp.dest('./checkout/qaRelease'));
});

gulp.task('chdirToQA', ['move'], function(cb) {
    process.chdir('../qaRelease');
});

//
//Push Work
//

gulp.task('default', ['move']);