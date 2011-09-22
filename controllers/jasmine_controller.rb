# Mocking framework needs to be plugable. Flexmock for now.

require 'flexmock/test_unit'

class JasmineController < ActionController::Base
  include FlexMock::MockContainer

  before_filter :ensure_environment
  after_filter :teardown_mocks

  def load_partial
    locals = ActiveSupport::JSON.decode(params[:locals] || {})

    mocks = generate_mocks(locals)

    helpers = ["ApplicationHelper"]
    helpers += params[:helpers] if params[:helpers]

    # Need to do a render_to_string because we need the flexmock goodness to be all finished
    # before the after_filter :teardown_mocks is called. If a normal render is done then
    # the teardown_mocks is called before the partial is rendered.

    render :text => render_to_string(:partial => 'partial_loader',
                                       :locals => { :partial_path => params[:partial_path],
                                                    :mocks        => mocks,
                                                    :builder      => params[:builder],
                                                    :helpers      => helpers })

  end

  private ######################################

  def ensure_environment
    unless Rails.env != 'production'
      raise "Must be in test or dev environment"
    end
  end

  def generate_mocks(locals = {})
    # doing this here so that we don't require flexmock in enviroments we don't want
    # requiring flexmock in production causes the test suite output to be emitted
    # when running scripts
    require 'flexmock'

    locals = locals.with_indifferent_access
    @mocks = {}

    # Makes a hash entry that looks like this:
    #  "campaign.publisher.name" => "Google"
    # into this:
    #  :campaign => flexmock {|m| m.should_receive("publisher.name").and_return("Google") }

    locals.keys.map(&:to_s).sort.each do |key|
      if key !~ /\./
        @mocks[key.to_sym] = locals[key]
      else
        methods = key.split('.')

        method_path = methods[1..-1].join('.')

        # Is this a class? i.e. Gender.all => [...]
        if methods.first =~ /^[A-Z]/
          primary_key = methods.first.constantize
          @mocks[primary_key] ||= flexmock(primary_key)
        else
          primary_key = methods.first.to_sym
          @mocks[primary_key] ||= FlexMock.new
        end

        value = locals[key]
        mockify(value)
        @mocks[primary_key].should_receive(method_path).and_return(value)
      end
    end

    # strip out the keys that are classes
    @mocks.reject { |k,v| k.is_a?(Class) }

  end

  def mockify(value)
    if value.is_a?(Array)
      value.each { |v| mockify(v) }

    elsif value.respond_to?(:keys)
      value.keys.each do |key|
        instance_eval "def value.#{key}; self[:#{key.to_sym}]; end"
      end
    end

    value
  end

  def teardown_mocks
    @mocks.each do |key, mock|
      mock.flexmock_teardown if mock.respond_to?(:flexmock_teardown)
    end
  end

end
