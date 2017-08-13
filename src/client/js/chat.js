'use strict';

var notify;
var system;
var partner;
var socket;

/**
 * Sends message to server to send it to partner.
 */
function sendMessage() {
  var message = document.getElementById('message');
  
  if (message.value.length <= 0) {
    alert('Please enter a message.');
    return false;
  }

  if (message.value.length >= 3000) {
    alert('Please shorten the length of your message.');
    return false;
  }
  
  if (partner.hasPartner === false) {
    message.value = '';
    alert('You are not connected to a partner yet.');
    return false;
  }

  socket.emit('typing', false);
  socket.emit('send_message', message.value);
  addChatMessage(message.value, {class: 'message-user'});
  message.value = '';
}

/**
 * Append message to chat box.
 * 
 * @param String message The message to append.
 * @param Object options Various options.
 */
function addChatMessage(message, options)  {
  var msg = linkify(strip_tags(message));
  var messages = document.getElementById('messages');
  var newMessage = document.createElement("li");

  newMessage.className += 'message ';
  newMessage.className += options.class;
  newMessage.innerHTML = msg;

  messages.insertBefore(newMessage, messages.lastChild);
  messages.scrollTop = messages.scrollHeight;
}

/**
 * Shows the partner is typing message.
 */
function showChatTyping() {
  document.getElementById('typing').style.display = 'block';
}

/**
 * Hides the partner is typing message.
 */
function hideChatTyping() {
  document.getElementById('typing').style.display = 'none';
}

/**
 * Converts URLs to links.
 * @param  String text The text to parse.
 * @return String      The converted text.
 */
function linkify(text) {
  if (text) {
    text = text.replace(
      /((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi,
      function(url){
        var full_url = url;
        if (!full_url.match('^https?:\/\/')) {
            full_url = 'http://' + full_url;
        }
        return '<a href="' + full_url + '" target="_blank">' + url + '</a>';
      }
    );
  }

  return text;
}

/**
 * Strips tags from string.
 * @param  String text The raw string.
 * @return String      The cleaned string.
 */
function strip_tags(text) {
  return text.replace(/(<([^>]+)>)/ig, "");
}


// =============================================================================
// Event Listeners
// =============================================================================

function init() {
  notify = require('./alert');
  system = require('./system');
  partner = require('./partner');
  socket = system.io;
  
  var messageBoxElement = document.getElementById("messageBox");

  /**
   * Listen for when user submits their message.
   */
  messageBoxElement.addEventListener("submit", function(e) {
    e.preventDefault();
    sendMessage();
  });

  /**
   * Listen for when user begins typing in message box.
   */
  messageBoxElement.addEventListener("input", function(e) {
    socket.emit('typing', true);
  });

  /**
   * User's partner is currently typing.
   */
  socket.on('partner_typing', (data) => {
    if (data.status) {
      showChatTyping();
    } else {
      hideChatTyping();
    }
  });

  /**
   * User has received a new message from their partner.
   */
  socket.on('receive_message', (data) => {
    addChatMessage(data.message, {class: 'message-partner'});
    notify.alertUser("New Message");
  });

  /**
   * Displays error message that user tried to submit malicious links.
   */
  socket.on('invalid_links', () => {
    alert(''+
      'You have attempted to submit a possible malicious link. '+
      'Please only use known image sites.'
    );

    return false;
  });
}

module.exports = {
	init: init,
  addChatMessage: addChatMessage,
  showChatTyping: showChatTyping,
  hideChatTyping: hideChatTyping,
};