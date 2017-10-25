'use strict';

var Cookies = require('./../../../node_modules/js-cookie/src/js.cookie');

var user        = require('./user');
var system      = require('./system');
var chat        = require('./chat');
var preferences = require('./preferences');
var partner     = require('./partner');

var token = Cookies.get('token');

var socket = io({
  transports: ['websocket'],
  query: token != undefined ? 'token=' + token : null
});

system.listen(socket, user);
chat.listen(socket, user);
preferences.listen(socket, user);
partner.listen(socket, user);
