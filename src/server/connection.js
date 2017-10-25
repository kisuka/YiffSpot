'use strict';

var users = require("../models/users");
var uuid  = require('uuid');

module.exports = function (io) {
  /**
   * Handles the connection of a user.
   */
  io.sockets.on('connection', function(socket) {
    var token = socket.handshake.query.token || uuid.v4();

    // Check if user already has an established connection
    if (users.findClient(token)) {
      socket.emit('connection_exists');
      return false;
    }

    users.addClient(socket, token);
    users.incrementOnline();

    socket.emit('connection_established', token);

    io.sockets.emit('update_user_count', users.getOnline());
    console.log('User Connected! Total Users Online: %d', users.getOnline());

    // Events
    require('./find-partner')(socket, users, token);
    require('./block-partner')(socket, users, token);
    require('./typing')(socket, users, token);
    require('./send-message')(socket, users, token);
    require('./disconnect')(socket, users, token);
  });
};