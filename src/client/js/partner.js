'use strict';

var notify;
var chat;
var system;
var user;
var socket;

/**
 * Hides welcome message and displays chat box.
 */
function showChatBox() {
  document.getElementById('welcome').style.display = 'none';
  document.getElementById('chat').style.display = 'block';
}

/**
 * Submits user's preferences to server and starts partner search.
 */
function findPartner() {
  user.data.hasPartner = false;

  var gender       = document.getElementById('userGender').value;
  var species      = document.getElementById('userSpecies').value;
  var role         = document.getElementById('userRole').value;
  var kinks        = document.getElementById('userKinks');
  var matchGender  = document.getElementById('partnerGender');
  var matchSpecies = document.getElementById('partnerSpecies');
  var matchRole    = document.getElementById('partnerRole').value;
  
  var selectedKinks = [];
  var selectedGenders = [];
  var selectedSpecies = [];
  
  if (gender === '') {
    alert('Please select your gender.');
    return false;
  }

  if (species === '') {
    alert('Please select your species.');
    return false;
  }

  if (role === '') {
    alert('Please select your role.');
    return false;
  }

  if (!matchGender) {
    alert("Please select the gender you're seeking.");
    return false;
  }

  if (!matchSpecies) {
    alert("Please select the species you're seeking.");
    return false;
  }

  if (!matchRole) {
    alert("Please select the role you're seeking.");
    return false;
  }

  if (!kinks) {
    alert("Please select the kinks you're interested in.");
    return false;
  }
  
  for (var i=0; i<kinks.options.length; i++) {
    if (kinks.options[i].selected) {
      selectedKinks.push(kinks.options[i].value);
    }
  }
  
  for (var i=0; i<matchGender.options.length; i++) {
    if (matchGender.options[i].selected) {
      selectedGenders.push(matchGender.options[i].value);
    }
  }
  
  for (var i=0; i<matchSpecies.options.length; i++) {
    if (matchSpecies.options[i].selected) {
      selectedSpecies.push(matchSpecies.options[i].value);
    }
  }

  socket.emit('find_partner', {
    'user': {
      'gender': gender,
      'species': species,
      'role': role
    },
    'partner': {
      'gender': selectedGenders,
      'species': selectedSpecies,
      'role': matchRole
    },
    'kinks': selectedKinks,
  });
  
  showChatBox();
}


// =============================================================================
// Event Listeners
// =============================================================================

function init() {
  notify = require('./alert');
  chat = require('./chat');
  system = require('./system');
  user = require('./user');
  socket = system.io;

  /**
   * Displays to user that they have been connected to a partner and
   * their information.
   */
  socket.on('partner_connected', (data) => {
    showChatBox();

    chat.addChatMessage('You have been connected with a yiffing partner.', {
      class: 'message-system'
    });

    chat.addChatMessage(''+
      'Your partner is a '+data.role+', '+data.gender+', '+data.species+' '+
      'interested in: '+data.kinks+'.',
    {class: 'message-system'});
    
    user.data.hasPartner = true;
   
    notify.alertUser("Partner Connected");
  });
  
  /**
   * Displays to user that their partner has disconnected from them.
   */
  socket.on('partner_disconnected', () => {
    chat.addChatMessage('Your yiffing partner has disconnected unexpectedly.', {
      class: 'message-system'
    });

    chat.hideChatTyping();
    notify.alertUser("Partner Disconnected");
    user.data.hasPartner = false;
  });

  /**
   * Displays to user that their partner has left from them purposefully.
   */
  socket.on('partner_left', () => {
    chat.addChatMessage('Your yiffing partner has left.', {
      class: 'message-system'
    });

    chat.hideChatTyping();
    notify.alertUser("Partner Left");
    user.data.hasPartner = false;
  });

  /**
   * Displays to user that their partner has been successfully blocked.
   */
  socket.on('partner_blocked', () => {
    if (user.data.hasPartner == true) {
      user.data.hasPartner = false;

      chat.addChatMessage('Your partner has been blocked and disconnected from you.', {
        class: 'message-system'
      });
    } else {
      chat.addChatMessage('Your previous partner has been blocked.', {
        class: 'message-system'
      });
    }
    
    chat.hideChatTyping();
  });

  /**
   * Displays message to user that system is looking for a partner.
   */
  socket.on('partner_pending', () => {
    showChatBox();

    chat.addChatMessage(''+
    'We are looking for a partner to match you with. '+
    'Please either continue to wait, or modify your yiffing preferences.', {
      class: 'message-system'
    });
  });
  
  /**
   * Block current partner.
   * 
   * @param  Object e The click event.
   */
  document.getElementById('block-partner').onclick = function(e) {
    e.preventDefault();

    if (!confirm('Are you sure you want to block this partner?')) {
      return false;
    }

    socket.emit('block_partner');
  };
}

module.exports = {
	init: init,
  findPartner: findPartner,
  showChatBox: showChatBox
};