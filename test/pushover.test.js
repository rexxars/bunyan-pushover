'use strict';

var test = require('tape');
var nock = require('nock');
var bunyan = require('bunyan');
var Pushover = require('../');

var push = new Pushover({
    user: 'myuser',
    token: 'mytoken'
});

var logger = getLogger(push);

test('it sends a message', function(t) {
    var mock = nock('https://api.pushover.net')
        .post('/1/messages.json', /token=mytoken/)
        .reply(200, { status: 1 });

    logger.fatal(
        new Error('A dangerous error'),
        'Something really bad happened'
    );

    t.ok(mock.isDone(), 'pushover request has been sent');
    t.end();
});

test('it truncates long messages', function(t) {
    t.plan(1);

    nock('https://api.pushover.net')
        .filteringRequestBody(function(body) {
            t.ok(body.match(/No{200,500}\&/), 'message is capped');
            return '*';
        })
        .post('/1/messages.json', '*')
        .reply(200, { status: 1 });

    logger.info('N' + (new Array(1024)).join('o'));
});

test('it emits error events on error', function(t) {
    t.plan(1);

    nock('https://api.pushover.net')
        .post('/1/messages.json')
        .reply(400, { status: 155 });

    push.on('error', function onErr(err) {
        t.equal(err.message, 'Pushover failed with error code 155');
        push.removeListener('error', onErr);
    });

    logger.info('Something');
});

test('it includes a sound, if specified', function(t) {
    t.plan(1);

    nock('https://api.pushover.net')
        .filteringRequestBody(function(body) {
            t.ok(body.indexOf('sound=magic') >= 0, 'includes specified sound');
            return body;
        })
        .post('/1/messages.json', /sound=magic/)
        .reply(200, { status: 1 });

    getLogger(new Pushover({
        user: 'myuser',
        token: 'mytoken',
        sound: 'magic'
    })).info('Something');
});

test('it does fail if no message is specified', function(t) {
    t.plan(1);

    nock('https://api.pushover.net')
        .filteringRequestBody(function(body) {
            t.ok(body.indexOf('msg: ') === -1, 'does not include message');
            return body;
        })
        .post('/1/messages.json')
        .reply(200, { status: 1 });

    logger.info({ bar: 'foo' });
});

function getLogger(push) {
    return bunyan.createLogger({
        name: 'bunyan-pushover test',
        streams: [{
            type: 'raw',
            stream: push
        }]
    });
}