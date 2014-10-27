node-matrix-auth
================

Authentication with Squiz Matrix from Node.js

Example
-------

```js
var matrixAuth = require('node-matrix-auth')({
  auth: 'admin:pass',
  admin: 'http://mysource.matrix/_admin',
  wsdl: 'http://mysource.matrix/_web_services/soap?wsdl'
});

matrixAuth.on('error', function(err) {
  console.log(err);
});

matrixAuth.on('success', function(auth) {
  console.log(auth);
});
```

matrixAuth will return an object with the following properties:

* `auth`: The user authentication information
* `admin`: The result of passing opts.admin into url.parse
* `wsdl`: The result of passing opts.wsdl into url.parse
* `nonce`: The nonce token used to sign certain requests to Matrix.
* `cookie`: The session cookie used to sign requests to Matrix.
* `sessionId`: The ID assigned to the authenticated session.
* `sessionKey`:  The key assigned to the authenticated session.

Requirements
------------

* Squiz Matrix ~4.18.0
* A user accout with backend or greater privillages
* A SOAP API with the `LoginUser` service enabled

License
-------

MIT
