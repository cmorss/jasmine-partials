

jasmine.getPartials = function() {
  return jasmine.currentPartials_ = jasmine.currentPartials_ || new jasmine.Partials();
};

var readPartial = function() {
  return jasmine.getPartials().proxyCallTo_('read', arguments);
};

var loadPartial = function() {
  jasmine.getPartials().proxyCallTo_('load', arguments);
};

var partialContainer = function() {
  return jasmine.getPartials().proxyCallTo_('partials');
};

// Set jasmine.partialsRoute to the route you have for JasmineController
// Here's an old school route that will work if you use the supplied controller as is.
//
// map.partial_loader 'partial_loader/:partial_path',
//                          :controller => 'jasmine',
//                          :action => 'load_partial',
//                          :partial_path => /.+/

jasmine.Partials = function() {
  jasmine.partialsRoute =  jasmine.partialsRoute || 'partial_loader';

  this.containerId = 'jasmine-partials';
  this.partialsCache_ = {};
};

jasmine.Partials.prototype.set = function(html) {
  this.cleanUp();
  this.createContainer_(html);
};

jasmine.Partials.prototype.load = function() {
  this.cleanUp();
  this.createContainer_(this.read.apply(this, arguments));
};

jasmine.Partials.prototype.read = function() {
  return this.getPartialHtml_.apply(this, arguments)
};

jasmine.Partials.prototype.clearCache = function() {
  this.partialsCache_ = {};
};

jasmine.Partials.prototype.cleanUp = function() {
  $j('#' + this.containerId).remove();
};

jasmine.Partials.prototype.sandbox = function(attributes) {
  var attributesToSet = attributes || {};
  return $j('<div id="sandbox" style="display: none;" />').attr(attributesToSet);
};

jasmine.Partials.prototype.partials = function() {
  return $j('#' + this.containerId);
};

jasmine.Partials.prototype.createContainer_ = function(html) {
  var container = $j('<div id="' + this.containerId + '" />');
  $j('body').append(container);
  container.html(html);
};

jasmine.Partials.prototype.getPartialHtml_ = function(url, options) {
  options = options || {};
  var hashKey = url + JSON.stringify(options.locals || {});

  if (typeof this.partialsCache_[hashKey] == 'undefined') {
    this.loadPartialIntoCache_(url, options);
  }
  return this.partialsCache_[hashKey];
};

jasmine.Partials.prototype.hashKey_ = function(url, locals) {
  return url + JSON.stringify(locals || {});
};

jasmine.Partials.prototype.loadPartialIntoCache_ = function(relativeUrl, options) {

  var self = this;
  var url = "/" + jasmine.partialsRoute + "/" + relativeUrl;

  options = options || {};
  locals = options.locals || {};
 
  var data = {
      locals: JSON.stringify(locals),
      partial: relativeUrl,
      helpers: options.helpers,
      builder: options.builder
    };

  $j.ajax({
    async: false, // must be synchronous to guarantee that no tests are run before partial is loaded
    cache: false,
    type: 'POST',
    data: data,
    dataType: 'html',
    url: url,
    success: function(data) {
      self.partialsCache_[self.hashKey_(relativeUrl, locals)] = data;
    },

    error: function(xhr, ajaxOptions, thrownError) {
      throw new Error("Failed to get partial with url: " + url +
                      " with " + JSON.stringify(locals) + ", Error: " + xhr.statusText);
   }
  });
};

jasmine.Partials.prototype.proxyCallTo_ = function(methodName, passedArguments) {
  return this[methodName].apply(this, passedArguments);
};

afterEach(function() {
  jasmine.getPartials().cleanUp();
});
