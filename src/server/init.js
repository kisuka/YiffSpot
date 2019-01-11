'use strict';

const users = require('../models/users');
const uuid = require('uuid');
const url = require('url');

const broadcast = require('./broadcast');
const send_message = require('./send-message');
const typing = require('./is-typing');
const find_partner = require('./find-partner');
const block_partner = require('./block-partner');
const disconnect = require('./disconnect');

module.exports = function (wss) {
  // Establish web socket connection
  wss.on('connection', function(ws, req) {
    if (req.headers.origin != process.env.HOST) {
      return ws.terminate();
    }

    ws.isAlive = true;

    var request = url.parse(req.url, true);
  	var token = (request.query.id != undefined && request.query.id != "null" && request.query.id) || uuid.v4();

    // Check if user already has an established connection
    if (users.findClient(token)) {
      if (ws.readyState == 1) {
        ws.send(JSON.stringify({type: 'connection_exists', data: true}));
      }
      return false;
    }

    ws.clientId = token;
  	users.addClient(ws, token);
  	users.incrementOnline();

    // Send unique ID to client
    if (ws.readyState == 1) {
      ws.send(JSON.stringify({type: 'connection_success', data: token}));
    }

    // Update user count
  	broadcast(wss.clients, {type: "update_user_count", data: users.getOnline()});
  	console.log('User Connected! Total Users Online: %d', users.getOnline());

    // Client requests
    ws.on('message', function incoming(message) {
      const data = JSON.parse(message);

      switch(data.type) {
        case "find_partner":
          find_partner(users, token, data.data);
        break;
        case "block_partner":
          block_partner(users, token);
        break;
        case "typing":
          typing(users, token, data.data);
        break;
        case "send_message":
          send_message(users, token, data.data);
        break;
      }
    });

    // Error
    ws.on('error', (e) => {
      // Ignore network errors like ECONNRESET, EPIPE, etc
      if (e.errno) return;
      throw e;
    });

    // Closed
    ws.on('close', function closed(e) {
      disconnect(users, token);
      broadcast(wss.clients, {type: "update_user_count", data: users.getOnline()});
      console.log('User Disconnected! Total Users Online: %d', users.getOnline());
    });

    // Heartbeat
    ws.on('pong', function heartbeat() {
      this.isAlive = true;
    });
  });

  // Heartbeat
  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping('', false, true);
    });
  }, 30000);
};