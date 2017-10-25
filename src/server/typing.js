'use strict';

module.exports = function (socket, users, token) {
  /**
   * Handles telling the partner that their partner is typing or has finished typing.
   * @param Boolean isTyping True/False for if the user is typing or stopped.
   */
  socket.on('typing', function(isTyping) {
    var currentUser = users.findClient(token);
    var partner = users.findClient(currentUser.partner);

    if (partner) {
      socket.broadcast.to(partner.socket.id).emit('partner_typing', {status: isTyping});
    }
  });
}