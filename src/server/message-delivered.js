'use strict';

module.exports = function (users, token, extra) {
	if (extra) {
		const currentUser = users.findClient(token);
		const partner = users.findClient(currentUser.partner);

		if (partner.socket.readyState == 1) {
			partner.socket.send(JSON.stringify({type: 'message_delivered', '@extra': extra}));
		}
	}
};