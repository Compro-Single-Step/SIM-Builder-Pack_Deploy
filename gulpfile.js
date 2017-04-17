var gulp = require('gulp');
var path = require('path');
var git = require('gulp-git');
var exec = require('child_process').exec;
var clean = require('gulp-clean');
var jeditor = require('gulp-json-editor');
var spawn = require('child_process').spawn;

//clean checkout folder
gulp.task('cleanCheckoutFolder', function () {
    return gulp.src('./checkout/', {read: false})
        .pipe(clean());
});

// clone source repository
gulp.task('cloneSource', ['cleanCheckoutFolder'], function(){
	return source_clone = new Promise( (resolve, reject) => {
	   git.clone('https://github.com/Compro-Single-Step/SIMS-Builder.git',
	            {args: path.join(__dirname, 'checkout', 'develop')}, function(err) {
  	    if (err)
  	    	reject(err)
  	    else
  	    	resolve("Success");
	   });
	})
});

// install source node modules
gulp.task('installSourceCode', ['cloneSource'], function(cb) {
	 process.chdir('./checkout/develop');
    exec('npm install', {maxBuffer: 1024 * 500}, function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

// building source repo code
gulp.task('buildSourceCode', ['installSourceCode'], function(cb) {
    exec('npm run build', {maxBuffer: 1024 * 500}, function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

// clone dest repository
gulp.task('cloneDest',['cleanCheckoutFolder'], function(){
  return dest_clone = new Promise( (resolve, reject) => {
     git.clone('https://github.com/Compro-Single-Step/SIMS-Builder.git',
              {args: path.join(__dirname, 'checkout', 'qaRelease')}, function(err) {
      if (err)
        reject(err)
      else
        resolve("Success");
    });
    })
});

// clean Destination folder after cloning
gulp.task('cleanDest', function(){
  return gulp.src(['./checkout/qaRelease/**', '!./checkout/qaRelease/', '!./checkout/qaRelease/.git'], {read: false})
        .pipe(clean());
});

// copying code to dest folder (dist folder and package.json)
gulp.task('package', ['buildSourceCode','cleanDest'], function(){
	 process.chdir(__dirname);
  	gulp.src('./checkout/develop/dist/**/*')
        .pipe(gulp.dest('./checkout/qaRelease/dist'));

	console.log("Moving files in develop folder");
  	packageJson = gulp.src('./checkout/develop/package.json')
      .pipe(jeditor(function(json) {
        json.scripts.start = 'node dist/server/server';
        return json; // must return JSON object. 
      }))
      .pipe(gulp.dest('./checkout/qaRelease'));
});

// git add files in dest folder 
gulp.task('add', ['package'], function(callback) {
  var cmdAdd = spawn('git', ['add', '--all', '.'], {cwd: './checkout/qaRelease'});
  cmdAdd.on('close', function(code) {
    if (code !== 0) {
      return callback('git add exited with code ' + code);
    }
    return callback(null);
  });
});

// git committ files for dest folder 
gulp.task('commit', ['add'], function(callback) {
	 var cmdCommit = spawn('git', ['commit', '-m', 'simbuilder-release'], {cwd: './checkout/qaRelease'});
   cmdCommit.on('close', function(code) {
      if (code === 1) {
        return callback('noChanges');
      }
      if (code !== 0) {
        return callback('git commit exited with code ' + code);
      }
      return callback(null);
    });

});

// git push in dest folder repository 
gulp.task('push', ['commit'], function(callback){
  var cmdPush = spawn('git', ['push', 'origin', 'SIM-Builder-Release'], {cwd: './checkout/qaRelease'});
  cmdPush.on('close', function(code) {
    if (code !== 0) {
      return callback('git push exited with code ' + code);
    }
    return callback(null);
  });

});

gulp.task('default', ['push'], function() {});
