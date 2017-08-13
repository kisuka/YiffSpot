var users = require("../models/users");

module.exports = function (io) {
  /**
   * Handles the connection of a user.
   */
  io.sockets.on('connection', function(socket) {
    users.addClient(socket);
    users.incrementOnline();

    io.sockets.emit('update_user_count', users.getOnline());
    socket.broadcast.emit('update_user_count', users.getOnline());
    console.log('User Connected! Total Users Online: %d', users.getOnline());

    // Events
    require('./find-partner')(socket, users);
    require('./block-partner')(socket);
    require('./typing')(socket);
    require('./send-message')(socket);
    require('./disconnect')(socket, users);
  });
};