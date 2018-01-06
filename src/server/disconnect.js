'use strict';

module.exports = function (users, token) {
	const currentUser = users.findClient(token);
    const partner = users.findClient(currentUser.partner);

    // Check if user has a partner
    if (partner) {
      // Disconnect user from partner.
      users.removePartner(currentUser.id);

      if (partner.socket.readyState == 1) {
      	partner.socket.send(JSON.stringify({type: 'partner_disconnected', data: true}));
      }
    }

    // Remove disconnected user from clients list
    users.removeClient(currentUser.id);
    users.decrementOnline();
}