# bunyan-pushover

[![Version npm](http://img.shields.io/npm/v/bunyan-pushover.svg?style=flat-square)](http://browsenpm.org/package/bunyan-pushover)[![Build Status](http://img.shields.io/travis/rexxars/bunyan-pushover/master.svg?style=flat-square)](https://travis-ci.org/rexxars/bunyan-pushover)[![Dependencies](https://img.shields.io/david/rexxars/bunyan-pushover.svg?style=flat-square)](https://david-dm.org/rexxars/bunyan-pushover)[![Coverage Status](http://img.shields.io/coveralls/rexxars/bunyan-pushover/master.svg?style=flat-square)](https://coveralls.io/r/rexxars/bunyan-pushover?branch=master)[![Code Climate](http://img.shields.io/codeclimate/github/rexxars/bunyan-pushover.svg?style=flat-square)](https://codeclimate.com/github/rexxars/bunyan-pushover/)

A [Bunyan][0] stream that logs using the [Pushover][1] service.

## Usage

``` js
  var bunyan = require('bunyan');
  var Pushover = require('bunyan-pushover');

  var logger = bunyan.createLogger({
    name: 'bunyan-pushover test',
    streams: [{
      type: 'raw',
      stream: new Pushover({
        user: 'user key',
        token: 'pushover app api token'
      })
    }]
  });
```

`bunyan-pushover` takes the following options. Both 'user' and 'token' are required:

* __user:__ The user key for the Pushover user who will receive the notifications.
* __token:__ The Pushover API token for your application.
* __device:__ The device which should receive the notifications (optional).
* __sound:__ Which custom notification sound to use (optional).
* __priority:__ Priority of messages, see https://pushover.net/api#priority (optional).
* __retry:__ How often Pushover should resend the message to the user, in seconds (optional).
* __expire:__ How many seconds notification will be retried for (optional).

## Installation

``` bash
$ npm install bunyan-pushover
```

## License

MIT-licensed. See LICENSE.

[0]: https://github.com/trentm/node-bunyan
[1]: https://pushover.net/
