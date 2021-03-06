
var fs = require('fs');
var path = require('path');

var mkdirp = require('mkdirp');
var async = require('async');

module.exports = function(config, batch, reports, logger, done) {

  function log(file, cb) {
    return function (err) {
      if (err) logger.error('error writing %s', file);
      else logger.silly('wrote %s', file);
      cb(err);
    };
  }
  
  var tmpDir = path.join(__dirname, 'dist', 'data');

  var outDir = path.join(config.input.rcDir, config.outDir);
  
  logger.verbose('making tmp dir %s', tmpDir);

  mkdirp(tmpDir, function(err){
    if (err) return done(err);

    var batchFn = function(cb) {
      var file = path.join(tmpDir, 'batch.json');
      fs.writeFile(file, JSON.stringify(batch), 'utf8', log(file, cb));
    };

    var writeFns = reports.map(function(report) {
      return function(cb) {
        var file = path.join(tmpDir, report._id + '.json');
        fs.writeFile(file, JSON.stringify(report), 'utf8', log(file, cb));
      };
    });

    async.parallel([batchFn].concat(writeFns),function(err, results) {
      if (err) {
        logger.error(err);
        return done(err);
      }
      done();
    });

  });


};
