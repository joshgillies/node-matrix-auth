var url = require('url');
var soap = require('soap');

//soap.CookiePassThrough = requrie('./lib/CookiePassThrough.js');

var authObj = function authObj(credentials) {
  return {
    'Username': credentials[0],
    'Password': credentials[1]
  };
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

      callback(null, res);
    });
  });
};

module.exports = matrixAuth;
