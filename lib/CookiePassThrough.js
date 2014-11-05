var xtend = require('xtend');

function CookiePassThrough(cookie, defaults) {
  this._cookie = cookie;
  this.defaults = {};
  xtend(this.defaults, defaults);
}

CookiePassThrough.prototype.addHeaders = function(headers) {
  headers.Cookie = this._cookie;
};

CookiePassThrough.prototype.toXML = function() {
  return '';
};

CookiePassThrough.prototype.addOptions = function(options) {
  xtend(options, this.defaults);
};

module.exports = CookiePassThrough;
