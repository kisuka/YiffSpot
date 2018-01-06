'use strict';

module.exports = function (users, token, status) {
	var currentUser = users.findClient(token);
	var partner = users.findClient(currentUser.partner);

	if (partner && partner.partner == currentUser.id) {
		if (partner.socket.readyState == 1) {
			partner.socket.send(JSON.stringify({type:'partner_typing', data: status}));
		}
	}
}