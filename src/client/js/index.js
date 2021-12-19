const io = require('./../../../node_modules/socket.io/client-dist/socket.io.min.js');

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

const socket = io(window.location.origin, {
  query: {
    'user-id': user.getId(),
  }
});

// Server responses

socket.on('connection_success', (id) => {
  user.setId(id);
});

socket.on('new_session', () => {
  chat.addChatMessage('You have disconnected from your partner because you open YiffSpot from another place.', {
    class: 'message-system'
  });
  toast.toast('You have been disconnected', 'bg-danger');
  document.getElementById('userCount').innerText = '0';
});

socket.on('update_user_count', (count) => {
  document.getElementById('userCount').innerText = count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});

socket.on('receive_message', (message) => {
  chat.addChatMessage(message.content, { class: 'message-partner' + (message.isContributor ? " contributor" : "") });
});

socket.on('partner_typing', (status) => {
  if (status == true) chat.showChatTyping();
  else chat.hideChatTyping();
});

socket.on('partner_connected', (preference) => {
  partner.connected(preference);
});

socket.on('partner_disconnected', () => {
  partner.disconnected();
});

socket.on('partner_left', () => {
  partner.left();
});

socket.on('partner_blocked', () => {
  partner.blocked();
});

socket.on('partner_pending', () => {
  partner.pending();
});

socket.on('invalid_preferences', () => {
  preferences.invalid();
});

socket.on('already_finding_partner', () => {
  chat.addChatMessage('You are already looking for a partner.', {
    class: 'message-system'
  });
});

socket.on('preference_updated', () => {
  chat.addChatMessage('Your preference has been updated.', {
    class: 'message-system'
  });
});

socket.on('client_disconnect', () => {
  if (!document.getElementById("disconnect-row").classList.contains("hide-ele")) {
    document.getElementById("disconnect-row").classList.add("hide-ele");
  }
  chat.addChatMessage('You have disconnected from your partner.', {
    class: 'message-system'
  });
  user.setPartner(false);
});

socket.on('reconnect_to_partner', () => {
  chat.showChatBox();
  partner.reconnect();
});

socket.on('disconnect', () => {
  toast.toast('You have been disconnected from the server, Trying to reconnect.', 'bg-danger');
  document.getElementById('userCount').innerText = "0";
});

socket.on('contributor_key_accepted', () => {
  toast.toast('You have successfully tagged as a contributor.');
});

socket.on('contributor_tag_removed', () => {
  toast.toast('You have successfully removed your contributor tag.');
});

window.submitContributorKey = (key) => {
  socket.emit('send_contributor_key', key);
}

window.removeContributorTag = () => {
  socket.emit('remove_contributor_tag');
}

/**
 * Event Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
  chat.reloadChat();
  preferences.init();

  // When preferences menu button is clicked
  document.getElementById('menu').addEventListener('click', e => {
    e.preventDefault();
    preferences.toggleMenu();
  });

  // When message is submitted into chat
  document.getElementById('message').addEventListener('keydown', e => {
    if (e.key != 'Enter') {
      return;
    }
    chat.sendMessage(socket);
  });

  document.getElementById('clear-chat').addEventListener('click', e => {
    e.preventDefault();
    chat.clearChat();
  });

  // When key is pressed in message box / typing
  document.getElementById('messageBox').addEventListener('input', e => {
    e.preventDefault();
    chat.sendTypingStatus(socket);
  });

  // When user requests to find partner by submitting preferences
  document.getElementById("find-partner").addEventListener("click", e => {
    e.preventDefault();
    partner.find(socket);
  });

  // When block partner button is clicked
  document.getElementById('block-partner').addEventListener('click', e => {
    e.preventDefault();
    partner.block(socket);
  });

  document.getElementById('disconnect').addEventListener('click', e => {
    e.preventDefault();
    partner.disconnect(socket);
  });

  // Show Site Settings
  document.getElementById('settings').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('userPrefs').classList.toggle('hide-ele');
    document.getElementById('siteSettings').classList.toggle('hide-ele');
  });

  // Show Preferences Settings
  document.getElementById('preferences').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('siteSettings').classList.toggle('hide-ele');
    document.getElementById('userPrefs').classList.toggle('hide-ele');
  });

  window.onbeforeunload = () => {
    user.setPartner(false);
  }
});
