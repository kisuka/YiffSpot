import 'bootstrap';
import '../assets/apple-touch-icon.png';
import '../assets/favicon.ico';
import '../assets/logo.png';
import '../assets/notification.mp3';
import '../scss/app.scss';

const chat = require('./chat'),
  partner = require('./partner'),
  preferences = require('./preferences'),
  user = require('./user'),
  toast = require('./toast');

// Initalize user client information
user.init();

// Create connection to server
const socket = new WebSocket(
  '' +
    (location.protocol == 'https:' ? 'wss' : 'ws') +
    '://' +
    location.hostname +
    (location.port ? ':' + location.port : '') +
    '?id=' +
    user.getId()
);

let interval;

// Heartbeat
socket.onopen = () => {
  interval = setInterval(() => {
    socket.send(JSON.stringify({ type: 'ping', data: true }));
  }, 10000)
}

// Server responses
socket.onclose = () => {
  if (interval) clearInterval(interval);
  user.setPartner(false);
  toast.toast("You have been disconnected from the server, Please refresh the page.", 'bg-danger');
  document.getElementById('userCount').innerText = "0";
};

socket.onerror = (event) => {
  console.log('Error: ' + event);
};

socket.onmessage = (event) => {
  const response = JSON.parse(event.data);

  switch(response.type) {
    case 'connection_success':
      user.setId(response.data);
      break;

    case 'connection_exists':
      toast.toast('You already have an active session.');
      return false;

    case 'update_user_count':
      document.getElementById('userCount').innerText = response.data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      break;

    case 'receive_message':
      chat.addChatMessage(response.data, {class: 'message-partner'});
      break;

    case 'partner_typing':
      if (response.data == true) chat.showChatTyping();
      else chat.hideChatTyping();
      break;

    case 'partner_connected':
      partner.connected(response.data);
      break;

    case 'partner_disconnected':
      partner.disconnected();
      break;

    case 'partner_left':
      partner.left();
      break;

    case 'partner_blocked':
      partner.blocked();
      break;

    case 'partner_pending':
      partner.pending();
      break;

    case 'invalid_preferences':
      preferences.invalid();
      break;
    case 'client_disconnect':
      if (!document.getElementById("disconnect-row").classList.contains("hide-ele")) {
          document.getElementById("disconnect-row").classList.add("hide-ele");
      }
      chat.addChatMessage('You have disconnected from your partner.', {
          class: 'message-system'
      });
      user.setPartner(false);
      break;
  }
};

/**
 * Event Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
  preferences.init();

  // When preferences menu button is clicked
  document.getElementById('menu').addEventListener('click', preferences.toggleMenu);

  // When message is submitted into chat
  document.getElementById('message').addEventListener('keydown', e => {
    if (e.key != 'Enter') {
      return;
    }
    chat.sendMessage(socket);
  });

  // When key is pressed in message box / typing
  document.getElementById('messageBox').addEventListener('input', function(e) {
    e.preventDefault();
    chat.sendTypingStatus(socket);
  });

  // When user requests to find partner by submitting preferences
  document.getElementById("find-partner").addEventListener("click", e => {
    e.preventDefault();
    partner.find(socket);
  });

  // When block partner button is clicked
  document.getElementById('block-partner').addEventListener('click', function(e) {
    e.preventDefault();
    partner.block(socket);
  });

  document.getElementById('disconnect').addEventListener('click', e => {
    e.preventDefault();
    partner.disconnect(socket);
  });

  // Show Site Settings
  document.getElementById('settings').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('userPrefs').classList.toggle('hide-ele');
    document.getElementById('siteSettings').classList.toggle('hide-ele');
  });

  // Show Preferences Settings
  document.getElementById('preferences').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('siteSettings').classList.toggle('hide-ele');
    document.getElementById('userPrefs').classList.toggle('hide-ele');
  });

  // Handle when window is closed
  window.addEventListener('beforeunload', () => socket.close());
});
