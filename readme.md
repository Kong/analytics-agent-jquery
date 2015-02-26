# API Analytics jQuery Agent

[![Bower version](https://img.shields.io/bower/v/jquery-analytics.svg?style=flat)][repo]
[![npm version](https://img.shields.io/npm/v/jquery-analytics.svg?style=flat)][npm]
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat)][license]
[![Build Status](https://travis-ci.org/Mashape/analytics-agent-jquery.svg)][travis]
[![devDependency Status](https://david-dm.org/mashape/analytics-agent-jquery/dev-status.svg)][david]

## Quick start

- [Download the latest release][release].
- Clone the repo: `git clone https://github.com/mashape/analytics-agent-jquery.git`.
- Install with [Bower](http://bower.io): `bower install jquery-analytics`.
- Install with [npm](https://www.npmjs.com): `npm install jquery-analytics`.
- Install with [SPM](http://spmjs.io): `spm install jquery-analytics`.

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
$.Analytics('Place Service Token Here')
```

Done. Now every global ajax request will be logged in API Analytics.

## Requirements

- jQuery `1.7+`
- API Analytics `Service Token`

## Copyright and license

Copyright Mashape Inc, 2015.

Licensed under [the MIT License][license].

[npm]: https://www.npmjs.com/package/jquery-analytics
[repo]: https://github.com/mashape/analytics-agent-jquery
[david]: https://david-dm.org/mashape/analytics-agent-jquery#info=devDependencies
[travis]: https://travis-ci.org/mashape/analytics-agent-jquery
[release]: https://github.com/mashape/analytics-agent-jquery/releases "Download Mashape jQuery API Analytics Agent"
[license]: https://github.com/mashape/analytics-agent-jquery/blob/master/LICENSE