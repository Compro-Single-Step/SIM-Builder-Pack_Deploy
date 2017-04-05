var gulp = require('gulp');
var path = require('path');
var git = require('gulp-git');
var deploy = require('gulp-deploy-git');
var exec = require('child_process').exec;
var clean = require('gulp-clean');
var rename = require('gulp-rename');



gulp.task('clean', function () {
    return gulp.src('./checkout/', {read: false})
    	
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

gulp.task('clone1',['clean'], function(){
	
	return my_promise = new Promise( (resolve, reject) => {
	   git.clone('https://tanujaggarwal@github.com/Compro-Single-Step/SIMS-Builder.git',
	            {args: path.join(__dirname, 'checkout', 'qaRelease')}, function(err) {
	    if (err)
	    	reject(err)
	    else
	    	resolve("Success");
	  });
  	})
});
gulp.task('swtchBranch',['clone1'], function(){
	return my_promise = new Promise( (resolve, reject) => {
	  git.checkout('SIM-Builder-Release', {cwd: './checkout/qaRelease',maxBuffer: 1024 * 500},function (err) {

	    if (err)
	    	reject(err)
	    else
	    	resolve("Success");
	  });
  	})
});



gulp.task('install', ['clone','swtchBranch'], function(cb) {
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

/*gulp.task('chdirToQA', ['move'], function(cb) {
    process.chdir('../qaRelease');
});*/

//
//Push Work
//

/*gulp.task('addremote', function(){
	 //process.chdir('./checkout/qaRelease');
  git.addRemote('develop10', 'https://github.com/Compro-Single-Step/SIMS-Builder.git', function (err) {
    if (err) throw err;
  });
});

gulp.task('add', function() {
	 
  return gulp.src('./checkout/qaRelease/*')
    .pipe(git.add());
});

gulp.task('commit', ['add'], function() {
	 //process.chdir('./checkout/qaRelease');
    return gulp.src('./checkout/qaRelease/*')
      .pipe(git.commit("initial test"));
});

gulp.task('push', ['commit'], function(){
  return my_promise = new Promise( (resolve, reject) => {
  git.push('origin','SIM-Builder-Release', {refspec: 'HEAD', cwd: './checkout/qaRelease',maxBuffer: 1024 * 500}, function (err) {
    if (err)
	    	reject(err)
	    else
	    	resolve("Success");
	  });
  	})
});
*/
/*gulp.task('merge',['push'], function(){
  git.merge('develop8', function (err) {
    if (err) throw err;
  });
});*/
gulp.task('deploy', function() {
  return gulp.src('./checkout/qaRelease/**/*', { read: false})
  	
    .pipe(deploy({
      prefix: 'checkout',
      repository: 'https://github.com/Compro-Single-Step/SIMS-Builder.git',
      remoteBranch:   'SIM-Builder-Release'
    }))
});
gulp.task('default', ['move']);