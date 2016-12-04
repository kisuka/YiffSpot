var string = require('string');

module.exports = function (socket) {
  /**
   * Handles sending a message to the user's partner.
   * @param  String message The message to send.
   */
  socket.on('send message', function(message) {
    var partner = socket.partner;
    var msg = string(message).stripTags().s;

    if (!partner) {
      return false;
    }

    socket.broadcast.to(partner.socketId).emit('receive message', { message: msg });
  });
}