Wicket.Ajax.Request.prototype.createUrl = function() {
if (Wicket.Browser.isGecko()) {
this.url = this.url.substr(0, this.url.indexOf('?')) + "/"
+ this.url.substr(this.url.indexOf('?'));
}
if (this.randomURL == false) {
return this.url;
} else {
return this.url + (this.url.indexOf("?") > -1 ? "&" : "?") + "random="
+ Math.random();
}
};
