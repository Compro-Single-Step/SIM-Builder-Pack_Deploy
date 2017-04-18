var gulp = require('gulp');
var path = require('path');
var git = require('gulp-git');
var exec = require('child_process').exec;
var jeditor = require('gulp-json-editor');
var spawn = require('child_process').spawn;
var del = require('del');
var fs = require('fs');

//clean checkout folder
gulp.task('cleanCheckoutFolder', function () {
    return del(['checkout/**']);
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
    process.chdir('./checkout/develop');
    exec('npm run build', {maxBuffer: 1024 * 500}, function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

// clone dest repository
gulp.task('cloneDest',['cleanCheckoutFolder'], function(){
  process.chdir(__dirname);
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

// switch dest branch
gulp.task('switchDestBranch', ['cloneDest'], function(callback){
  process.chdir(__dirname);
  var cmdCheckout = spawn('git', ['checkout', 'SIM-Builder-Release'], {cwd: './checkout/qaRelease'});
  cmdCheckout.on('close', function(code) {
    if (code !== 0) {
      return callback('git destination checkout exited with code ' + code);
    }
    return callback(null);
  });
});

// clean Destination folder after cloning
gulp.task('cleanDest', ['switchDestBranch'],  function(callback){
  var clean = function(folder) {
    fs.readdirSync(folder).forEach(function(file) {
      var filePath = path.normalize(path.join(folder, file));
      stats = fs.lstatSync(filePath);
      if (stats.isDirectory()) {
        if (file !== '.git') {
          clean(filePath, callback);
        }
        return;
      }
      fs.unlinkSync(filePath);
    });
  }
  try {
    clean(path.join(__dirname, 'checkout', 'qaRelease'));
    callback(null);
  } catch (err) {
    callback(err);
  }
});

// copying code to dest folder (dist folder and package.json)
gulp.task('packageDistFolder', ['buildSourceCode', 'cleanDest'], function(){
	   process.chdir(__dirname);
  	 return gulp.src('./checkout/develop/dist/**/*')
        .pipe(gulp.dest('./checkout/qaRelease/dist'));
});

// copying and updating package.json
gulp.task('copyPackageJSON', ['buildSourceCode', 'cleanDest'], function(){
     process.chdir(__dirname);
     return gulp.src('./checkout/develop/package.json')
      .pipe(jeditor(function(json) {
        json.scripts.start = 'node dist/server/server';
        return json; // must return JSON object. 
      }))
      .pipe(gulp.dest('./checkout/qaRelease'));
});

// git add files in dest branch
gulp.task('add', ['copyPackageJSON', 'packageDistFolder'], function(callback) {
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


//git tag the commit
gulp.task('addTag', ['push'], function(callback) {
   var cmdTag = spawn('git', ['tag', 'v1.7'], {cwd: './checkout/qaRelease'});
   cmdTag.on('close', function(code) {
      if (code !== 0) {
        return callback('git add tag exited with code ' + code);
      }
      return callback(null);
    });
});

// git push the tag
gulp.task('pushTag', ['addTag'], function(callback) {
   var cmdPushTag = spawn('git', ['push', 'origin', 'v1.7'], {cwd: './checkout/qaRelease'});
   cmdPushTag.on('close', function(code) {
    if (code !== 0) {
      return callback('git push tag exited with code ' + code);
    }
    return callback(null);
  });
});

gulp.task('default', ['pushTag']);
