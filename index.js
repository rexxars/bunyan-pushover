'use strict';

var util = require('util');
var extend = require('util-extend');
var stream = require('stream');
var Push = require('pushover-notifications');
var Stream = stream.Writable || stream.Stream;

// Levels
var LEVELS = {
    10: 'TRACE',
    20: 'DEBUG',
    30: 'INFO',
    40: 'WARN',
    50: 'ERROR',
    60: 'FATAL',
};

/**
 * Convert level integer to level name string
 */
function levelName(level) {
    return LEVELS[level] || 'LVL' + level;
}

module.exports = Pushover;

function Pushover(options) {
    Stream.call(this);
    this.writable = true;

    this.options = extend({}, options);
    this.pushover = new Push(options);
}

util.inherits(Pushover, Stream);

Pushover.prototype.write = function(log) {
    var msg = {
        title: formatSubject(log),
        message: formatBody(log),
        timestamp: Math.round(log.time.getTime() / 1000)
    };

    ['sound', 'device', 'priority', 'retry', 'expire'].forEach(function(prop) {
        if (this.options.hasOwnProperty(prop)) {
            msg[prop] = this.options[prop];
        }
    }, this);

    // Pushover can only handle a combined title and message length of 512,
    // so if the message is too long, trim it down to size.
    if (msg.title.length + msg.message.length > 512) {
        msg.message = msg.message.substr(0, 512 - msg.title.length);
    }

    var emit = this.emit.bind(this);
    this.pushover.send(msg, function(err, res) {
        if (err) {
            return emit('error', err);
        }

        var result;
        try {
            result = JSON.parse(res);    
        } catch (e) {}
        
        if (result.status !== 1) {
            emit('error', new Error('Pushover failed with error code ' + result.status));
        }
    });
};

function formatSubject(log) {
    console.log('LEVEL: ', log.level);
    return util.format(
        '[%s] %s/%s on %s',
        levelName(log.level),
        log.name,
        log.pid,
        log.hostname
    );
}

function formatBody(log) {
    var rows = [];

    if (log.msg) {
        rows.push('msg: ' + log.msg);
    }

    if (log.err) {
        rows.push('err: ' + log.err.message);
    }

    return rows.join('\n');
}
