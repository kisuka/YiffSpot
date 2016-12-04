module.exports = function (socket) {
  /**
   * Handles telling the partner that their partner is typing or has finished typing.
   * @param Boolean isTyping True/False for if the user is typing or stopped.
   */
  socket.on('typing', function(isTyping) {
    var partner = socket.partner;

    if (partner) {
      socket.broadcast.to(partner.socketId).emit('partner typing', {status: isTyping});
    }
  });
}