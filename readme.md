# API Analytics jQuery Agent

[![Bower version](https://img.shields.io/bower/v/jquery-analytics.svg?style=flat)][repo]
[![npm version](https://img.shields.io/npm/v/jquery-analytics.svg?style=flat)][npm]
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat)][license]
[![Build Status](https://travis-ci.org/Mashape/analytics-agent-jquery.svg)][travis]
[![devDependency Status](https://david-dm.org/mashape/analytics-agent-jquery/dev-status.svg)][david]

The API Analytics jQuery agent reports API traffic passing through jQuery ajax calls. Works in all browsers where jQuery is supported and Node.js

## Quick start

- [Download the latest release][release].
- Clone the repo: `git clone https://github.com/mashape/analytics-agent-jquery.git`.
- Install with [Bower](http://bower.io): `bower install jquery-analytics`.
- Install with [npm](https://www.npmjs.com): `npm install jquery-analytics`.
- Install with [SPM](http://spmjs.io): `spm install jquery-analytics`.

## Requirements

- jQuery `1.7+`
- API Analytics Service Token `SERVICE_TOKEN`

### What's included

```
analytics-agent-jquery/
└── js/
    ├── jquery.analytics.js
    └── jquery.analytics.min.js
```

## Usage

Include `jQuery Analytics` after `jQuery`.

```js
// Basic usage
$.Analytics('SERVICE_TOKEN')

// Advanced usage
$.Analytics('SERVICE_TOKEN', {
  ... options ...
})
```

Done. Now every `global` ajax request will be logged in API Analytics.

## Options

- `serviceToken` - API Analytics service token, optional, only required when token is not first argument.
- `analyticsHost` - API Analytics hostname, defaults to `http://socket.apianalytics.com/`
- `httpVersion` - HTTP Version, defaults to `HTTP/1.1`
- `fallbackIp` - Fallback IP for Client / Server when not fetched, defaults to `127.0.0.1`
- `hostname` - Server hostname, defaults to `window.location.hostname`
- `fetchServerIp` - Flag to disable fetching server A Record, defaults to `true`
- `fetchClientIp` - Flag to disable fetching client address, defaults to `true`
- `debug` - Debug mode
- `ssl` - Flag to enable SSL support, defaults to `false`

### Disable analytics for request

To disable analytics logging for specific requests when making an ajax request
via jQuery set `global` option to `false`.

## Copyright and license

Copyright Mashape Inc, 2015.

Licensed under [the MIT License][license].

[npm]: https://www.npmjs.com/package/jquery-analytics
[repo]: https://github.com/Mashape/analytics-agent-jquery
[david]: https://david-dm.org/mashape/analytics-agent-jquery#info=devDependencies
[travis]: https://travis-ci.org/Mashape/analytics-agent-jquery
[release]: https://github.com/mashape/analytics-agent-jquery/releases "Download Mashape jQuery API Analytics Agent"
[license]: https://github.com/mashape/analytics-agent-jquery/blob/master/LICENSE
