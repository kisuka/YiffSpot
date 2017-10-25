'use strict';

module.exports = function (socket, users, token) {
  socket.on('block_partner', function () {
    var currentUser = users.findClient(token);
    var partner = users.findClient(currentUser.prevPartner);

    if (partner) {
      var clients = users.getAllClients();

      // Check if user has a partner
      if (currentUser.prevPartner != null) {
        if (clients[partner.id] != null && clients[partner.id].partner != null) {
          socket.broadcast.to(partner.socket.id).emit('partner_disconnected');
        }
        
        // Block partner
        users.blockPartner(token, partner.id);
        users.removePartner(currentUser.id);

        socket.emit('partner_blocked');
      }
    }
  });
}