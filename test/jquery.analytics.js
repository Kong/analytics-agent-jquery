/*global describe, afterEach, it, assert, jQuery, sinon */

describe('jquery.analytics.js', function () {
  afterEach(function () {
    if (typeof jQuery.ajax.restore === 'function') {
      jQuery.ajax.restore()
    }
  })

  it('should throw an error when no token is given', function () {
    var fixture = {
      name: 'MissingArgument',
      message: 'Service token is missing'
    }

    try {
      jQuery.Analytics()
    } catch (e) {
      assert(e.name === fixture.name && e.message === fixture.message)
    }
  })

  it('should allow passing token as a string', function () {
    assert(jQuery.Analytics('token').serviceToken === 'token')
  })

  it('should support passing options object as first argument', function () {
    var analytics = jQuery.Analytics({
      serviceToken: 'token'
    })

    assert(analytics.serviceToken === 'token')
  })

  it('should not request CLIENT IP when flag is set to false', function () {
    sinon.stub(jQuery, 'ajax')

    jQuery.Analytics({
      serviceToken: 'token',
      fetchClientIp: false
    })

    assert(!jQuery.ajax.called)
  })

  it('should request CLIENT IP when flag is set to true', function () {
    sinon.stub(jQuery, 'ajax')

    jQuery.Analytics({
      serviceToken: 'token'
    })

    assert(jQuery.ajax.called)
  })

  it('should not request SERVER IP when flag is set to false', function () {
    sinon.stub(jQuery, 'ajax')

    jQuery.Analytics({
      serviceToken: 'token',
      fetchClientIp: false,
      fetchServerIp: false
    })

    assert(!jQuery.ajax.called)
  })

  it('should request SERVER IP when flag is set to true', function () {
    sinon.stub(jQuery, 'ajax')

    jQuery.Analytics({
      serviceToken: 'token',
      fetchClientIp: false,
      fetchServerIp: true,
      hostname: 'mashape.com'
    })

    assert(jQuery.ajax.called)
  })

  it('should properly support sending analytics on global requests', function (done) {
    var fixture = 'socket-staging.apianalytics.com/'

    jQuery.Analytics('token', {
      analyticsHost: fixture,
      debug: true
    })

    var $document = jQuery(document)

    var handler = function (event, xhr, options, data) {
      assert(options._alfRequest)
      assert(options._alfRequest.url === 'http://' + fixture)

      $document.unbind('ajaxComplete', handler)

      done()
    }

    $document.ajaxComplete(handler)

    jQuery.ajax({
      url: 'http://httpbin.org/get',
      type: 'GET'
    })
  })

  it('should properly create analytics log format', function (done) {
    jQuery.Analytics('token', {
      analyticsHost: 'socket.apianalytics.com/',
      debug: true
    })

    var $document = jQuery(document)
    var handler = function ajaxCompleteHandler (event, xhr, options, data) {
      assert(options._alf.output.serviceToken === 'token')
      assert(options._alf.output.environment === '')
      assert(options._alf.output.version === '1.0.0')
      assert(options._alf.output.har)
      assert(options._alf.output.har.log)
      assert(options._alf.output.har.log.version === '1.2')
      assert(typeof options._alf.output.har.log.creator === 'object')
      assert(typeof options._alf.output.har.log.entries === 'object' && typeof options._alf.output.har.log.entries.length === 'number')
      assert(typeof options._alf.output.har.log.entries[0] !== 'undefined')

      $document.unbind('ajaxComplete', handler)

      done()
    }

    $document.ajaxComplete(handler)

    jQuery.ajax({
      url: 'http://httpbin.org/get',
      type: 'GET'
    })
  })
})
