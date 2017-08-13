'use strict';

var notify = require('./alert');
var chat = require('./chat');
var user = require('./user');
var socket = io();

function init() {
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

  socket.on('reconnecting', (attemptNumber) => {
    chat.addChatMessage('Please wait... Attempting to reconnect you to Yiff Spot.', {
      class: 'message-system'
    });
  });
  
  socket.on('disconnect', (reason) => {
    chat.addChatMessage('You have disconnected from Yiff Spot.', {
      class: 'message-system'
    });
    
    user.data.hasPartner = false;

    console.log(reason);
  });
}

module.exports = {
	init: init,
  io: socket,
};