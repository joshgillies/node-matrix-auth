var url = require('url');
var soap = require('soap');
var xtend = require('xtend');
var events = require('events');
var trumpet = require('trumpet');
var hyperquest = require('hyperquest');

var getNonce = function getNonce(href, cookie, callback) {
  href = url.parse(href);
  href.query = {
    'SQ_BACKEND_PAGE': 'main',
    backend_section: 'am',
    am_section: 'edit_asset',
    assetid: '3',
    asset_ei_screen: '',
    ignore_frames: '1'
  };
  href = url.format(href);

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

module.exports = function matrixAuth(opts) {
  if (typeof opts === 'string')
    opts = url.parse(opts);

  var emitter = new events.EventEmitter();

  if (!opts.auth)
    return emitter.emit('error', new Error('User credentials not defined'));
  if (opts.wsdl) {
    opts.wsdl = url.parse(opts.wsdl);
  }
  if (opts.admin) {
    opts.admin = url.parse(opts.admin);
  }

  soap.createClient(url.format(xtend(opts.wsdl, { auth: opts.auth })), function(err, client) {
    if (err)
      return emitter.emit('error', err);

    var auth = opts.auth.split(':');

    if (!client.LoginUser)
      return emitter.emit('error', new Error('SOAP API function LoginUser not enabled'));

    client.setSecurity(new soap.BasicAuthSecurity(auth[0], auth[1]));
    client.LoginUser({ Username: auth[0], Password: auth[1] }, function(err, res) {
      if (err)
        return emitter.emit('error', err);

      opts.sessionId = res.SessionID;
      opts.sessionKey = res.SessionKey;
      opts.cookie = 'SQ_SYSTEM_SESSION=' + res.SessionID;

      getNonce(url.format(opts.admin), opts.cookie, function(err, nonce) {
        if (err)
          return emitter.emit('error', err);

        opts.nonce = nonce;
        emitter.emit('success', opts);
      });
    });
  });

  return emitter;
};
