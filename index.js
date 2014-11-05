var url = require('url');
var soap = require('soap');
var util = require('util');
var extend = require('xtend');
var events = require('events');
var getNonce = require('./lib/getNonce');

var matrixAuth = function matrixAuth(opts, callback) {
  var self = this;
  if (!callback) {
    if (!(self instanceof matrixAuth))
      return new matrixAuth(opts);

    events.EventEmitter.call(self);
    callback = function(err, auth) {
      if (err) self.emit('error', err);
      self.emit('success', auth);
    };
  }

  if (typeof opts === 'string')
    opts = url.parse(opts);

  if (!opts.auth)
    return callback(new Error('User credentials not defined'));

  if (opts.wsdl)
    opts.wsdl = url.parse(opts.wsdl);

  if (opts.admin)
    opts.admin = url.parse(opts.admin);

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

      getNonce(opts.admin, opts.cookie, function(err, nonce) {
        if (err)
          return callback(err);

        opts.nonce = nonce;
        callback(null, opts);
      });
    });
  });
};

util.inherits(matrixAuth, events.EventEmitter);

module.exports = matrixAuth;
