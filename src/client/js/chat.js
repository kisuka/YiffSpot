'use strict';

const user = require('./user');
const util = require('./util');

/**
 * Append message to chat box.
 * 
 * @param String message The message to append.
 * @param Object options Various options.
 */
function addChatMessage(message, options)  {
  var msg = util.linkify(util.strip_tags(message));
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
 * Hides welcome message and displays chat box.
 */
function showChatBox() {
  document.getElementById('welcome').style.display = 'none';
  document.getElementById('chat').style.display = 'block';
}

/**
 * [invalidLinkMessage description]
 * @return {[type]} [description]
 */
function invalidLinkMessage() {
  alert('You have attempted to submit a possible malicious link.');
  return false;
}

/**
 * [sendMessage description]
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function sendMessage(socket) {
  var message = document.getElementById('message');

  if (message.value.length <= 0) {
    alert('Please enter a message.');
    return false;
  }

  if (message.value.length >= 3000) {
    alert('Please shorten the length of your message.');
    return false;
  }

  if (user.getPartner() === false) {
    message.value = '';
    alert('You are not connected to a partner yet.');
    return false;
  }

  sendTypingStatus(socket, false);
  socket.send(JSON.stringify({type:'send_message', data: message.value}));

  addChatMessage(message.value, {class: 'message-user'});
  message.value = '';
}

function sendStatusMessage(socket, message) {
  if (user.getPartner() === false) {
    return false;
  }

  sendTypingStatus(socket, false);
  socket.send(JSON.stringify({type:'send_message', data: message}));

  addChatMessage(message, {class: 'message-user'});
}

function sendButtplugMessage(socket, message) {
  // Valid buttplug commands shouldn't be shown in chat on either side.
  if (user.getPartner() === false) {
    return false;
  }

  sendTypingStatus(socket, false);
  socket.send(JSON.stringify({type:'send_message', data: message}));
}

/**
 * [sendTypingStatus description]
 * @return {[type]} [description]
 */
function sendTypingStatus(socket, status = true) {
  if (user.getPartner()) {
    socket.send(JSON.stringify({type:'typing', data: status}));
  }
}

module.exports = {
  addChatMessage: addChatMessage,
  showChatTyping: showChatTyping,
  hideChatTyping: hideChatTyping,
  showChatBox: showChatBox,
  invalid: invalidLinkMessage,
  sendMessage: sendMessage,
  sendStatusMessage: sendStatusMessage,
  sendButtplugMessage: sendButtplugMessage,
  sendTypingStatus: sendTypingStatus,
};
