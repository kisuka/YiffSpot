const users = require('../models/users');

const send_message = require('./send-message'),
  typing = require('./is-typing'),
  find_partner = require('./find-partner'),
  block_partner = require('./block-partner'),
  disconnect = require('./disconnect');

const uuid = require('uuid');

module.exports = (io) => {

  // Establish web socket connection
  io.on('connection', (socket) => {
    const token =
      (socket.handshake.query['user-id'] != undefined &&
        socket.handshake.query['user-id'] != 'null' &&
        socket.handshake.query['user-id'] != 'NaN' &&
        socket.handshake.query['user-id']) ||
      `${Date.now()}-${uuid.v4()}`;

    if (users.findClient(token) && !users.findClient(token).disconnectTimeout) {
      if (users.findClient(token).socket.isAlive) users.findClient(token).socket.emit('new_session');
      disconnect(users, token);
    }

    socket.isAlive = true;

    socket.emit('connection_success', token);

    let currentUser = users.findClient(token);

    if (!currentUser || !currentUser.disconnectTimeout) {
      users.addClient(socket, token);
      users.incrementOnline();
      currentUser = users.findClient(token);
      console.log('User Connected! Total Users Online: %d', users.getOnline());
    } else {
      currentUser.socket = socket;
      clearTimeout(currentUser.disconnectTimeout);
      currentUser.disconnectTimeout = null;
      if (currentUser.partner) {
        const currentPartner = users.findClient(currentUser.partner);
        currentUser.socket.emit('reconnect_to_partner', {
          gender: currentPartner.preferences.user.gender,
          species: currentPartner.preferences.user.species,
          kinks: currentPartner.preferences.kinks.join(', '),
          role: currentPartner.preferences.user.role
        });
      }
    }

    socket.on('send_contributor_key', (code) => {
      if (code != process.env.CONTRIBUTOR_KEY) return;
      socket.emit('contributor_key_accepted');
      currentUser.isContributor = true;
    });

    socket.on('remove_contributor_tag', () => {
      if (!currentUser.contributor) return;
      currentUser.isContributor = false;
      socket.emit('contributor_tag_removed');
    });

    socket.on('find_partner', (preference) => {
      find_partner(users, token, preference);
    });

    socket.on('block_partner', () => {
      block_partner(users, token);
    });

    socket.on('typing', (status) => {
      typing(users, token, status);
    });

    socket.on('send_message', (message) => {
      send_message(users, token, message);
    });

    socket.on('disconnect_from_partner', () => {
      const partner = users.findClient(currentUser.partner);

      if (!partner) {
        return;
      }

      if (partner.socket.isAlive) {
        partner.socket.emit('partner_left');
      }

      users.removePartner(currentUser.id);

      currentUser.socket.emit('client_disconnect');
    });

    socket.on('disconnect', () => {
      socket.isAlive = false;
      currentUser.disconnectTimeout = setTimeout(() => {
        disconnect(users, token);
      }, 10000); // We give them 10 second to reconnect.
    });

    io.sockets.emit('update_user_count', users.getOnline());
  });
};
