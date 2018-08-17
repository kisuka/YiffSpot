'use strict';

const chat = require('./chat');
const partner = require('./partner');
const preferences = require('./preferences');
const user = require('./user');
const buttplug = require('./buttplug');

// Initalize user client information
user.init();

// Create connection to server
const socket = new WebSocket(''+(location.protocol.indexOf('https') === 0 ? 'wss' : 'ws')+'://'+location.hostname+(location.port ? ':'+location.port : '')+'?id='+user.getId());

// Server responses
socket.addEventListener('close', function (event) {
  user.setPartner(false);
});

socket.addEventListener('error', function (event) {
  console.log('Error: '+event);
});

socket.addEventListener('message', async function (event) {
  const response = JSON.parse(event.data);

  switch(response.type) {
    case 'connection_success':
      user.setId(response.data);
    break;
    case 'connection_exists':
      alert('You already have an active session.');
      return false;
    break;
    case 'update_user_count':
      document.getElementById('userCount').innerText = response.data;
    break;
    case 'receive_message':
      if (!(await buttplug.parseMessage(response.data))) {
        chat.addChatMessage(response.data, {class: 'message-partner'});
      }
      break;
    case 'connection_exists':
      alert('You already have an active session.');
      return false;
      break;
    case 'update_user_count':
      document.getElementById('userCount').innerText = response.data;
      break;
    case 'partner_typing':
      if (response.data == true) {
        chat.showChatTyping();
      } else {
        chat.hideChatTyping();
      }
      break;
    case 'partner_connected':
      partner.connected(response.data);
      // All Buttplug calls in this function are considered noops if
      // buttplug.init() has not been called.
      buttplug.enableDeviceSharing();
      break;
    case 'partner_disconnected':
		  partner.disconnected();
      // Here and below, whenever a partner leaves for some reason, we need to
      // make sure Buttplug cleans up its device UI, stops devices, and disables sharing
      // until we reconnect.
      buttplug.removeDeviceControls();
      buttplug.disableDeviceSharing();
      break;
    case 'partner_left':
      partner.left();
      buttplug.removeDeviceControls();
      buttplug.disableDeviceSharing();
      break;
    case 'partner_blocked':
      partner.blocked();
      buttplug.removeDeviceControls();
      buttplug.disableDeviceSharing();
      break;
    case 'partner_pending':
      partner.pending();
      buttplug.removeDeviceControls();
      buttplug.disableDeviceSharing();
      break;
    case 'invalid_links':
      chat.invalid();
      break;
    case 'invalid_preferences':
      preferences.invalid();
      break;
    case 'ping':
      break;
  }
});

/**
 * Event Listeners
 */
document.addEventListener('DOMContentLoaded', preferences.init);

// When preferences menu button is clicked
document.getElementById('menu').addEventListener('click', preferences.toggleMenu);

// When save preferences button is clicked
document.getElementById('savePref').addEventListener('click', preferences.save);

// When message is submitted into chat
document.getElementById('messageBox').addEventListener('submit', function(e) {
  e.preventDefault();
  chat.sendMessage(socket);
});

// When key is pressed in message box / typing
document.getElementById('messageBox').addEventListener('input', function(e) {
  e.preventDefault();
  chat.sendTypingStatus(socket);
});

// When user requests to find partner by submitting preferences
document.getElementById('userSettings').addEventListener('submit', function(e) {
  e.preventDefault();
  partner.find(socket);
});

// When block partner button is clicked
document.getElementById('block-partner').addEventListener('click', function(e) {
  e.preventDefault();
  partner.block(socket);
});

// Show Site Settings
document.getElementById('settings').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('userPrefs').classList.toggle("hide-ele");
  document.getElementById('siteSettings').classList.toggle("hide-ele");
});

// Show Preferences Settings
document.getElementById('preferences').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('siteSettings').classList.toggle("hide-ele");
  document.getElementById('userPrefs').classList.toggle("hide-ele");
});

// When save settings button is clicked
document.getElementById('saveSettings').addEventListener('click', preferences.saveSettings);

// Handle when window is closed
window.addEventListener('beforeunload', function () {
  socket.close();
});

// Initialize Buttplug. To remove access to buttplug from the client, just
// comment out this line.

buttplug.init(socket);
