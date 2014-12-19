var url = require('url');
var soap = require('soap');
var util = require('util');
var extend = require('xtend');
var events = require('events');
var getNonce = require('./lib/getNonce');

var Auth = function Auth(opts) {

  events.EventEmitter.call(this);

  if (typeof opts === 'string')
    opts = url.parse(opts);

  if (!opts.auth)
    return this.emit('error', new Error('User credentials not defined'));

  if (opts.wsdl)
    opts.wsdl = url.parse(opts.wsdl);

  if (opts.admin)
    opts.admin = url.parse(opts.admin);

  function complete(err, nonce) {
    if (err)
      return this.emit('error', err);

    opts.nonce = nonce;
    this.emit('success', opts);
  }

  function getSession(err, res) {
    if (err)
      return this.emit('error', err);

    opts.sessionId = res.SessionID;
    opts.sessionKey = res.SessionKey;
    opts.cookie = 'SQ_SYSTEM_SESSION=' + res.SessionID;

    getNonce(opts.admin, opts.cookie, complete.bind(this));
  }

  function getClient(err, client) {
    if (err)
      return this.emit('error', err);

    var auth = new (Function.prototype.bind.apply(soap.BasicAuthSecurity, [null].concat(opts.auth.split(':'))))();

    if (!client.LoginUser)
      this.emit('error', new Error('SOAP API function LoginUser not enabled'));

    client.setSecurity(auth);
    client.LoginUser({
      Username: auth._username,
      Password: auth._password
    }, getSession.bind(this));
  }

  soap.createClient(url.format(extend(opts.wsdl, { auth: opts.auth })), getClient.bind(this));
};

util.inherits(Auth, events.EventEmitter);

var matrixAuth = function matrixAuth(opts, callback) {
  var auth = new Auth(opts);

  if (!callback) {
    return auth;
  }

  auth.on('error', callback);
  auth.once('success', function(auth) {
    callback(null, auth);
  });

  return auth;
};

module.exports = matrixAuth;
