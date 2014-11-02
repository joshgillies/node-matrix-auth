var url = require('url');
var soap = require('soap');
var extend = require('xtend');
var trumpet = require('trumpet');
var hyperquest = require('hyperquest');
var matrixUrl = require('node-matrix-url');

var getNonce = function getNonce(href, cookie, callback) {
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

module.exports = function matrixAuth(opts, callback) {
  if (typeof opts === 'string')
    opts = url.parse(opts);

  if (!opts.auth)
    return callback(new Error('User credentials not defined'));

  if (opts.wsdl) {
    opts.wsdl = url.parse(opts.wsdl);
  }
  if (opts.admin) {
    opts.admin = url.parse(opts.admin);
  }

  soap.createClient(url.format(extend(opts.wsdl, { auth: opts.auth })), function(err, client) {
    if (err)
      return callback(err);

    var auth = new (Function.prototype.bind.apply(soap.BasicAuthSecurity, [null].concat(opts.auth.split(':'))))();

    if (!client.LoginUser)
      callback(new Error('SOAP API function LoginUser not enabled'));


    client.setSecurity(auth);
    client.LoginUser({
      Username: auth._username,
      Password: auth._password
    }, function(err, res) {
      if (err)
        return callback(err);

      opts.sessionId = res.SessionID;
      opts.sessionKey = res.SessionKey;
      opts.cookie = 'SQ_SYSTEM_SESSION=' + res.SessionID;

      getNonce(url.format(opts.admin), opts.cookie, function(err, nonce) {
        if (err)
          return callback(err);

        opts.nonce = nonce;
        callback(null, opts);
      });
    });
  });
};
