'use strict';

module.exports = function (socket, users, token) {
  socket.on('disconnect', function(reason) {
    var currentUser = users.findClient(token);
    var partner = users.findClient(currentUser.partner);

    // Check if user has a partner
    if (partner) {
      // Disconnect user from partner.
      users.removePartner(currentUser.id);
      socket.broadcast.to(partner.socket.id).emit('partner_disconnected');
    }

    // Remove disconnected user from clients list
    users.removeClient(currentUser.id);
    users.decrementOnline();
    socket.broadcast.to(currentUser.id).emit('update_user_count', users.getOnline());
    socket.broadcast.emit('update_user_count', users.getOnline());

    console.log('User Disconnected! Total Users Online: %d', users.getOnline());
  });
};