/*!
 * jquery.analytics.js
 * API Analytics agent for jQuery
 * https://github.com/Mashape/analytics-jquery-agent
 *
 * Copyright (c) 2015, Mashape (https://www.mashape.com)
 * Released under the MIT license
 * https://github.com/Mashape/analytics-jquery-agent/blob/master/LICENSE
 *
 * @version 1.3.0
 * @date Tue Jun 23 2015 14:24:07 GMT-0700 (PDT)
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory)
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'))
  } else {
    factory(jQuery)
  }
})(function (jQuery) {
  'use strict'

  // Default Constants
  var PLUGIN_NAME = 'Analytics'
  var PLUGIN_VERSION = '1.3.0'
  var PLUGIN_AGENT_NAME = 'mashape-analytics-agent-jquery'
  var ANALYTICS_HOST = 'socket.analytics.mashape.com/'
  var FALLBACK_IP = '127.0.0.1'
  var HTTP_VERSION = 'HTTP/1.1'
  var ENVIRONMENT = ''
  var PROTOCOL = 'http://'
  var ALF_VERSION = '1.0.0'
  var CLIENT_IP = FALLBACK_IP
  var SERVER_IP = FALLBACK_IP
  var DEBUG = false
  var READY = false

  // This is not a service token.
  var TOKEN = 'SKIjLjUcjBmshb733ZqAGiNYu6Qvp1Ue0XGjsnYZRXaI8y1U4O'

  // Globals
  var $document = jQuery(document)
  var queue = []

  /**
   * Plugin constructor
   *
   * @param {String} token
   * @param {Object} options
   */
  function Plugin (token, options) {
    // Constants configuration
    ANALYTICS_HOST = options.analyticsHost || ANALYTICS_HOST
    HTTP_VERSION = options.httpVersion || HTTP_VERSION
    FALLBACK_IP = options.fallbackIp || FALLBACK_IP
    SERVER_IP = options.serverIp || FALLBACK_IP
    CLIENT_IP = options.clientIp || FALLBACK_IP
    PROTOCOL = options.ssl ? 'https://' : PROTOCOL
    DEBUG = options.debug || DEBUG

    // Service token
    this.serviceToken = token
    this.hostname = options.hostname || (window ? (window.location ? window.location.hostname : false) : false)
    this.fetchClientIp = typeof options.fetchClientIp === 'undefined' ? true : options.fetchClientIp
    this.fetchServerIp = typeof options.fetchServerIp === 'undefined' ? true : options.fetchServerIp

    // Initialize
    this.init()
  }

  // Extend
  jQuery.extend(Plugin.prototype, {
    init: function () {
      var self = this

      this.getClientIp(function () {
        self.getServerIp(function () {
          self.onReady()
        })
      })

      $document.ajaxSend(this.onSend.bind(this))
      $document.ajaxComplete(this.onComplete.bind(this))
    },

    getServerIp: function (next) {
      var url = PROTOCOL + 'statdns.p.mashape.com/' + this.hostname + '/a?mashape-key=' + TOKEN

      if (this.fetchServerIp && typeof this.hostname === 'string' && this.hostname.length !== 0) {
        return jQuery.ajax({
          url: url,
          type: 'GET',
          global: false,

          success: function (data) {
            SERVER_IP = data.answer[0].rdata
          },

          complete: function () {
            next()
          }
        })
      } else {
        return next()
      }
    },

    getClientIp: function (next) {
      if (this.fetchClientIp) {
        return jQuery.ajax({
          url: PROTOCOL + 'httpbin.org/ip',
          type: 'GET',
          global: false,

          success: function (data) {
            CLIENT_IP = data.origin
          },

          complete: function () {
            next()
          }
        })
      }

      next()
    },

    onReady: function () {
      if (!queue) {
        return
      }

      var entry

      // System is ready to send alfs
      READY = true

      // Send queued alfs
      for (var i = 0, length = queue.length; i < length; i++) {
        // Obtain entry
        entry = queue[i]

        // Update addresses
        entry.alf.output.har.log.entries[0].serverIpAddress = this.serverIp
        entry.alf.output.har.log.entries[0].clientIpAddress = this.clientIp

        // Send
        entry.alf.send(entry.options)
      }

      // Clear queue
      queue = null
    },

    onSend: function (event, xhr, options) {
      // Save start time
      options._startTime = +(new Date())
      options._sendTime = options._startTime - event.timeStamp
    },

    onComplete: function (event, xhr, options, data) {
      // Start new alf object
      var alf = new Plugin.Alf(this.serviceToken, {
        name: PLUGIN_AGENT_NAME,
        version: PLUGIN_VERSION
      })

      // Type
      options.type = options.type.toUpperCase()

      // Modifiers
      var start = options._startTime
      var end = event.timeStamp
      var difference = end - start
      var url = options.url
      var responseHeaders = Plugin.getResponseHeaderObject(xhr)
      var headers = options.headers
      var query = options.type === 'GET' ? options.data : {}
      var responseBodySize
      var bodySize
      var body

      // Obtain body
      try {
        body = options.type === 'GET' ? typeof options.data === 'string' ?
          options.data : JSON.stringify(options.data) : ''
      } catch (e) {
        body = ''
      }

      // Obtain bytesize of body
      bodySize = Plugin.getStringByteSize(body || '')
      responseBodySize = Plugin.getStringByteSize(xhr.responseText || '')

      // Handle Querystring
      if (typeof query === 'string') {
        query = Plugin.parseQueryString(query)
      }

      // Get Querystring from URL
      if (url.indexOf('?') !== -1) {
        jQuery.extend(query, Plugin.parseQueryString(url))
      }

      // Convert query to alf style
      query = Plugin.marshalObjectToArray(query)

      // Convert headers to alf style
      headers = Plugin.marshalObjectToArray(headers)
      responseHeaders = Plugin.marshalObjectToArray(responseHeaders)

      // Insert entry
      alf.entry({
        startedDateTime: new Date(start).toISOString(),
        serverIpAddress: SERVER_IP,
        time: difference,
        request: {
          method: options.type,
          url: options.url,
          httpVersion: HTTP_VERSION,
          queryString: query,
          headers: headers,
          cookies: [],
          headersSize: -1,
          bodySize: bodySize
        },
        response: {
          status: xhr.status,
          statusText: xhr.statusText,
          httpVersion: HTTP_VERSION,
          headers: responseHeaders,
          cookies: [],
          headersSize: -1,
          bodySize: responseBodySize
        },
        timings: {
          blocked: 0,
          dns: 0,
          connect: 0,
          send: options._sendTime,
          wait: difference,
          receive: 0,
          ssl: 0
        }
      })

      if (DEBUG) {
        options._alf = alf
      }

      if (!READY) {
        queue.push({
          options: DEBUG ? options : undefined,
          alf: alf
        })
      } else {
        alf.send(DEBUG ? options : undefined)
      }
    }
  })

  /**
   * Alf Constructor
   */
  Plugin.Alf = function Alf (serviceToken, creator) {
    this.output = {
      version: ALF_VERSION,
      environment: ENVIRONMENT,
      serviceToken: serviceToken,
      clientIpAddress: CLIENT_IP,
      har: {
        log: {
          version: '1.2',
          creator: creator,
          entries: []
        }
      }
    }
  }

  /**
   * Push ALF Har-esque entry to entries list
   *
   * @param  {Object} item
   */
  Plugin.Alf.prototype.entry = function (item) {
    this.output.har.log.entries.push(item)
  }

  /**
   * Send ALF Object to ANALYTICS_HOST
   */
  Plugin.Alf.prototype.send = function (options) {
    var request = {
      url: PROTOCOL + ANALYTICS_HOST,
      global: false,
      type: 'POST',
      data: JSON.stringify(this.output),
      dataType: 'json',
      contentType: 'application/json'
    }

    if (!DEBUG) {
      jQuery.ajax(request)
    }

    if (options) {
     options._alfRequest = request
    }
  }

  /**
   * Parses XMLHttpRequest getAllResponseHeaders into a key-value map
   *
   * @param {Object} xhrObject
   */
  Plugin.getResponseHeaderObject = function getResponseHeaderObject (xhrObject) {
    var headers = xhrObject.getAllResponseHeaders()
    var list = {}
    var pairs

    if (!headers) {
      return list
    }

    pairs = headers.split('\u000d\u000a')

    for (var i = 0, length = pairs.length; i < length; i++) {
      var pair = pairs[i]

      // Can't use split() here because it does the wrong thing
      // if the header value has the string ": " in it.
      var index = pair.indexOf('\u003a\u0020')

      if (index > 0) {
        var key = pair.substring(0, index)
        var val = pair.substring(index + 2)
        list[key] = val
      }
    }

    return list
  }

  /**
   * Returns the specified string as a key-value object.
   * Reoccuring keys become array values.
   *
   * @param  {String} string
   * @return {Object}
   */
  Plugin.parseQueryString = function parseQueryString (string) {
    if (!string) {
      return {}
    }

    string = decodeURIComponent(string)

    var index = string.indexOf('?')
    var result = {}
    var pairs

    string = (index !== -1 ? string.slice(0, index) : string)
    string = string.replace(/&+/g, '&').replace(/^\?*&*|&+$/g, '')

    if (!string) {
      return result
    }

    pairs = string.split('&')

    for (var i = 0, length = pairs.length; i < length; i++) {
      var pair = pairs[i].split('=')
      var key = pair[0]
      var value = pair[1]

      if (key.length) {
        if (result[key]) {
          if (!result[key].push) {
            result[key] = [result[key]]
          }

          result[key].push(value || '')
        }
      } else {
        result[key] = value || ''
      }
    }

    return result
  }

  /**
   * Returns an Array of Objects containing the properties name, and value.
   *
   * @param  {Object} object Object to be marshalled to an Array
   * @return {Array}
   */
  Plugin.marshalObjectToArray = function marshalObjectToArray (object) {
    var output = []

    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        output.push({
          name: key,
          value: object[key]
        })
      }
    }

    return output
  }

  /**
   * Returns the bytesize of the specified UTF-8 string
   *
   * @param  {String} string UTF-8 string to run bytesize calculations on
   * @return {Number} Bytesize of the specified string
   */
  Plugin.getStringByteSize = function getStringByteSize (string) {
    return encodeURI(string).split(/%(?:u[0-9A-F]{2})?[0-9A-F]{2}|./).length - 1
  }

  // Export plugin
  jQuery[PLUGIN_NAME] = function (token, options) {
    // Support object style initialization
    if (typeof token === 'object') {
      options = token
      token = options.serviceToken
    }

    // Setup options
    options = options || {}

    // Check service token
    if (typeof token !== 'string' || token.length === 0) {
      throw {
        name: 'MissingArgument',
        message: 'Service token is missing'
      }
    }

    // Initialize plugin
    return new Plugin(token, options)
  }

  return Plugin
})
