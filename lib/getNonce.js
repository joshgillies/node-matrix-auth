var matrixUrl = require('node-matrix-url');
var trumpet = require('trumpet');
var hyperquest = require('hyperquest');

module.exports = function getNonce(href, cookie, callback) {
  href = matrixUrl({
    href: href,
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
  request.pipe(tr);
  request.on('error', function(err) {
    callback(err);
  });
};

