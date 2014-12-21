# node-matrix-auth

Authentication with Squiz Matrix from Node.js

# Example

```js
var matrixAuth = require('node-matrix-auth');

var auth = matrixAuth({
  auth: 'user:pass',
  admin: 'http://mysource.matrix/_admin',
  wsdl: 'http://mysource.matrix/_web_services/soap?wsdl'
});

auth.on('error', function(err) {
  console.error(err);
});

auth.on('success', function(data) {
  console.log(data);
});
```

# API

```javascript
var matrixAuth = require('node-matrix-auth');
```

## var auth = matrixAuth(opts, cb);

The `opts` object is used to pass configuration to `matrixAuth`.

 * `opts.auth`: The user credentials you wish to authenticate with in the form of 'user:pass'.
 * `opts.admin`: The Admin URI of a Matrix system.
 * `opts.wsdl`: The URI of a configured SOAP API.

The optional callback `cb(err, data)` is called when either the `error` or `success` event is fired.

## auth._ready;

The private method `auth._ready` returns `true` if authentication was successful.

# Events

`matrixAuth` returns an instance of `EventEmitter`, and exposes the following events:

## auth.on('success', function(data) {});

The `success` event returns a JavaScript Object with the following properties:

 * `data.auth`: The user authentication information
 * `data.admin`: The result of passing opts.admin into url.parse
 * `data.wsdl`: The result of passing opts.wsdl into url.parse
 * `data.nonce`: The nonce token used to sign certain requests to Matrix.
 * `data.cookie`: The session cookie used to sign requests to Matrix.
 * `data.sessionId`: The ID assigned to the authenticated session.
 * `data.sessionKey`:  The key assigned to the authenticated session.

## auth.on('error', function(err) {});

The `error` event returns an Error object and is fired if an error occurs during authentication.

# Requirements

* Squiz Matrix ~4.18.0
* A user accout with backend or greater privillages
* A SOAP API with the `LoginUser` service enabled

# Install

`npm install node-matrix-auth`

# License

MIT
