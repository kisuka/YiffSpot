'use strict';

module.exports = function (users, token) {
  var currentUser = users.findClient(token);
    var partner = users.findClient(currentUser.partner);

    if (partner) {
    var clients = users.getAllClients();

    // Check if user has a partner
    if (currentUser.partner != null) {
      // Block partner
      users.removePartner(currentUser.id);
      users.blockPartner(token, partner.id);


      // Send generic left message to partner.
      if (clients[partner.id] != null && clients[partner.id].partner != null) {
        if (partner.socket.readyState == 1) {
          partner.socket.send(JSON.stringify({type:'partner_left', data: true}));
        }
      }

      if (currentUser.socket.readyState == 1) {
        currentUser.socket.send(JSON.stringify({type:'partner_blocked', data: true}));
      }
    }
  }
}