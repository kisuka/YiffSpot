module.exports = function (socket, users) {
  socket.on('disconnect', function() {
    var partner = socket.partner;

    // Check if user has a partner
    if (partner) {
      // Disconnect user from partner.
      users.removePartner(partner.socketId);
      socket.broadcast.to(partner.socketId).emit('partner disconnected');
    }

    // Remove disconnected user from clients list
    users.removeClient(socket.id);
    users.decrementOnline();
    socket.broadcast.emit('update user count', users.getOnline());

    console.log('User Disconnected! Total Users Online: %d', users.getOnline());
  });
};