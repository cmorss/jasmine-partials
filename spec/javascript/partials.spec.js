describe("Jasmine Partials", function() {

  it("should load with no locals", function() {
    loadPartial("jasmine/test");
  });

  it("should load with pigs", function() {
     loadPartial("jasmine/test", {locals: {pig: 'Wilber'}});
     expect($j('#jasmine-partials')).toExist();
     expect($j('#jasmine-partials').find('h1')).toHaveText("Wilber");
   });

  it("should load with animals mocked", function() {
     loadPartial("jasmine/test", {locals: {pig: 'Wilber', "bed.room": "bathroom"}});
     expect($j('#jasmine-partials')).toExist();
     expect($j('#jasmine-partials').find('h1')).toHaveText("Wilber");
     expect($j('#jasmine-partials').find('h2')).toHaveText("bathroom");
   });

  it("should load locals with an id in it", function() {
    loadPartial("jasmine/test", {locals: {'target.dom_id': 'target_123', 'target.name.first': 'fred'} });
    expect($j('#jasmine-partials')).toExist();
    expect($j('#jasmine-partials').find('h3')).toHaveText("prefix_target_123");
  });

  it("should load locals with an integer in it", function() {
    loadPartial("jasmine/test", {locals: {
          'target.integer': 1,
          'target.name': 'fred'}
        });
    expect($j('#jasmine-partials')).toExist();
    expect($j('#jasmine-partials').find('h4')).toHaveText("1");
  });

  it("should work with a builder", function() {
    loadPartial("jasmine/test", {
        locals: {
          'target.dom_id': 'campaign_123'
        },
        builder: {
          method: 'dictionary_form_for',
          variableName: 'dictionary',
          args: [':target']}
        });
    expect($j('#jasmine-partials')).toExist();
    expect($j('#jasmine-partials').find('#builder-div')).toHaveText("Monkeys");
  });

  it("should load class mocks ", function(){
      loadPartial("jasmine/test", {
          locals: {
              'class_mock': true,
              'String.do_it' : ['hi']
          }
      });
      expect($j('#jasmine-partials').find('#class-mock')).toHaveText("hi");
  });
});
