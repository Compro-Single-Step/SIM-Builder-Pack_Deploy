var gulp = require('gulp');
var path = require('path');
var git = require('gulp-git');

var exec = require('child_process').exec;
var clean = require('gulp-clean');


gulp.task('clean', function () {
    return gulp.src('./checkout/develop', {read: false})
    	 .pipe(ignore('./checkout/develop/node_modules'))
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
	 process.chdir(__dirname);
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

// gulp.task('addremote', function(){
// 	 process.chdir('./checkout/qaRelease');
//   git.addRemote('origin', 'https://github.com/Compro-Single-Step/SIMS-Builder/tree/SIM-Builder-Release', function (err) {
//     if (err) throw err;
//   });
// });

gulp.task('add', function() {
  return gulp.src('./checkout/qaRelease/*')
    .pipe(git.add());
});

gulp.task('commit', ['add'], function() {
    return gulp.src('./*')
      .pipe(git.commit("initial test"));
});

gulp.task('push', ['commit'], function(){
  git.push('origin', 'SIM-Builder-Release', function (err) {
    if (err) throw err;
  });
});

gulp.task('default', ['move']);