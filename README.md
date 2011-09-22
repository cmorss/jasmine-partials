JASMINE PARTIALS
================

Note: First phase of jasmine-partials. This needs to be enhanced to be a Rails plugin as
opposed to having to copy and paste.

Use Rails Partials in your Jasmine Tests. Javascript can often be very dependant on the
partials that your application generates. Setting up static fixtures is one option, however
that means keeping your fixtures current with your pages/partials. Jasmine-partials allows you
to test your javascript against the actual markup that it depends on.

Configuration
-------------

Add a route for the jasmine controller that looks something like this:

``` ruby
  map.partial_loader 'partial_loader/:partial_path',
        :controller => 'jasmine',
        :action => 'load_partial',
        :partial_path => /.+/
```

If you changed the route above you then need to let the partial loader know:

``` javascript
  jasmine.partialsRoute = 'my_partial_loader_path';
```

Add the jasmine_controller.rb file to your app/controllers directory.
Add the partials.js file to your jasmine spec helpers directory.

Mostly you'll want to use the dom_id extension (see usage below). Add the method_chain method
from the application_helper.rb file.

Will get this mess cleaned up via:

``` ruby
    # Need to create a JasminePartial::Plugin::Rack class.
    Rails.configuration.middleware.use(JasminePartial::Plugin::Rack)
```  

... but until then you need this mess in your apache httpd.conf and you hit localhost/jasmine
to run your tests:

```
ProxyPass /jasmine http://127.0.0.1:8888
ProxyPass /__spec__ http://127.0.0.1:8888/__spec__
ProxyPass /__JASMINE_ROOT__ http://127.0.0.1:8888/__JASMINE_ROOT__
ProxyPass /public/ http://127.0.0.1:8888/public/
```

ProxyPass / http://127.0.0.1:3000/


Usage
-----

Here's a simple jasmine spec with partial loading:

``` javascript
  it("should load locals with an integer in it", function() {
    loadPartial("account/header", {
      locals: {
          'account.name':    'Fred'}
      });
    expect($j('#jasmine-partials').find('h1')).toHaveText("Fred");
  });
```

The above example renders the account/header partial passing in a locals hash containing
a mock account that will return 'Fred' for the name attribute. Note: only partials are supported.

Check out the locals that are passed to this call. By design this is the ONLY way to get values
into your partials. Currently Flexmock is being used to generate mocks (to be made plugable down
the road).

In many views the rails helper method dom_id() is used. Since everything is mocked there
is now way for the standard rails dom_id() method to know the record type and generate the
correct dom id. Provided the application_helper.rb file was updated when you setup jasmine-partials
you can simply specify the dom id to in your parital just like any other mocked variable:

``` javascript
    locals: {
        'account.dom_id':  'account_123',
        'account.name':    'Fred'}
    });
```

To pass in a form builder into your partial add a builder object to the options you pass
to the loadPartial() call. Builder expects a 'method'. This is the helper method that
creates your builder. 'args' are the arguments to pass builder. Right now only the first
arg is used. If it's a symbol that symbol is passed directly to the method call. Otherwise
that arg is used to as a key to the locals hash. 'name' is the key into the locals hash
for the builder instance.

``` javascript
  builder: {
    method:       'dictionary_form_for',
    args:         [':target'],
    name: 'dictionary'
    }
  });
```
