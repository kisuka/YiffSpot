'use strict';

var Cookies = require('./../../../node_modules/js-cookie/src/js.cookie');

var chat = require("./chat");

/**
 * System Listeners
 * 
 * @param  {[type]} socket [description]
 * @param  {[type]} user   [description]
 * @return {[type]}        [description]
 */
function listen(socket, user) {
  socket.on('update_user_count', (count) => {
    document.getElementById('userCount').innerText = count;
  });

  socket.on('connect_error', (error) => {
    chat.addChatMessage('You could not be connected to Yiff Spot.', {
      class: 'message-system'
    });
  });

  socket.on('connect_timeout', (timeout) => {
    chat.addChatMessage('Your connection to Yiff Spot has timed out.', {
      class: 'message-system'
    });
  });

  socket.on('error', (error) => {
    chat.addChatMessage('There was an issue with your connection to Yiff Spot.', {
      class: 'message-system'
    });
  });

  socket.on('reconnect', (attemptNumber) => {
    chat.addChatMessage('You have been reconnected to Yiff Spot.', {
      class: 'message-system'
    });
  });

  socket.on('connection_established', (id) => {
    Cookies.set('token', id, {expires: 1});
  });

  socket.on('connection_exists', () => {
    alert('You already have an active session on Yiff Spot.');
    user.allow = false;
  });

  socket.on('reconnecting', (attemptNumber) => {
    chat.addChatMessage('Please wait... Attempting to reconnect you to Yiff Spot.', {
      class: 'message-system'
    });
  });

  socket.on('disconnect', (reason) => {
    chat.addChatMessage('You have disconnected from Yiff Spot.', {
      class: 'message-system'
    });
    
    user.hasPartner = false;

    console.log(reason);
  });
}

module.exports = {
  listen: listen,
};