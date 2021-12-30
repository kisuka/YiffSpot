const users = require('../models/users');

const send_message = require('./send-message'),
  typing = require('./is-typing'),
  find_partner = require('./find-partner'),
  block_partner = require('./block-partner'),
  disconnect = require('./disconnect');

const uuid = require('uuid'),
  util = require('util'),
  crypto = require('crypto');

const randomBytesAsync = util.promisify(crypto.randomBytes);

module.exports = (io) => {

  const randomUserId = () => {
    return `${Date.now()}-${uuid.v4()}`;
  }

  const randomSecret = async () => {
    return (await randomBytesAsync(512)).toString('hex');
  }


  const getData = async (socket) => {
    return {
      userId:
        (socket.handshake.query['user-id'] != undefined && !['', 'undefined', 'null', 'NaN'].includes(socket.handshake.query['user-id'])) ? socket.handshake.query['user-id'] : randomUserId(),
      secret:
        (socket.handshake.query['secret'] != undefined && !['', 'undefined', 'null', 'NaN'].includes(socket.handshake.query['secret'])) ? socket.handshake.query['secret'] : (await randomSecret())
    }
  }

  // Establish web socket connection
  io.on('connection', async (socket) => {
    const userData = await getData(socket);
    let userId = userData.userId;
    let secret = userData.secret;
    let currentUser = users.findClient(userId);
    if (currentUser) {
      if (currentUser.secret != secret) {
        userId = randomUserId();
        currentUser = null;
      } else if (!currentUser.disconnectTimeout) {
        if (currentUser.socket.isAlive) currentUser.socket.emit('new_session');
        disconnect(users, userId);
      }
    }

    socket.isAlive = true;

    socket.emit('connection_success', { userId, secret });

    if (!currentUser || !currentUser.disconnectTimeout) {
      users.addClient(socket, userId, secret);
      users.incrementOnline();
      currentUser = users.findClient(userId);
      console.log('User Connected! Total Users Online: %d', users.getOnline());
    } else {
      currentUser.socket = socket;
      clearTimeout(currentUser.disconnectTimeout);
      currentUser.disconnectTimeout = null;
      if (currentUser.partner) {
        /*
        const currentPartner = users.findClient(currentUser.partner);
        {
          gender: currentPartner.preferences.user.gender,
          species: currentPartner.preferences.user.species,
          kinks: currentPartner.preferences.kinks.join(', '),
          role: currentPartner.preferences.user.role
        }
        */
        currentUser.socket.emit('reconnect_to_partner');
      }
    }

    socket.on('send_contributor_key', (code) => {
      if (code != process.env.CONTRIBUTOR_KEY || process.env.CONTRIBUTOR_KEY == "") return;
      socket.emit('contributor_key_accepted');
      currentUser.isContributor = true;
    });

    socket.on('remove_contributor_tag', () => {
      if (!currentUser.contributor) return;
      currentUser.isContributor = false;
      socket.emit('contributor_tag_removed');
    });

    socket.on('find_partner', (preference) => {
      find_partner(users, userId, preference);
    });

    socket.on('block_partner', () => {
      block_partner(users, userId);
    });

    socket.on('typing', (status) => {
      typing(users, userId, status);
    });

    socket.on('send_message', (message) => {
      send_message(users, userId, message);
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
        disconnect(users, userId);
        io.sockets.emit('update_user_count', users.getOnline());
      }, 10000); // We give them 10 second to reconnect.
    });

    io.sockets.emit('update_user_count', users.getOnline());
  });
};
