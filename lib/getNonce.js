var matrixUrl = require('node-matrix-url');
var trumpet = require('trumpet');
var hyperquest = require('hyperquest');

module.exports = function getNonce(opts, cookie, callback) {
  var href = matrixUrl({
    href: typeof opts === 'string' ? opts : opts.href,
    assetId: '3'
  });
  var tr = trumpet();

  var token = tr.select('form input[name=token]');
  token.getAttribute('value', function(value) {
    if (!value.length)
      return callback(new Error('token not found'));

    callback(null, value);
  });

  var request = hyperquest(href);
  request.setHeader('Cookie', cookie);
  request.on('response', function(res) {
    if (res.statusCode === 302)
      return getNonce(opts.protocol + '//' + opts.host + res.headers.location, cookie, callback);
  });
  request.pipe(tr);
  request.on('error', function(err) {
    callback(err);
  });
};

