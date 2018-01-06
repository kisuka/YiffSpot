'use strict';

module.exports = function (clients, data) {
	clients.forEach(function each(client) {
		if (client.readyState == 1) {
			client.send(JSON.stringify(data));
		}
	})
}