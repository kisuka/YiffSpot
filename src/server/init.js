const users = require('../models/users'),
  uuid = require('uuid'),
  url = require('url');

const broadcast = require('./broadcast'),
  send_message = require('./send-message'),
  typing = require('./is-typing'),
  find_partner = require('./find-partner'),
  block_partner = require('./block-partner'),
  disconnect = require('./disconnect');

module.exports = wss => {
  // Establish web socket connection
  wss.on('connection', (client, req) => {
    const request = url.parse(req.url, true);
    const token =
      (request.query.id != undefined &&
        request.query.id != 'null' &&
        request.query.id != 'NaN' &&
        request.query.id) ||
      `${Date.now()}-${uuid.v4()}`;

    client.isAlive = true;
    client.clientId = token;

    const existingUser = users.findClient(token);

    // Check if user already has an established connection
    if (existingUser && client.readyState == 1) {
      client.send(JSON.stringify({ type: 'connection_exists', data: true }));
      return client.terminate();
    }
    
    users.addClient(client, token);
    users.incrementOnline();

    // Send unique ID to client
    if (client.readyState == 1) {
      client.send(JSON.stringify({ type: 'connection_success', data: token }));
    }

    // Update user count
    broadcast(wss.clients, {
      type: 'update_user_count',
      data: users.getOnline()
    });

    console.log('User Connected! Total Users Online: %d', users.getOnline());

    // Client requests
    client.on('message', message => {
      client.isAlive = true;

      try {
        const data = JSON.parse(message);

        if (!data.type) {
          return;
        }

        switch(data.type) {
          case 'find_partner':
            find_partner(users, token, data.data);
            break;

          case 'block_partner':
            block_partner(users, token);
            break;

          case 'typing':
            typing(users, token, data.data);
            break;

          case 'send_message':
            send_message(users, token, data.data);
            break;

          case 'disconnect':
            const currentUser = users.findClient(token);
            const partner = users.findClient(currentUser.partner);

            if (!partner) {
              return;
            }

            if (users[partner.id] && users[partner.id].partner && partner.socket.readyState == 1) {
              partner.socket.send(JSON.stringify({ type: 'partner_left', data: true }));
            }
            
            currentUser.previousPartner = partner.id;
            partner.previousPartner = currentUser.id;
            
            users.removePartner(currentUser.id);
            
            if (currentUser.socket.readyState == 1) {
              currentUser.socket.send(JSON.stringify({ type: 'client_disconnect', data: true }));
            }
            break;
        }
      } catch (e) {
        console.log(e);
        console.warn(`"${client.clientId}" tries to send invalid message!`);
      }
    });

    // Error
    client.on('error', err => {
      // Ignore network errors like ECONNRESET, EPIPE, etc
      if (err.errno) return;
      else throw err;
    });

    // Closed
    client.on('close', () => {
      disconnect(users, token);

      broadcast(wss.clients, {
        type: 'update_user_count',
        data: users.getOnline()
      });

      console.log('User Disconnected! Total Users Online: %d', users.getOnline());
    });
  });

  // Heartbeat
  const interval = setInterval(() => {
    wss.clients.forEach(ws => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', function close() {
    clearInterval(interval);
  });
};
