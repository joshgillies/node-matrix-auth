var url = require('url');
var http = require('http');
var https = require('https');
var soap = require('soap');
var trumpet = require('trumpet');

//soap.CookiePassThrough = requrie('./lib/CookiePassThrough.js');

var authObj = function authObj(credentials) {
  return {
    'Username': credentials[0],
    'Password': credentials[1]
  };
};

var getNonce = function getNonce(host, cookie, callback) {
  host = url.parse(host + '/_admin/');
  host.query = {
    'SQ_BACKEND_PAGE': 'main',
    backend_section: 'am',
    am_section: 'edit_asset',
    assetid: '3',
    asset_ei_screen: '',
    ignore_frames: '1'
  };
  host = url.parse(url.format(host));
  host.headers = {
    'Cookie': cookie
  };

  var tr = trumpet();

  var token = tr.select('form input[name=token]');
  token.getAttribute('value', function(value) {
    if (!value.length)
      return callback(new Error('token not found'));

    callback(null, value);
  });

  var get = host.protocol === 'https:' ? https.get : http.get;
  get(host, function(res) {
    res.pipe(tr);
    res.on('error', function(err) {
      callback(err);
    });
  });
};

var matrixAuth = function matrixAuth(opts, callback) {
  if (typeof opts === 'string')
    opts = url.parse(opts);

  if (!opts.auth)
    return callback(new Error('User credentials not defined'));

  var auth = authObj(opts.auth.split(':'));

  soap.createClient(url.format(opts), function(err, client) {
    if (err)
      return callback(err);

    if (!client.LoginUser)
      return callback(new Error('SOAP API function LoginUser not enabled'));

    //client.setSecurity(new soap.CookiePassThrough(cookie));
    client.setSecurity(new soap.BasicAuthSecurity(auth.Username, auth.Password));
    client.LoginUser(auth, function(err, res) {
      if (err)
        return callback(err);

      res.cookie = 'SQ_SYSTEM_SESSION=' + res.SessionID;

      getNonce(opts.protocol + '//' + opts.host, res.cookie, function(err, token) {
        if (err)
          return callback(err);

        res.nonce = token;
        callback(null, res);
      });
    });
  });
};

module.exports = matrixAuth;
